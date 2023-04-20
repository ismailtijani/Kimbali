"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const logger_1 = __importDefault(require("../library/logger"));
const app_1 = require("../config/app");
const errorHandler_1 = __importDefault(require("../middleware/errorHandler"));
class MongoDB {
    static connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield mongoose_1.default
                    .set("strictQuery", false)
                    .connect(app_1.mongoUrl, { retryWrites: true, w: "majority" });
                logger_1.default.info("DB Connection Successful");
                logger_1.default.info(`'''''''''''''''''''''''''`);
            }
            catch (error) {
                logger_1.default.error(`MongoDB connection error: ${error.name}`);
                errorHandler_1.default.handleError(error);
            }
        });
    }
}
exports.default = MongoDB.connect;
