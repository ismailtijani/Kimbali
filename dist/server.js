"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importStar(require("./config/app"));
const http_1 = __importDefault(require("http"));
const logger_1 = __importDefault(require("./library/logger"));
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const errorClass_1 = __importDefault(require("./library/errorClass"));
const interfaces_1 = require("./library/interfaces");
// app
//   .listen(PORT, () => `Server is running 🚀🚀🚀 on port ${PORT}`)
//   .on("error", (error) => Logging.info(`Server Error: ${error}`));
const server = http_1.default
  .createServer(app_1.default)
  .listen(app_1.PORT, () =>
    logger_1.default.info(`Server is running 🚀🚀🚀 on port ${app_1.PORT}`)
  );
process.on("uncaughtException", (error) => {
  logger_1.default.error(`Uncaught Exception: ${error.stack}`);
  errorHandler_1.default.handleError(error);
});
process.on("unhandledRejection", (error) => {
  logger_1.default.error(`Unhandled Rejection: ${error.stack}`);
  throw new errorClass_1.default({
    name: error.name,
    message: error.message,
    statusCode: interfaces_1.responseStatusCodes.INTERNAL_SERVER_ERROR,
  });
});
exports.default = server;
