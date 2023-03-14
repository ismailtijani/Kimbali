import mongoose, { Schema, model } from "mongoose";
import validator from "validator";
import AppError from "../library/errorClass";
import { responseStatusCodes } from "../library/types";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name must be provided"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      minlength: [8, "Password must be at least 8"],
      validate: (value: string) => {
        if (value.toLowerCase().includes("password"))
          throw new AppError({
            message: "You can't use the word password",
            statusCode: responseStatusCodes.BAD_REQUEST,
          });
      },
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
      validate(mail: string) {
        if (!validator.isEmail(mail))
          throw new AppError({
            message: "Invalid Email",
            statusCode: responseStatusCodes.BAD_REQUEST,
          });
      },
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    avatar: Buffer,
  },
  { timestamps: true }
);
