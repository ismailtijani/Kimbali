"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const errorClass_1 = __importDefault(require("../library/errorClass"));
const interfaces_1 = require("../library/interfaces");
const upload = (0, multer_1.default)({
    limits: {
        fileSize: 2000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(png|jpg|jpeg)$/)) {
            return cb(new errorClass_1.default({
                message: "Invalid file format, Please upload an Image",
                statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST
            }));
        }
        cb(null, true);
    }
});
exports.default = upload;
