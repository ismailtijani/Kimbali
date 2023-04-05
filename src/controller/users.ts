import { RequestHandler } from "express";
import sendEmail from "../email/email";
import AppError from "../library/errorClass";
import { IUser, responseStatusCodes, UserModel } from "../library/interfaces";
import Logger from "../library/logger";
import { responseHelper } from "../library/responseHelper";
import User from "../model/user";
import crypto from "crypto";
import sharp from "sharp";

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
      const token = await user.generateAuthToken();
      //Generate User Wallet ID
      user.generateWalletId();
      await user.save();

      // Send Welcome Message to new user
      sendEmail({
        email,
        subject: "Account registration",
        message: `Thanks for choosing Kimbali ${name}, do enjoy seamless transactions`,
      });

      responseHelper.createdResponse(res, "Account created succesfully", {
        user,
        token,
      });
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
      const token = await user.generateAuthToken();
      responseHelper.successResponse(res, { user, token });
    } catch (error) {
      next(error);
    }
  };

  static readProfile: RequestHandler = (req, res) => {
    return responseHelper.successResponse(res, req.user);
  };

  static uploadAvatar: RequestHandler = async (req, res, next) => {
    const user = req.user!;
    try {
      const buffer = await sharp(req.file?.buffer)
        .resize(250, 300)
        .png()
        .toBuffer();
      user.avatar = buffer;
      await user.save();
      responseHelper.successResponse(res, "Image uploaded successfully");
    } catch (error) {
      next(error);
    }
  };

  static viewAvatar: RequestHandler = async (req, res, next) => {
    const user = req.user!;
    try {
      if (!user.avatar)
        throw new AppError({
          message: "No image uploaded, Upload now",
          statusCode: responseStatusCodes.NOT_FOUND,
        });
      res.set("Content-Type", "Image/png");
      responseHelper.successResponse(res, user.avatar);
    } catch (error) {
      next(error);
    }
  };

  static deleteAvatar: RequestHandler = async (req, res, next) => {
    const user = req.user!;
    try {
      user.avatar = undefined;
      await user.save();
      responseHelper.successResponse(res, "Image deleted successfully");
    } catch (error) {
      next(error);
    }
  };

  static updateProfile: RequestHandler = async (req, res, next) => {
    try {
      const updates = Object.keys(req.body) as Array<keyof IUser>;
      if (updates.length === 0)
        throw new AppError({
          message: "Invalid update!",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      const allowedUpdates = ["name", "email", "phoneNumber"];
      const isValidOperation = updates.every((update) =>
        allowedUpdates.includes(update)
      );
      if (!isValidOperation)
        throw new AppError({
          message: "Invalid update",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      const user: any = req.user!;
      updates.forEach((update) => (user[update] = req.body[update]));
      await user.save();
      responseHelper.successResponse(res, user);
    } catch (error) {
      next(error);
    }
  };

  static logout: RequestHandler = async (req, res, next) => {
    const user = req.user!;
    //Check through the user tokens to filter out the one that was used for auth on the device
    user.tokens = user.tokens.filter((token: any) => token.token !== req.token);
    try {
      await user.save();
      responseHelper.successResponse(
        res,
        "You've successfully logged out of this system"
      );
    } catch (error) {
      next(error);
    }
  };

  static forgetPassword: RequestHandler = async (req, res) => {
    const { email } = req.body as { email: IUser["email"] };
    // Search for user Account
    const user = await User.findOne({ email });
    if (!user)
      throw new AppError({
        message: "Sorry, we don't recognize this account",
        statusCode: responseStatusCodes.BAD_REQUEST,
      });

    //Generate reset Password Token
    const resetToken = await user.generateResetPasswordToken();
    // Create reset url
    const resetURl = `${req.protocol}://${req.get(
      "host"
    )}/forget_password/${resetToken}`;
    //Create SMS message
    const message = `Hi ${user.name} \n 
    Please click on the following link ${resetURl} to reset your password. \n\n 
    If you did not request this, please disregard this email and no action will be taken.\n`;
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
    const token = req.params.token;

    // Hash token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    try {
      const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });

      if (!user)
        throw new AppError({
          message: "Invalid or Expired Token",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;

      await user.save();

      return responseHelper.successResponse(res, user);
    } catch (error) {
      next(error);
    }
  };

  static deleteProfile: RequestHandler = async (req, res, next) => {
    const user = req.user!;
    try {
      await user.deleteOne();
      // Send Goodbye message to exiting user
      sendEmail({
        email: user.email,
        subject: "Sorry to see you go!",
        message: `Goodbye ${user.name}. I hope to see you sometime soon`,
      });
      responseHelper.successResponse(res, "Account deactivated successfully");
    } catch (error) {
      next(error);
    }
  };
}
