"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const logger_1 = __importDefault(require("../library/logger"));
const errorClass_1 = __importDefault(require("../library/errorClass"));
const interfaces_1 = require("../library/interfaces");
class ErrorHandler {
  constructor() {
    this.handleTrustedError = (error, res) => {
      return res.status(error.statusCode).json({
        STATUS: "FAILURE",
        MESSAGE: error.message,
      });
    };
  }
  isTrustedError(error) {
    if (error instanceof errorClass_1.default) {
      return true;
    }
    return false;
  }
  handleError(error, res) {
    if (this.isTrustedError(error) && res) {
      this.handleTrustedError(error, res);
    } else {
      this.handleCriticalError(error, res);
    }
  }
  handleCriticalError(error, res) {
    if (res) {
      res.status(interfaces_1.responseStatusCodes.INTERNAL_SERVER_ERROR).json({
        STATUS: "FAILURE",
        ERROR: {
          name: error.name,
          message: "Internal Server Error",
        },
      });
    }
    logger_1.default.error(error);
    logger_1.default.warn("Application encountered a critical error. Exiting.....");
    process.exit(1);
  }
}
exports.ErrorHandler = ErrorHandler;
exports.default = new ErrorHandler();
