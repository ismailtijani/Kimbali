"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const joiSchema = {
  signup: joi_1.default.object({
    email: joi_1.default.string().email().required(),
    name: joi_1.default.string().min(2).required(),
    password: joi_1.default.string().min(8).max(20).required(),
    phoneNumber: joi_1.default.number().required(),
  }),
  login: joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().required(),
  }),
  forgetPassword: joi_1.default.object({ email: joi_1.default.string().email().required() }),
  resetPassword: joi_1.default.object({
    password: joi_1.default.string().min(8).max(20).required(),
  }),
  fundWallet: joi_1.default.object({ amount: joi_1.default.number().min(10).required() }),
  transferFunds: joi_1.default.object({
    amount: joi_1.default.number().min(100).required(),
    receiver_id: joi_1.default.string().required(),
  }),
  withdrawFunds: joi_1.default.object({ amount: joi_1.default.number().min(10).required() }),
};
exports.default = joiSchema;
