const axios = require('axios')
const {BookingRepository} = require('../repositories')
const db = require('../models')
const {ServerConfig} = require('../config')
const AppError = require('../utils/errors/app-error')
const { StatusCodes } = require('http-status-codes')


async function createBooking(data){
    return new Promise((resolve , reject) =>{

        const result = db.sequelize.transaction(async function bookingImpl(t) {
            
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`)
            if(data.noOfSeats > flight.data.data.totalSeats){
                reject(new AppError("Not enough seats availabe" , StatusCodes.BAD_REQUEST));
            }

            resolve(true);
        });
        
    } )
   
}

module.exports={
    createBooking
}