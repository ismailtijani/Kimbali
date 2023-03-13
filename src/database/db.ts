import { Response } from "express";
import mongoose from "mongoose";
import AppError from "../library/errorClass";
import Logging from "../library/logger";
import { responseStatusCodes } from "../library/types";

class MongoSetup {
  static mongoUrl =
    process.env.NODE_ENV === "development"
      ? `mongodb://127.0.0.1:27017/Loan-App`
      : (process.env.MONGODB_URL as string);

  static async database(): Promise<void> {
    try {
      await mongoose.set("strictQuery", false).connect(this.mongoUrl, {
        retryWrites: true,
        w: "majority",
      });
      Logging.info(`'''''''''''''''''''''''''`);
      Logging.info("DB Connection Successful!");
      Logging.info(`'''''''''''''''''''''''''`);
    } catch (error: any) {
      Logging.error(error);
      // throw new AppError({
      //   // name: error.name,
      //   message: error.message,
      //   statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
      // });
      // res.status(500).json({
      //   STATUS: "FAILURE",
      //   MESSAGE: "MongoDB error: Could not connect to database",
      // });
    }
  }
}

export default MongoSetup.database;
