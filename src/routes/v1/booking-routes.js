const express = require("express");

const { BookingController } = require("../../controllers");
// const { CityMiddlewares } = require("../../middlewares");

const router = express.Router();

// /api/v1/cities POST
router.post("/", 
    // CityMiddlewares.validateCreateRequest,
    BookingController.createBooking);

// /api/v1/cities POST
router.post("/payments", 
    // CityMiddlewares.validateCreateRequest,
    BookingController.makePayment);    


// // /api/v1/cities GET
// router.get("/", CityController.getCities);

// // /api/v1/cities/:id GET
// router.get("/:id", CityController.getCity);

// // /api/v1/cities/:id DELETE
// router.delete("/:id", CityController.destroyCity);

// // /api/v1/cities/:id PATCH
// router.patch("/:id", 
//     CityMiddlewares.validateUpdateRequest,
//     CityController.updateCity
// );


module.exports = router;