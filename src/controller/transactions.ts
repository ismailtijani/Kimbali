import { RequestHandler } from "express";
import { ITransaction, responseStatusCodes } from "../library/interfaces";
import User from "../model/user";
import Transaction from "../model/transactions";
import { responseHelper } from "../library/responseHelper";
import Logger from "../library/logger";
import AppError from "../library/errorClass";

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

  //A User can Withdrawl funds thier own account
  static withdrawlFunds: RequestHandler = async (req, res, next) => {
    const amount = req.body as { amount: ITransaction["amount"] };
    const user = req.user!;
  };
}
