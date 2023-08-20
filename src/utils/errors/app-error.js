class AppError extends Error {
    constructor(message, statusCode){
        super(message);
        this.statusCode = statusCode;
        this.explanation = message;
    }
}

module.exports = AppError;

// structure of AppError object
// {
// Error.name = 'AppError', 
// Error.message = 'Validation isAlphanumeric on modelNumber failed',
// Error.stack = 'at Object.createAirplane (D:\OneDrive\Desktop\Flight\src\services\airplane-service.js:20:19)
// at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
// at async createAirplane (D:\OneDrive\Desktop\Flight\src\controllers\airplane-controller.js:10:26)'
//  {
// statusCode: 400,
// explanation: [ 'Validation isAlphanumeric on modelNumber failed' ]
// }
// }