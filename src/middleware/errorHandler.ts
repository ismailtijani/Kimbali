import { Response } from "express";
import Logger from "../library/logger";
import AppError from "../library/errorClass";
import { responseStatusCodes } from "../library/interfaces";

export class ErrorHandler {
  private isTrustedError(error: Error | AppError) {
    if (error instanceof AppError) return true;
    return false;
  }

  public handleError(error: Error | AppError, res?: Response) {
    if (this.isTrustedError(error)) {
      this.handleTrustedError(error as AppError, res as Response);
    } else {
      this.handleCriticalError(error as Error, res);
    }
  }
  private handleTrustedError = (error: AppError, res: Response) => {
    return res.status(error.statusCode).json({
      STATUS: "FAILURE",
      MESSAGE: error.message,
    });
  };
  private handleCriticalError(error: Error, res?: Response) {
    Logger.error(error);
    if (res) {
      res.status(responseStatusCodes.BAD_REQUEST).json({
        STATUS: "FAILURE",
        ERROR: {
          name: error.name,
          message: error.message,
        },
      });
      res.status(responseStatusCodes.INTERNAL_SERVER_ERROR).json({
        STATUS: "FAILURE",
        ERROR: {
          message: "Internal Server Error",
          stack: process.env.NODE_ENV === "development" ? error.stack : {},
        },
      });
      process.exit(1);
    }
  }
}

export default new ErrorHandler();
