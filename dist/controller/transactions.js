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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const interfaces_1 = require("../library/interfaces");
const user_1 = __importDefault(require("../model/user"));
const transactions_1 = __importDefault(require("../model/transactions"));
const responseHelper_1 = require("../library/responseHelper");
const errorClass_1 = __importDefault(require("../library/errorClass"));
const validID_1 = __importDefault(require("../library/validID"));
class Controller {
}
exports.default = Controller;
_a = Controller;
//Fund AUthenticated user wallet account
Controller.fundWallet = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const user = req.user;
    const sender_id = user._id;
    //Zero naira charge if funding wallet
    const kimbali_transaction_fee = amount * 0;
    //Send Commission to Kimbali company wallet
    //TODO: send commission to kimbali company wallet
    try {
        //Update user account balance
        const balance_before = user.balance;
        user.balance = user.balance + Number(amount);
        user.save();
        //Create Transaction document
        yield transactions_1.default.create({
            sender_id,
            amount,
            transaction_type: "credit",
            transaction_fee: kimbali_transaction_fee,
            transaction_status: "success",
            balance_before,
            newBalance: user.balance,
            receiver_id: user.wallet_id,
            description: `Hi ${user.name}, your wallet have been funded with #${amount}.`
        });
        return responseHelper_1.responseHelper.successResponse(res, "Wallet funded successfully ✅");
    }
    catch (error) {
        next(error);
    }
});
//Transfer funds from authenticated user wallet to another user
Controller.transferFunds = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, receiver_id } = req.body;
    const sender = req.user;
    //Charges: 1% of the amount to be transferred
    const kimbali_transaction_fee = amount * 0.01;
    const balance_before = sender.balance;
    const newBalance = balance_before - (amount + kimbali_transaction_fee);
    try {
        //Prevent User from transfering funds to oneself
        if (sender.wallet_id === receiver_id)
            throw new errorClass_1.default({
                message: "Invalid transaction ⛔",
                statusCode: interfaces_1.responseStatusCodes.UNPROCESSABLE
            });
        //Check if there is an account with the wallet id
        const receiver = yield user_1.default.findOne({ wallet_id: receiver_id });
        if (!receiver)
            throw new errorClass_1.default({
                message: "Account verification failed. Please check details",
                statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST
            });
        if (balance_before < amount)
            throw new errorClass_1.default({
                message: `Insufficient funds in your wallet. Please add money to your Balance to pay ${receiver === null || receiver === void 0 ? void 0 : receiver.name}`,
                statusCode: interfaces_1.responseStatusCodes.UNPROCESSABLE
            });
        const transaction = yield transactions_1.default.create({
            sender_id: sender._id,
            amount,
            transaction_type: "debit",
            transaction_fee: kimbali_transaction_fee,
            transaction_status: "success",
            balance_before,
            newBalance,
            receiver_id,
            description: `Hi ${sender.name}, your wallet have been debited with #${amount}.`
        });
        //Update user account balance
        receiver.balance = receiver.balance + Number(amount);
        sender.balance = newBalance;
        sender.save();
        receiver.save();
        //Send Success response to User
        const Data = {
            status: "SUCCESS",
            Transfer: `-#${amount}`,
            Account_Number: receiver_id,
            Account_Name: receiver.name,
            VAT: kimbali_transaction_fee,
            Transaction_id: transaction._id.toString(),
            Description: `Funds transferred successfully to ${receiver.name}`
        };
        return responseHelper_1.responseHelper.transactionSuccessResponse(res, Data);
    }
    catch (error) {
        next(error);
    }
});
//A User can Withdrawl funds from thier own account
Controller.withdrawFunds = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount } = req.body;
    const user = req.user;
    //Charges: 1% of the amount to be transferred
    const kimbali_transaction_fee = amount * 0.01;
    const balance_before = user.balance;
    const newBalance = balance_before - (amount + kimbali_transaction_fee);
    try {
        if (balance_before < amount)
            throw new errorClass_1.default({
                message: `Insufficient funds in your wallet. Please toUp`,
                statusCode: interfaces_1.responseStatusCodes.UNPROCESSABLE
            });
        yield transactions_1.default.create({
            sender_id: user._id,
            amount,
            transaction_type: "debit",
            transaction_fee: kimbali_transaction_fee,
            transaction_status: "success",
            balance_before,
            newBalance,
            receiver_id: user._id,
            description: `Hi ${user.name}, your wallet have been debited with #${amount}.`
        });
        //Update user account balance
        user.balance = newBalance;
        user.save();
        return responseHelper_1.responseHelper.successResponse(res, "Funds withdrawn successfully from your wallet");
    }
    catch (error) {
        next(error);
    }
});
// A user can view their account balance.
Controller.viewBalance = (req, res) => {
    const balance = req.user.balance;
    return responseHelper_1.responseHelper.successResponse(res, `Your balance is #${balance}`);
};
// A USER CAN VIEW THEIR TRANSACTION HISTORY.
//GET /transaction/transaction_history?transaction_type=debit     ======>>>>> FILTER
//GET /transaction/transaction_history?limit=2&skip=2             ======>>>>> PAGINATION
//GET /transaction/transaction_history?sortBy=createdAt:desc      ======>>>>> SORT
Controller.viewTransactionHistory = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const match = {};
    const sort = {};
    //Check if user is quering by transaction type
    if (req.query.transaction_type)
        match.transaction_type = req.query.transaction_type === "credit" ? "credit" : "debit";
    //Check if user is sorting in ascending or descending order
    if (req.query.sortBy) {
        const splitted = req.query.sortBy.split(":");
        sort[splitted[0]] = splitted[1] === "desc" ? -1 : 1;
    }
    try {
        yield ((_b = req.user) === null || _b === void 0 ? void 0 : _b.populate({
            path: "transactions",
            match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort
            }
        }));
        //Get all user transactions
        const transactions = (_c = req.user) === null || _c === void 0 ? void 0 : _c.transactions;
        if ((transactions === null || transactions === void 0 ? void 0 : transactions.length) === 0)
            throw new errorClass_1.default({
                message: "No transaction record, do make some transactions 😊",
                statusCode: interfaces_1.responseStatusCodes.NOT_FOUND
            });
        return responseHelper_1.responseHelper.successResponse(res, transactions);
    }
    catch (error) {
        next(error);
    }
});
// The user can view the details of a specific transaction.
Controller.viewTransactionDetails = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { transaction_id } = req.params;
    try {
        //Check Validity of transaction Id
        if (!(0, validID_1.default)(transaction_id))
            throw new errorClass_1.default({
                message: "Invalid Input, Please check details",
                statusCode: interfaces_1.responseStatusCodes.BAD_REQUEST,
                name: "ValidationError"
            });
        const transaction = yield transactions_1.default.findById(transaction_id);
        if (!transaction)
            throw new errorClass_1.default({
                message: "No Transaction found",
                statusCode: interfaces_1.responseStatusCodes.NOT_FOUND
            });
        return responseHelper_1.responseHelper.successResponse(res, transaction);
    }
    catch (error) {
        next(error);
    }
});
Controller.totalAmountCredited = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e;
    try {
        //Get all transactions made by the user
        yield ((_d = req.user) === null || _d === void 0 ? void 0 : _d.populate({
            path: "transactions",
            match: { transaction_type: "credit" }
        }));
        const transactions = (_e = req.user) === null || _e === void 0 ? void 0 : _e.transactions;
        //Sum up all credit amount
        let totalcredit = 0;
        transactions === null || transactions === void 0 ? void 0 : transactions.forEach((transaction) => (totalcredit += transaction.amount));
        return responseHelper_1.responseHelper.successResponse(res, `Total amount credited is #${totalcredit}`);
    }
    catch (error) {
        next(error);
    }
});
Controller.totalAmountDebited = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        //Get all transactions made by the user
        yield req.user.populate({
            path: "transactions",
            match: { transaction_type: "debit" }
        });
        const transactions = req.user.transactions;
        //Sum up the debit amount
        let totalDebit = 0;
        transactions === null || transactions === void 0 ? void 0 : transactions.forEach((transaction) => (totalDebit += transaction.amount));
        return responseHelper_1.responseHelper.successResponse(res, `The total amount debited is #${totalDebit}`);
    }
    catch (error) {
        next(error);
    }
});
