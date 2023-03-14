import { Request,Response,NextFunction } from "express";
import AppError from "../library/errorClass";
import jwt from "jsonwebtoken"
import { responseStatusCodes } from "../library/interfaces";
import User from "../model/user"

interface IDecode {
    _id: string;
  }

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

// Use OOP to create a class for Auth Middleware
class Authentication {
  async authMiddleware(req: Request, res: Response, next: NextFunction) {
    // Get token from headers
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token)
      throw new AppError({
        message: "Please Authenticate",
        statusCode: responseStatusCodes.UNAUTHORIZED,
      });

    //   Verify Token
      const decoded = <IDecode>(jwt.verify(token, JWT_SECRET))

    //   Get user from database
    const user =await User.findOne({_id: decoded._id})
  }
}
