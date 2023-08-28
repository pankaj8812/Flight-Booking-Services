const { Op } = require("sequelize");

const CrudRepository = require("./crud-repository");
const { booking } = require("../models");
const {Enums} = require('../utils/common');
const { BOOKED, CANCELLED } = Enums.BOOKING_STATUS;

class BookingRepository extends CrudRepository{
    constructor(){
        super(booking);
    }

    async createBooking(data, transaction){
        const response = await booking.create(data, {transaction: transaction});
        return response;
    }

    async getBooking(data, transaction){
        const response = await booking.findByPk(data, {transaction: transaction});
        if(!response) {
            throw new AppError('Not able to fund the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    }

    async updateBooking(id , data, transaction){
        const response = await booking.update(data, {
                where: {
                    id: id
                }
            }, {transaction: transaction});

        if(response == 0) {
            throw new AppError('Not able to fund the resource', StatusCodes.NOT_FOUND);
        }
        return response;
    }
    
    async cancelOldBookings(timestamp) {
        const response = await booking.update({status: CANCELLED},{
            where: {
                [Op.and]: [
                    {
                        createdAt: {
                            [Op.lt]: timestamp
                        }
                    }, 
                    {
                        status: {
                            [Op.ne]: BOOKED
                        }
                    },
                    {
                        status: {
                            [Op.ne]: CANCELLED
                        }
                    }
                ]

            }
        });
        return response;
    }
}

module.exports = BookingRepository;