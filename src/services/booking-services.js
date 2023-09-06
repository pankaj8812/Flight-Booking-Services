const { StatusCodes } = require('http-status-codes');

const { BookingRepository } = require("../repositories");
const AppError = require("../utils/errors/app-error");
const axios = require('axios');
const { ServerConfig, Queue } = require("../config");
const db  = require("../models");
const {Enums} = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

const bookingRepository = new BookingRepository();


async function creatBooking(data){
    try {
        console.log("Booking service :" , data);
        const transaction = await db.sequelize.transaction(async (t) => {
            const flight = await axios.get(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}`);
            const flightData = flight.data.data;
            if(data.noOfSeats > flightData.totalSeat){
                throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
            }
            const totalBillingAmount = flightData.price * data.noOfSeats;
            const bookingPayload = { ...data , totalCost: totalBillingAmount};
            const booking = await bookingRepository.createBooking(bookingPayload, t);
            await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${data.flightId}/seats`, {
                seats: data.noOfSeats
            });
            return booking;
        });
        return transaction;
    } catch (error) {
        console.log(error);
        if(error.explanation == "Not enough seats available"){
            throw new AppError('Not enough seats available', StatusCodes.BAD_REQUEST);
        }
        throw new AppError('Cannot create a booking object', StatusCodes.INTERNAL_SERVER_ERROR);
    }
}

async function makePayment(data){
    try {
        const transaction = await db.sequelize.transaction(async (t) => {
            const bookingDetails = await bookingRepository.getBooking(data.bookingId, t);
            console.log("booking Detail :",bookingDetails);
            if(bookingDetails.status == CANCELLED ){
                throw new AppError('The booking has expired', StatusCodes.INTERNAL_SERVER_ERROR);
            }

            const bookingTime = new Date(bookingDetails.createdAt);
            const currentTime = new Date();
           
            if(currentTime - bookingTime > 600000){
                await cancelBooking(data.bookingId);
                throw new AppError('The booking has expired due to time out', StatusCodes.BAD_REQUEST);
            }

            if(bookingDetails.totalCost != data.totalCost){
                throw new AppError('The amount of the payment doesnt match', StatusCodes.INTERNAL_SERVER_ERROR);
            }

            if(bookingDetails.userId != data.userId){
                throw new AppError('The user corresponding to the booking doesnt match', StatusCodes.INTERNAL_SERVER_ERROR);
            }
            
            await bookingRepository.updateBooking(data.bookingId, {status : BOOKED}, t);

            return true;
        });
        
        Queue.sendData({
            recepientEmail: 'pankajsharma376779@gmail.com',
            subject: 'Flight booked',
            text: `Booking successfully done for the booking ${data.bookingId}`
        })

        return transaction;
    } catch (error) {
        throw error;
    }
}


async function cancelBooking(bookingId){
    try {
        const transaction = await db.sequelize.transaction(async (t) => {
            const bookingDetails = await bookingRepository.getBooking(bookingId, t);

            if(bookingDetails.status == CANCELLED){
                return true;
            }

            await axios.patch(`${ServerConfig.FLIGHT_SERVICE}/api/v1/flights/${bookingDetails.flightId}/seats`, {
                seats: bookingDetails.noOfSeats,
                dec: false,
            });

            await bookingRepository.updateBooking(bookingId, {status: CANCELLED}, t);
        });
    } catch (error) {
        throw error;
    }

}

async function cancelOldBookings(){
    try {
        const time =  new Date( new Date - 1000 * 600); // time 10 mins ago
        const response = await bookingRepository.cancelOldBookings(time);
        console.log(response);
    } catch (error) {
        throw error
    }
}


module.exports = {
    creatBooking,
    makePayment,
    cancelOldBookings,
}