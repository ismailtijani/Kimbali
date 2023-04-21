import { Schema, model } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../library/errorClass";
import {
  IUser,
  IUserMethods,
  responseStatusCodes,
  UserDocument,
  UserModel,
} from "../library/interfaces";
import crypto from "crypto";
import Transaction from "./transactions";
import Logger from "../library/logger";

const userSchema = new Schema<IUser, UserModel, IUserMethods>(
  {
    name: {
      type: String,
      required: [true, "Name must be provided"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      trim: true,
      validate: (value: string) => {
        if (value.toLowerCase().includes("password"))
          throw new AppError({
            message: "You can't use the word password",
            statusCode: responseStatusCodes.BAD_REQUEST,
            isOperational: true,
          });
      },
    },
    email: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      lowercase: true,
    },
    phoneNumber: {
      type: Number,
      required: true,
    },
    avatar: Buffer,
    balance: {
      type: Number,
      default: 0,
    },
    wallet_id: {
      type: String,
    },

    is_admin: {
      type: Boolean,
      default: false,
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// User document relationship with another document (to enable populate)
userSchema.virtual("transactions", {
  ref: "Transaction",
  localField: "_id",
  foreignField: "sender_id",
});

//Hashing User plain text password before saving
userSchema.pre<UserDocument>("save", async function (next) {
  if (this.isModified("password")) this.password = await bcrypt.hash(this.password, 8);
  next();
});

// User Token Generation
userSchema.methods.generateAuthToken = async function () {
  const token = jwt.sign({ _id: this._id.toString() }, process.env.JWT_SECRET as string);
  this.tokens = this.tokens.concat({ token });
  await this.save();
  return token;
};

// Generate and hash password token
userSchema.methods.generateResetPasswordToken = async function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");

  // Hash token and send to resetPassword token field
  this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

  // Set expire
  this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;

  await this.save();

  return resetToken;
};

// Genarate User Wallet ID
userSchema.methods.generateWalletId = function () {
  const wallet_id = Math.random().toString(32).substring(2, 9);
  this.wallet_id = wallet_id;
  return wallet_id;
};

//Removing sensitive datas from the user
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.tokens;
  delete userObject.avatar;
  return userObject;
};

//Login User Authentication
userSchema.statics.findByCredentials = async (
  email: IUser["email"],
  password: IUser["password"]
) => {
  const user = await User.findOne({ email });
  if (!user)
    throw new AppError({
      message: "User does not exist",
      statusCode: responseStatusCodes.NOT_FOUND,
    });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new AppError({
      message: "Email or Password is incorrect",
      statusCode: responseStatusCodes.BAD_REQUEST,
    });
  return user;
};

// Deleting User's records upon Deleting User Profile
userSchema.pre<UserDocument>("remove", async function (next) {
  await Transaction.deleteMany({ sender_id: this._id });
  Logger.warn(
    `All transaction records created by ${this.name} has been deleted as the user deleted thier account`
  );
  next();
});

//Create a User Model
const User = model<IUser, UserModel>("User", userSchema);

export default User;
