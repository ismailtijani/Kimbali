import { RequestHandler } from "express";
import sendEmail from "../email/email";
import AppError from "../library/errorClass";
import { IUser, responseStatusCodes } from "../library/interfaces";
import Logger from "../library/logger";
import { responseHelper } from "../library/responseHelper";
import User from "../model/user";

export default class Controller {
  static signup: RequestHandler = async (req, res, next) => {
    const { email, name } = req.body as {
      email: IUser["email"];
      name: IUser["name"];
    };
    try {
      //Check if there is a registered account with the email
      const existingUser = await User.findOne({ email });
      if (existingUser)
        throw new AppError({
          message: "User already exist",
          statusCode: responseStatusCodes.CONFLICT,
        });
      //Create User account
      const user = await User.create(req.body);
      //Generate auth token
      const token = user.generateAuthToken();
      //Generate User Wallet ID
      user.generateWalletId();
      await user.save();

      // Send Welcome Message to new user
      sendEmail({
        email,
        subject: "Account registration",
        message: `Thanks for choosing Kimbali ${name}, do enjoy seamless transactions`,
      });

      responseHelper.createdResponse(
        "Account created succesfully",
        { user, token },
        res
      );
    } catch (error: any) {
      Logger.error(error);
      if (error.name === "ValidationError")
        return res
          .status(responseStatusCodes.BAD_REQUEST)
          .json({ name: error.name, message: error.message });
      next(error);
    }
  };

  static login: RequestHandler = (req, res, next) => {
    const { email, password } = req.body as {
      email: IUser["email"];
      password: IUser["password"];
    };
    try {
      const user = User.findByCredentials(email, password);
      const token = user.generateAuthToken();
      responseHelper.successResponse(res, { user, token });
    } catch (error) {
      next(error);
    }
  };
}
