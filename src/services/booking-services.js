const { StatusCodes } = require('http-status-codes');

const { BookingRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const axios = require('axios');
const { ServerConfig } = require("../config");
const db  = require("../models");

const bookingRepository = new BookingRepository();


async function creatBooking(data){
    try {
        const transaction = await db.sequelize.transaction(async (t) => {
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData = flight.data.data;
            if(data.noOfSeats > flightData.totalSeat){
                throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
            }
            const totalBillingAmount = flightData.price * data.noOfSeats;
            const bookingPayload = { ...data , totalCost: totalBillingAmount};
            const booking = await bookingRepository.createBooking(bookingPayload, t);
            return booking;
        });
        return transaction
    } catch (error) {
        if(error.explanation == "Not enough seats available"){
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a booking object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

module.exports = {
    creatBooking,
}