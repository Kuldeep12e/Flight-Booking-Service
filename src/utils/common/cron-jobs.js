const cron = require('node-cron')
const BookingService = require('../../services/booking-service') // <-- direct import

function scheduleCrons(){
    cron.schedule('*/30 * * * *' , async () => {
      await BookingService.cancleOldBookings();
     
    });
}

module.exports = scheduleCrons;
