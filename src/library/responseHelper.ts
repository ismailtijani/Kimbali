import { Response } from "express";
import { responseStatusCodes, Data } from "./interfaces";

export class responseHelper {
  public static successResponse(res: Response, DATA?: Data) {
    res.status(responseStatusCodes.SUCCESS).json({
      STATUS: "SUCCESS",
      DATA,
    });
  }

  public static createdResponse(res: Response, message?: string, DATA?: Data) {
    res.status(responseStatusCodes.CREATED).json({
      STATUS: "SUCCESS",
      MESSAGE: message,
      DATA,
    });
  }

  static transactionSuccessResponse(res: Response, DATA?: Data) {
    res.status(responseStatusCodes.CREATED).json(DATA);
  }
}
