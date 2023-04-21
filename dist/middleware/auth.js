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
Object.defineProperty(exports, "__esModule", { value: true });
const errorClass_1 = __importDefault(require("../library/errorClass"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const interfaces_1 = require("../library/interfaces");
const user_1 = __importDefault(require("../model/user"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
// Use OOP to create a class for Auth Middleware
class Authentication {
  static middleware(req, res, next) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
      // Get token from headers
      const token =
        (_a = req.header("Authorization")) === null || _a === void 0
          ? void 0
          : _a.replace("Bearer ", "");
      try {
        if (!token)
          throw new errorClass_1.default({
            message: "Please Authenticate",
            statusCode: interfaces_1.responseStatusCodes.UNAUTHORIZED,
          });
        //   Verify Token
        const decoded = jsonwebtoken_1.default.verify(token, JWT_SECRET);
        //   Get user from database
        const user = yield user_1.default.findOne({
          _id: decoded._id,
          "tokens.token": token,
        });
        if (!user)
          throw new errorClass_1.default({
            message: "Please Authenticate",
            statusCode: interfaces_1.responseStatusCodes.UNAUTHORIZED,
          });
        // Add user to request
        req.user = user;
        req.token = token;
        next();
      } catch (error) {
        if (error.name === "JsonWebTokenError")
          return res.status(interfaces_1.responseStatusCodes.BAD_REQUEST).json({
            STATUS: "FAILURE",
            ERROR: "Invalid Token",
          });
        next(error);
      }
    });
  }
}
// Fectching JsonwebToken secret
const JWT_SECRET = process.env.JWT_SECRET;
exports.default = Authentication.middleware;
