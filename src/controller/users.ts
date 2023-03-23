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
      if (error.name === "ValidationError") {
        Logger.error(error);
        return res
          .status(responseStatusCodes.BAD_REQUEST)
          .json({ name: error.name, message: error.message });
      }

      next(error);
    }
  };

  static login: RequestHandler = async (req, res, next) => {
    const { email, password } = req.body as {
      email: IUser["email"];
      password: IUser["password"];
    };
    try {
      const user = await User.findByCredentials(email, password);
      //Generate auth token
      const token = user.generateAuthToken();
      responseHelper.successResponse(res, { user, token });
    } catch (error) {
      next(error);
    }
  };

  static forgetPassword: RequestHandler = async (req, res, next) => {
    const { email } = req.body as { email: IUser["email"] };
    // Search for user Account
    const user = await User.findOne({ email });
    if (!user)
      throw new AppError({
        message: "Sorry, we don't recognize this account",
        statusCode: responseStatusCodes.BAD_REQUEST,
      });

    //Generate reset Password Token
    const resetToken = user.generateResetPasswordToken();
    // Create reset url
    const resetURl = `${req.protocol}://${req.get(
      "host"
    )}/resetpassword/${resetToken}`;
    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. 
  If it is you, Please click on the below link to change your password: \n\n ${resetURl}`;
    try {
      // Send reset URL to user via Mail
      sendEmail({
        email: email,
        subject: "PASSWORD RESET REQUEST",
        message: message,
      });

      return responseHelper.successResponse(res, "Email Sent");
    } catch (error) {
      return res
        .status(responseStatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Email could not be sent" });
    }
  };

  static resetPassword: RequestHandler = async (req, res, next) => {
    const token = req.params.token
    
  }
}
