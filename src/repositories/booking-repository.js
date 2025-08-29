const {StatusCodes} = require('http-status-codes')
const {Booking} = require('../models');
const CrudRepository = require('./crud-repository');
const { Op } = require('sequelize');

class BookingRepository extends CrudRepository {
    constructor(){
        super(Booking);
    }
}
module.exports = BookingRepository;