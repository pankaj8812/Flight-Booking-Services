const { StatusCodes } = require("http-status-codes");
const { BookingServices } = require("../services");
const { SuccessResponse, ErrorResponse } = require("../utils/common");

/**
 * POST : /cities 
 * req-body {name: 'London'}
 */

async function createBooking(req, res){
    try {
        const booking = await BookingServices.creatBooking({
            flightId: req.body.flightId,
            userId: req.body.userId,
            noOfSeats: req.body.noOfSeats
        });
        SuccessResponse.data = booking;
        return res.status(StatusCodes.CREATED)
                   .json(SuccessResponse);
    } catch (error) {
        ErrorResponse.error = error;
        return res.status(error.statusCode).json(ErrorResponse);
    }
}


module.exports = {
    createBooking,
}