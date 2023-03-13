import { NextFunction, Request, Response } from "express";
import Logging from "../library/logger";
import AppError from "../library/errorClass";
import { responseStatusCodes } from "../library/types";
import { ObjectSchema, ValidationErrorItem } from "joi";

function validator(schema: ObjectSchema, property: keyof Request) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req[property], {
      abortEarly: false,
    });
    const valid = error == null;
    if (valid) {
      next();
    } else {
      const { details } = error;
      Logging.info(details);
      const message: string = details
        .map((i: ValidationErrorItem) => i.message)
        .join(",");
      Logging.error(error);
      throw new AppError({
        message,
        statusCode: responseStatusCodes.UNPROCESSABLE,
      });
    }
  };
}
export default validator;
