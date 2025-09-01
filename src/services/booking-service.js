const axios = require("axios");
const { BookingRepository } = require("../repositories");
const db = require("../models");
const { ServerConfig } = require("../config");
const AppError = require("../utils/errors/app-error");
const { StatusCodes } = require("http-status-codes");
 const bookingRepository = new BookingRepository();
 const {ENUMS} = require('../utils/common')
 const {BOOKED} = ENUMS.Booking_Status
 const {Queue} = require('../config');
const { text } = require("express");

async function createBooking(data) {
    const transaction = await db.sequelize.transaction();
  try {
    const flight = await axios.get(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
    if (data.noOfSeats > flight.data.data.totalSeats) {
      throw new AppError(
        new AppError("Not enough seats availabe", StatusCodes.BAD_REQUEST)
      );

    }

    const totalBillingAmount = data.noOfSeats * flight.data.data.price;
    const bookingPayload = {...data, totalCost: totalBillingAmount };
    const booking = await bookingRepository.createBooking(bookingPayload, transaction);
    
      await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`,
      { seats: data.noOfSeats  }
    );

    await transaction.commit(); 

    return booking;

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
} 


async function makePayment(data){
  const transaction = await db.sequelize.transaction();
  try{
    const bookingDetails = await bookingRepository.get(data.bookingId, transaction);
    if(bookingDetails.status == 'CANCELLED'){
      throw new AppError('The booking is already cancelled' , StatusCodes.BAD_REQUEST)
    }
    if(bookingDetails.status == BOOKED){
      throw new AppError('The booking is already confirmed' , StatusCodes.BAD_REQUEST)
    }
    const bookingTime = new Date(bookingDetails.createdAt);
    const currentTime = new Date();
    const timeDiff = (currentTime - bookingTime) / (1000 * 60); // in minutes
    if(timeDiff > 30){
       await cancelBooking(data.bookingId) ;
      throw new AppError('Booking time exceeded. Please book again' , StatusCodes.BAD_REQUEST)
    }
    if(bookingDetails.totalCost != data.totalCost){
      throw new AppError('The amount of payment does not match' , StatusCodes.BAD_REQUEST)
    }
    if(bookingDetails.userId != data.userId){
      throw new AppError('The user correspond to booking does not match' , StatusCodes.BAD_REQUEST);
    }
    const response = await bookingRepository.update({ status: BOOKED }, data.bookingId, transaction);
     Queue.sendData({
      subject: 'BOOKING Successful ',
      recepientEmail: 'kuldeep0105yadav@gmail.com',
      text: 'Your booking is successful',
    });
     await transaction.commit();
    return response;


  }catch(error){
    await transaction.rollback();
    throw error;
  }
}


async function cancelBooking(bookingId){
  const transaction = await db.sequelize.transaction();
  try{
    const bookingDetails = await bookingRepository.get(bookingId, transaction);
    if(bookingDetails.status == 'CANCELLED'){
       await transaction.commit();
       return true;
    }
    console.log(bookingDetails)
    await axios.patch(
      `${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`,
      { seats: bookingDetails.noOfSeats , dec : 0  }
    );


    await bookingRepository.update( {status:'CANCELLED'} , bookingId , transaction )
    await transaction.commit();
    return true;
  }catch(error){
    await transaction.rollback();
    throw error;
  }
}


async function cancleOldBookings(){
   try {
    const time = new Date(Date.now() - 30*1000);
    const response = await bookingRepository.cancleOldBookings(time);
    return response;
   } catch (error) {
     console.log(error);
     throw error;
   }
}

module.exports = {
  createBooking,
  makePayment,
  cancleOldBookings
};
