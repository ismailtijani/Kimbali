import app, { PORT } from "./config/app";
import http from "http";
import Logging from "./library/logger";
import errorHandler from "./middleware/errorHandler";
import AppError from "./library/errorClass";
import { responseStatusCodes } from "./library/types";

// app
//   .listen(PORT, () => `Server is running 🚀🚀🚀 on port ${PORT}`)
//   .on("error", (error) => Logging.info(`Server Error: ${error}`));

const server = http
  .createServer(app)
  .listen(PORT, () => Logging.info(`Server is running 🚀🚀🚀 on port ${PORT}`));

process.on("uncaughtException", (error: Error, res: Response) => {
  Logging.error(`Uncaught Exception: ${error.stack}`);
  errorHandler.handleError(error);
});

process.on("unhandledRejection", (error: Error | AppError) => {
  Logging.error(`Unhandled Rejection: ${error.stack}`);
  throw new AppError({
    name: error.name,
    message: error.message,
    statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
  });
});
