"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseHelper = void 0;
const interfaces_1 = require("./interfaces");
class responseHelper {
    static successResponse(res, DATA) {
        res.status(interfaces_1.responseStatusCodes.SUCCESS).json({
            STATUS: "SUCCESS",
            DATA
        });
    }
    static createdResponse(res, message, DATA) {
        res.status(interfaces_1.responseStatusCodes.CREATED).json({
            STATUS: "SUCCESS",
            MESSAGE: message,
            DATA
        });
    }
    static transactionSuccessResponse(res, DATA) {
        res.status(interfaces_1.responseStatusCodes.CREATED).json(DATA);
    }
}
exports.responseHelper = responseHelper;
