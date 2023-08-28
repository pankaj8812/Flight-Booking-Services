const cron = require("node-cron");

const { BookingServices } = require('../../services');

function scheduleCrons() {
    cron.schedule("*/30 * * * *", async () => {  // every 30 min
        await BookingServices.cancelOldBookings();
    });
}

module.exports = scheduleCrons;