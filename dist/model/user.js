"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorClass_1 = __importDefault(require("../library/errorClass"));
const interfaces_1 = require("../library/interfaces");
const crypto_1 = __importDefault(require("crypto"));
const transactions_1 = __importDefault(require("./transactions"));
const logger_1 = __importDefault(require("../library/logger"));
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: [true, "Name must be provided"]
    },
    password: {
        type: String,
        required: [true, "Password is required"],
        trim: true,
        validate: (value) => {
            if (value.toLowerCase().includes("password"))
                throw new errorClass_1.default({
                    message: "You can't use the word password",
                    statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST,
                    isOperational: true
                });
        }
    },
    email: {
        type: String,
        trim: true,
        required: true,
        unique: true,
        lowercase: true
    },
    phoneNumber: {
        type: Number,
        required: true
    },
    avatar: Buffer,
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
                required: true
            }
        }
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date
}, { timestamps: true });
// User document relationship with another document (to enable populate)
userSchema.virtual("transactions", {
    ref: "Transaction",
    localField: "_id",
    foreignField: "sender_id"
});
//Hashing User plain text password before saving
userSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password"))
            this.password = yield bcrypt_1.default.hash(this.password, 8);
        next();
    });
});
// User Token Generation
userSchema.methods.generateAuthToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        const token = jsonwebtoken_1.default.sign({ _id: this._id.toString() }, process.env.JWT_SECRET);
        this.tokens = this.tokens.concat({ token });
        yield this.save();
        return token;
    });
};
// Generate and hash password token
userSchema.methods.generateResetPasswordToken = function () {
    return __awaiter(this, void 0, void 0, function* () {
        // Generate token
        const resetToken = crypto_1.default.randomBytes(20).toString("hex");
        // Hash token and send to resetPassword token field
        this.resetPasswordToken = crypto_1.default.createHash("sha256").update(resetToken).digest("hex");
        // Set expire
        this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
        yield this.save();
        return resetToken;
    });
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
userSchema.statics.findByCredentials = (email, password) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield User.findOne({ email });
    if (!user)
        throw new errorClass_1.default({
            message: "User does not exist",
            statusCode: interfaces_1.responseStatusCodes.NOT_FOUND
        });
    const isMatch = yield bcrypt_1.default.compare(password, user.password);
    if (!isMatch)
        throw new errorClass_1.default({
            message: "Email or Password is incorrect",
            statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST
        });
    return user;
});
// Deleting User's records upon Deleting User Profile
userSchema.pre("remove", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        yield transactions_1.default.deleteMany({ sender_id: this._id });
        logger_1.default.warn(`All transaction records created by ${this.name} has been deleted as the user deleted thier account`);
        next();
    });
});
//Create a User Model
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
