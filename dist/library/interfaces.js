"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.responseStatusCodes = void 0;
var TransactionType;
(function (TransactionType) {
    TransactionType["CREDIT"] = "credit";
    TransactionType["DEBIT"] = "debit";
})(TransactionType || (TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["SUCCESS"] = "success";
    TransactionStatus["FAILURE"] = "failed";
})(TransactionStatus || (TransactionStatus = {}));
var responseStatusCodes;
(function (responseStatusCodes) {
    responseStatusCodes[responseStatusCodes["SUCCESS"] = 200] = "SUCCESS";
    responseStatusCodes[responseStatusCodes["CREATED"] = 201] = "CREATED";
    responseStatusCodes[responseStatusCodes["NO_CONTENT"] = 204] = "NO_CONTENT";
    responseStatusCodes[responseStatusCodes["MODIFIED"] = 304] = "MODIFIED";
    responseStatusCodes[responseStatusCodes["BAD_REQUEST"] = 400] = "BAD_REQUEST";
    responseStatusCodes[responseStatusCodes["UNAUTHORIZED"] = 401] = "UNAUTHORIZED";
    responseStatusCodes[responseStatusCodes["FORBIDDEN"] = 403] = "FORBIDDEN";
    responseStatusCodes[responseStatusCodes["NOT_FOUND"] = 404] = "NOT_FOUND";
    responseStatusCodes[responseStatusCodes["CONFLICT"] = 409] = "CONFLICT";
    responseStatusCodes[responseStatusCodes["UNPROCESSABLE"] = 422] = "UNPROCESSABLE";
    responseStatusCodes[responseStatusCodes["INTERNAL_SERVER_ERROR"] = 500] = "INTERNAL_SERVER_ERROR";
    responseStatusCodes[responseStatusCodes["NOT_IMPLEMENTED"] = 501] = "NOT_IMPLEMENTED";
})(responseStatusCodes = exports.responseStatusCodes || (exports.responseStatusCodes = {}));
