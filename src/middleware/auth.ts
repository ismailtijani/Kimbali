import { Request, Response, NextFunction } from "express";
import AppError from "../library/errorClass";
import jwt from "jsonwebtoken";
import { IDecode, IUser, responseStatusCodes } from "../library/interfaces";
import User from "../model/user";

interface customRequest extends Request {
  token: string;
  user: IUser;
}

// Use OOP to create a class for Auth Middleware
class Authentication {
  static async middleware(req: Request, res: Response, next: NextFunction) {
    // Get token from headers
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token)
      throw new AppError({
        message: "Please Authenticate",
        statusCode: responseStatusCodes.UNAUTHORIZED,
      });
    try {
      //   Verify Token
      const decoded = <IDecode>jwt.verify(token, JWT_SECRET);

      //   Get user from database
      const user = await User.findOne({
        _id: decoded._id,
        "tokens.token": token,
      });

      if (!user)
        throw new AppError({
          message: "Please Authenticate",
          statusCode: responseStatusCodes.UNAUTHORIZED,
        });
      // Add user to request
      (req as customRequest).user = user;
      (req as customRequest).token = token;
      next();
    } catch (error) {
      next(error);
    }
  }
}

// Fectching JsonwebToken secret
const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

export default Authentication.middleware;
