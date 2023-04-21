"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const email_1 = __importDefault(require("../email/email"));
const errorClass_1 = __importDefault(require("../library/errorClass"));
const interfaces_1 = require("../library/interfaces");
const logger_1 = __importDefault(require("../library/logger"));
const responseHelper_1 = require("../library/responseHelper");
const user_1 = __importDefault(require("../model/user"));
const crypto_1 = __importDefault(require("crypto"));
const sharp_1 = __importDefault(require("sharp"));
class Controller {}
exports.default = Controller;
_a = Controller;
Controller.signup = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email, name } = req.body;
    try {
      //Check if there is a registered account with the email
      const existingUser = yield user_1.default.findOne({ email });
      if (existingUser)
        throw new errorClass_1.default({
          message: "User already exist",
          statusCode: interfaces_1.responseStatusCodes.CONFLICT,
        });
      //Create User account
      const user = yield user_1.default.create(req.body);
      //Generate auth token
      const token = yield user.generateAuthToken();
      //Generate User Wallet ID
      user.generateWalletId();
      yield user.save();
      // Send Welcome Message to new user
      (0, email_1.default)({
        email,
        subject: "Account registration",
        message: `Thanks for choosing Kimbali ${name}, do enjoy seamless transactions`,
      });
      responseHelper_1.responseHelper.createdResponse(res, "Account created succesfully", token);
    } catch (error) {
      if (error.name === "ValidationError") {
        logger_1.default.error(error);
        return res
          .status(interfaces_1.responseStatusCodes.BAD_REQUEST)
          .json({ name: error.name, message: error.message });
      }
      next(error);
    }
  });
Controller.login = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    try {
      const user = yield user_1.default.findByCredentials(email, password);
      //Generate auth token
      const token = yield user.generateAuthToken();
      responseHelper_1.responseHelper.successResponse(res, token);
    } catch (error) {
      next(error);
    }
  });
Controller.readProfile = (req, res) => {
  return responseHelper_1.responseHelper.successResponse(res, req.user);
};
Controller.uploadAvatar = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
      const user = req.user;
      const buffer = yield (0, sharp_1.default)(
        (_b = req.file) === null || _b === void 0 ? void 0 : _b.buffer
      )
        .resize(250, 250)
        .png()
        .toBuffer();
      user.avatar = buffer;
      yield user.save();
      responseHelper_1.responseHelper.successResponse(res, "Image uploaded successfully");
    } catch (error) {
      next(error);
    }
  });
Controller.viewAvatar = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const user = req.user;
      if (!user.avatar)
        throw new errorClass_1.default({
          message: "No image uploaded, Upload now",
          statusCode: interfaces_1.responseStatusCodes.NOT_FOUND,
        });
      res.set("Content-Type", "Image/png");
      res.status(200).send(user.avatar);
    } catch (error) {
      next(error);
    }
  });
Controller.deleteAvatar = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
      user.avatar = undefined;
      yield user.save();
      responseHelper_1.responseHelper.successResponse(res, "Image deleted successfully");
    } catch (error) {
      next(error);
    }
  });
Controller.updateProfile = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    try {
      const updates = Object.keys(req.body);
      if (updates.length === 0)
        throw new errorClass_1.default({
          message: "Invalid update!",
          statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST,
        });
      const allowedUpdates = ["name", "email", "phoneNumber"];
      const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
      if (!isValidOperation)
        throw new errorClass_1.default({
          message: "Invalid update",
          statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST,
        });
      const user = req.user;
      updates.forEach((update) => (user[update] = req.body[update]));
      yield user.save();
      responseHelper_1.responseHelper.successResponse(res, "Profile updated successfully✅");
    } catch (error) {
      next(error);
    }
  });
Controller.logout = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    //Check through the user tokens to filter out the one that was used for auth on the device
    user.tokens = user.tokens.filter((token) => token.token !== req.token);
    try {
      yield user.save();
      responseHelper_1.responseHelper.successResponse(
        res,
        "You've successfully logged out of this system"
      );
    } catch (error) {
      next(error);
    }
  });
Controller.forgetPassword = (req, res) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    // Search for user Account
    const user = yield user_1.default.findOne({ email });
    if (!user)
      throw new errorClass_1.default({
        message: "Sorry, we don't recognize this account",
        statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST,
      });
    //Generate reset Password Token
    const resetToken = yield user.generateResetPasswordToken();
    // Create reset url
    const resetURl = `${req.protocol}://${req.get("host")}/forget_password/${resetToken}`;
    //Create SMS message
    const message = `Hi ${user.name} \n 
    Please click on the following link ${resetURl} to reset your password. \n\n 
    If you did not request this, please disregard this email and no action will be taken.\n`;
    try {
      // Send reset URL to user via Mail
      (0, email_1.default)({
        email: email,
        subject: "PASSWORD RESET REQUEST",
        message: message,
      });
      return responseHelper_1.responseHelper.successResponse(res, "Email Sent ✅");
    } catch (error) {
      return res
        .status(interfaces_1.responseStatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: "Email could not be sent ❌" });
    }
  });
Controller.resetPassword = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    // Hash token
    const resetPasswordToken = crypto_1.default.createHash("sha256").update(token).digest("hex");
    try {
      const user = yield user_1.default.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() },
      });
      if (!user)
        throw new errorClass_1.default({
          message: "Invalid or Expired Token",
          statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST,
        });
      // Set new password
      user.password = req.body.password;
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      yield user.save();
      return responseHelper_1.responseHelper.successResponse(res, "Password reset successfuly");
    } catch (error) {
      next(error);
    }
  });
Controller.deleteProfile = (req, res, next) =>
  __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    try {
      yield user.deleteOne();
      // Send Goodbye message to exiting user
      (0, email_1.default)({
        email: user.email,
        subject: "Sorry to see you go!",
        message: `Goodbye ${user.name}. I hope to see you sometime soon`,
      });
      return responseHelper_1.responseHelper.successResponse(
        res,
        "Account deactivated successfully"
      );
    } catch (error) {
      next(error);
    }
  });
