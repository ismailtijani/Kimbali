import mongoose from "mongoose";
import Logging from "../library/logger";
import { mongoUrl } from "../config/app";
import errorHandler from "../middleware/errorHandler";
import AppError from "../library/errorClass";
import { responseStatusCodes } from "../library/types";

class MongoDB {
  //   public Url =
  //     process.env.NODE_ENV === "development"
  //       ? `mongodb://127.0.0.1:27017/Loan-App`
  //       : (process.env.MONGODB_URL as string);

  static async connect() {
    try {
      await mongoose
        .set("strictQuery", false)
        .connect(mongoUrl, { retryWrites: true, w: "majority" });

      Logging.info("DB Connection Successful");
      Logging.info(`'''''''''''''''''''''''''`);
    } catch (error: any) {
      throw new AppError({
        name: error.name,
        message: error.message,
        statusCode: responseStatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
  }
}

export default MongoDB.connect;
