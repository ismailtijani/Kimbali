"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../library/logger"));
const errorClass_1 = __importDefault(require("../library/errorClass"));
const interfaces_1 = require("../library/interfaces");
function validator(schema, property) {
  return (req, res, next) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
    });
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      const message = details.map((i) => i.message).join(",");
      logger_1.default.error(`${error.name}: ${error.message}`);
      throw new errorClass_1.default({
        message,
        statusCode: interfaces_1.responseStatusCodes.UNPROCESSABLE,
      });
    }
  };
}
exports.default = validator;
