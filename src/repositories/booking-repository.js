const {StatusCodes} = require('http-status-codes')
const {Booking} = require('../models');
const CrudRepository = require('./crud-repository');
const { Op } = require('sequelize');
const { ENUMS} = require('../utils/common');
const {CANCELLED , BOOKED } = ENUMS.Booking_Status;

class BookingRepository extends CrudRepository {
    constructor(){
        super(Booking);
    }

    async createBooking(data, transaction){
        const response = await Booking.create(data, {transaction: transaction});
        return response;
    }


   async get(data , transaction){
  
        const response = await this.model.findByPk(data , {transaction: transaction});
        if(!response){
            throw new AppError('The required resource is not available', StatusCodes.NOT_FOUND);
        }
        return response;            
    }
  
      async update(data, id, transaction) {
       
            const response = await this.model.update(data, { where: { id: id }, transaction: transaction , returning: true });
            return response;
      
    }

    async cancleOldBookings(timestamp){
        const response = await this.model.update(
            { status: CANCELLED },
            {
                where: {
                    [Op.and]: [
                        { createdAt: { [Op.lt]: timestamp } },
                        { status: { [Op.ne]: BOOKED } },
                        { status: { [Op.ne]: CANCELLED } }
                    ]
                },
                returning: true
            }
        );
        return response;
    }
}
module.exports = BookingRepository;