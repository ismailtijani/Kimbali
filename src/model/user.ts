import { Schema, model } from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import AppError from "../library/errorClass";
import { IUser, responseStatusCodes, UserModel } from "../library/interfaces";
// import Logger from "../library/logger";

const userSchema = new Schema<IUser>(
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
    phoneNumber: {
      type: Number,
      required: true
    },
    balance: {
      type: Number,
      default: 0
    },
    wallet_id: {
      type: String
    },

    is_admin: {
      type: Boolean,
      default: false 
    },
    tokens: [
      {
        token: {
          type: String,
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

// User document relationship with another document (to enable populate)
userSchema.virtual("Document name", {
  ref: "Model Name",
  localField: "_id",
  foreignField: "owner_id",
});

//Hashing User plain text password before saving
userSchema.pre("save", async function (next) {
  const user = this; //Type cast this
  if (user.isModified("password"))
    user.password = await bcrypt.hash(user.password, 8);
  next();
});

// User Token Generation
userSchema.methods.generateAuthToken = async function () {
  const user = this; //Type Cast this

  const token = jwt.sign(
    { _id: user._id.toString() },
    process.env.JWT_SECRET as string
  );
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

// Genarate User Wallet ID
userSchema.methods.generateWalletId = async function () {
  const user = this  //Type Cast this
  const wallet_id =  Math.random().toString(32).substring(2, 9)
  user.wallet_id = wallet_id
  await user.save()
  return wallet_id
}

//Removing sensitive datas from the user
userSchema.methods.toJSON = function () {
  const user = this; //Type cast this
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
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

//Deleting User's records upon Deleting User Profile
// userSchema.pre("remove", async function (next) {
//     const user = this;
//     await Model.deleteMany({ owner_id: user._id });
//     Logger.warn(
//       `All *** created by ${user.name} has been deleted as the user deleted thier account`
//     );
//     next();
//   });

//Create a User Model
const User = model<IUser, UserModel>("User", userSchema);

export default User;
