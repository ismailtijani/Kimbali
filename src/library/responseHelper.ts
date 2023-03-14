import { Response } from "express";
import { responseStatusCodes } from "./interfaces";
export class responseHelper {
      public static successResponse(res: Response, DATA?: any) {
        res.status(responseStatusCodes.SUCCESS).json({
          STATUS: "SUCCESS",
          DATA,
        });
      }
    
      public static createdResponse(message: string, DATA: any, res: Response) {
        res.status(responseStatusCodes.CREATED).json({
          STATUS: "SUCCESS",
          MESSAGE: message,
          DATA,
        });
      }

    }