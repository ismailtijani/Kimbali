"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AppError extends Error {
  constructor(args) {
    super(args.message);
    this.isOperational = true;
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = args.name || "Error";
    this.statusCode = args.statusCode;
    if (args.isOperational !== undefined) this.isOperational = args.isOperational;
    Error.captureStackTrace(this);
  }
}
exports.default = AppError;
