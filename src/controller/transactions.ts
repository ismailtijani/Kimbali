import { RequestHandler } from "express";
import { ITransaction, responseStatusCodes } from "../library/interfaces";
import User from "../model/user";
import Transaction from "../model/transactions";
import { responseHelper } from "../library/responseHelper";
import AppError from "../library/errorClass";
import validObjectId from "../library/validID";

export default class Controller {
  //Fund AUthenticated user wallet account
  static fundWallet: RequestHandler = async (req, res, next) => {
    const { amount } = req.body as { amount: ITransaction["amount"] };
    const sender = req.user!;
    const sender_id = sender._id;
    //Zero naira charge if funding wallet
    const kimbali_transaction_fee = amount * 0;

    //Send Commission to Kimbali company wallet
    //TODO: send commission to kimbali company wallet

    try {
      //Update user account balance
      const balance_before = sender.balance!;
      sender.balance = sender.balance! + Number(amount);
      sender.save();

      //Create Transaction document
      await Transaction.create({
        sender_id,
        amount,
        transaction_type: "credit",
        transaction_fee: kimbali_transaction_fee,
        transaction_status: "success",
        balance_before,
        newBalance: sender.balance,
        receiver_id: sender.wallet_id,
        description: `Hi ${sender.name}, your wallet have been funded with $${amount}.`,
      });

      return responseHelper.successResponse(res, "Wallet funded successfully");
    } catch (error) {
      next(error);
    }
  };

  //Transfer funds from authenticated user wallet to another user
  static transferFunds: RequestHandler = async (req, res, next) => {
    const { amount, receiver_id } = req.body as {
      amount: ITransaction["amount"];
      receiver_id: ITransaction["receiver_id"];
    };
    const sender = req.user!;
    //Charges: 1% of the amount to be transferred
    const kimbali_transaction_fee = amount * 0.01;
    const balance_before = sender.balance!;
    const newBalance = balance_before - (amount + kimbali_transaction_fee);

    try {
      //Check if there is an account with the wallet id
      const receiver = await User.findOne({ wallet_id: receiver_id });
      if (!receiver)
        throw new AppError({
          message: "Account verification failed. Please check details",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });
      if (balance_before! < amount)
        throw new AppError({
          message: `Insufficient funds in your wallet. Please add money to your Balance to pay ${receiver?.name}`,
          statusCode: responseStatusCodes.UNPROCESSABLE,
        });

      const transaction = await Transaction.create({
        sender_id: sender._id,
        amount,
        transaction_type: "debit",
        transaction_fee: kimbali_transaction_fee,
        transaction_status: "success",
        balance_before,
        newBalance,
        receiver_id,
        description: `Hi ${sender.name}, your wallet have been debited with $${amount}.`,
      });
      //Update user account balance
      receiver.balance = receiver.balance! + Number(amount);
      sender.balance = newBalance;
      sender.save();
      receiver.save();
      //Send Success response to User
      const Data = {
        status: "SUCCESS",
        Transfer: `-$${amount}`,
        VAT: kimbali_transaction_fee,
        Account_Number: receiver_id,
        Account_Name: receiver.name,
        Transaction_id: transaction._id.toString(),
        Description: `Funds transferred successfully to ${receiver.name}`,
      };
      return responseHelper.transactionSuccessResponse(res, Data);
    } catch (error) {
      next(error);
    }
  };

  //A User can Withdrawl funds from thier own account
  static withdrawlFunds: RequestHandler = async (req, res, next) => {
    const { amount } = req.body as { amount: ITransaction["amount"] };
    const user = req.user!;

    //Charges: 1% of the amount to be transferred
    const kimbali_transaction_fee = amount * 0.01;
    const balance_before = user.balance!;
    const newBalance = balance_before - (amount + kimbali_transaction_fee);

    try {
      if (balance_before! < amount)
        throw new AppError({
          message: `Insufficient funds in your wallet. Please toUp`,
          statusCode: responseStatusCodes.UNPROCESSABLE,
        });

      await Transaction.create({
        sender_id: user._id,
        amount,
        transaction_type: "debit",
        transaction_fee: kimbali_transaction_fee,
        transaction_status: "success",
        balance_before,
        newBalance,
        receiver_id: user._id,
        description: `Hi ${user.name}, your wallet have been debited with $${amount}.`,
      });
      //Update user account balance
      user.balance = newBalance;
      user.save();

      return responseHelper.successResponse(
        res,
        "Funds withdrawn successfully from your wallet"
      );
    } catch (error) {
      next(error);
    }
  };

  // A user can view their account balance.
  static viewBalance: RequestHandler = (req, res) => {
    const balance = req.user?.balance!;
    return responseHelper.successResponse(res, balance);
  };

  // A user can view their transaction history.
  static viewTransactionHistory: RequestHandler = async (req, res, next) => {
    try {
      const transactions = await Transaction.find({});
      if (!transactions)
        throw new AppError({
          message: "No transaction record, do make some transactions",
          statusCode: responseStatusCodes.NO_CONTENT,
        });

      return responseHelper.successResponse(res, transactions);
    } catch (error) {
      next(error);
    }
  };

  // The user can view the details of a specific transaction.
  static viewTransactionDetails: RequestHandler = async (req, res, next) => {
    const transaction_id = req.params;
    //Check Validity of transaction Id
    const isValidId = validObjectId(transaction_id);

    try {
      if (!isValidId)
        throw new AppError({
          message: "Invalid Input, Please check details",
          statusCode: responseStatusCodes.BAD_REQUEST,
          name: "ValidationError",
        });
      const transaction = await Transaction.findById(transaction_id);

      if (!transaction)
        throw new AppError({
          message: "Transaction not found. Please check details",
          statusCode: responseStatusCodes.BAD_REQUEST,
        });

      return responseHelper.successResponse(res, transaction);
    } catch (error) {
      next(error);
    }
  };

  //View all transactions
  static viewTransactions: RequestHandler = async (req, res, next) => {
    try {
      const transactions = await Transaction.find({});
      if (!transactions)
        throw new AppError({
          message: "No transaction history yet. Do make some transactions😊",
          statusCode: responseStatusCodes.NOT_FOUND,
        });
    } catch (error) {
      next(error);
    }
  };
}
