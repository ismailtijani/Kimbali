import { RequestHandler } from "express";
import { ITransaction, responseStatusCodes, IMatch, Sort } from "../library/interfaces";
import User from "../model/user";
import Transaction from "../model/transactions";
import { responseHelper } from "../library/responseHelper";
import AppError from "../library/errorClass";
import validObjectId from "../library/validID";

export default class Controller {
  //Fund AUthenticated user wallet account
  static fundWallet: RequestHandler = async (req, res, next) => {
    const { amount } = req.body as { amount: ITransaction["amount"] };
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
      await Transaction.create({
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

      return responseHelper.successResponse(res, "Wallet funded successfully ✅");
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
    const sender = req.user;
    //Charges: 1% of the amount to be transferred
    const kimbali_transaction_fee = amount * 0.01;
    const balance_before = sender.balance;
    const newBalance = balance_before - (amount + kimbali_transaction_fee);

    try {
      //Prevent User from transfering funds to oneself
      if (sender.wallet_id === receiver_id)
        throw new AppError({
          message: "Invalid transaction ⛔",
          statusCode: responseStatusCodes.UNPROCESSABLE
        });
      //Check if there is an account with the wallet id
      const receiver = await User.findOne({ wallet_id: receiver_id });
      if (!receiver)
        throw new AppError({
          message: "Account verification failed. Please check details",
          statusCode: responseStatusCodes.BAD_REQUEST
        });
      if (balance_before < amount)
        throw new AppError({
          message: `Insufficient funds in your wallet. Please add money to your Balance to pay ${receiver?.name}`,
          statusCode: responseStatusCodes.UNPROCESSABLE
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
      return responseHelper.transactionSuccessResponse(res, Data);
    } catch (error) {
      next(error);
    }
  };

  //A User can Withdrawl funds from thier own account
  static withdrawFunds: RequestHandler = async (req, res, next) => {
    const { amount } = req.body as { amount: ITransaction["amount"] };
    const user = req.user;

    //Charges: 1% of the amount to be transferred
    const kimbali_transaction_fee = amount * 0.01;
    const balance_before = user.balance;
    const newBalance = balance_before - (amount + kimbali_transaction_fee);

    try {
      if (balance_before < amount)
        throw new AppError({
          message: `Insufficient funds in your wallet. Please toUp`,
          statusCode: responseStatusCodes.UNPROCESSABLE
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
        description: `Hi ${user.name}, your wallet have been debited with #${amount}.`
      });
      //Update user account balance
      user.balance = newBalance;
      user.save();

      return responseHelper.successResponse(res, "Funds withdrawn successfully from your wallet");
    } catch (error) {
      next(error);
    }
  };

  // A user can view their account balance.
  static viewBalance: RequestHandler = (req, res) => {
    const balance = req.user.balance;
    return responseHelper.successResponse(res, `Your balance is #${balance}`);
  };

  // A USER CAN VIEW THEIR TRANSACTION HISTORY.

  //GET /transaction/transaction_history?transaction_type=debit     ======>>>>> FILTER
  //GET /transaction/transaction_history?limit=2&skip=2             ======>>>>> PAGINATION
  //GET /transaction/transaction_history?sortBy=createdAt:desc      ======>>>>> SORT
  static viewTransactionHistory: RequestHandler = async (req, res, next) => {
    const match = {} as IMatch;
    const sort: Sort = {};

    //Check if user is quering by transaction type
    if (req.query.transaction_type)
      match.transaction_type = req.query.transaction_type === "credit" ? "credit" : "debit";
    //Check if user is sorting in ascending or descending order
    if (req.query.sortBy) {
      const splitted = (req.query.sortBy as string).split(":");
      sort[splitted[0] as keyof typeof sort] = splitted[1] === "desc" ? -1 : 1;
    }

    try {
      await req.user?.populate({
        path: "transactions",
        match,
        options: {
          limit: parseInt(req.query.limit as string),
          skip: parseInt(req.query.skip as string),
          sort
        }
      });
      //Get all user transactions
      const transactions = req.user?.transactions;

      if (transactions?.length === 0)
        throw new AppError({
          message: "No transaction record, do make some transactions 😊",
          statusCode: responseStatusCodes.NOT_FOUND
        });

      return responseHelper.successResponse(res, transactions);
    } catch (error) {
      next(error);
    }
  };

  // The user can view the details of a specific transaction.
  static viewTransactionDetails: RequestHandler = async (req, res, next) => {
    const { transaction_id } = req.params;

    try {
      //Check Validity of transaction Id
      if (!validObjectId(transaction_id))
        throw new AppError({
          message: "Invalid Input, Please check details",
          statusCode: responseStatusCodes.BAD_REQUEST,
          name: "ValidationError"
        });
      const transaction = await Transaction.findById(transaction_id);

      if (!transaction)
        throw new AppError({
          message: "No Transaction found",
          statusCode: responseStatusCodes.NOT_FOUND
        });

      return responseHelper.successResponse(res, transaction);
    } catch (error) {
      next(error);
    }
  };

  static totalAmountCredited: RequestHandler = async (req, res, next) => {
    try {
      //Get all transactions made by the user
      await req.user?.populate({
        path: "transactions",
        match: { transaction_type: "credit" }
      });
      const transactions = req.user?.transactions;
      //Sum up all credit amount
      let totalcredit = 0;
      transactions?.forEach((transaction) => (totalcredit += transaction.amount));
      return responseHelper.successResponse(res, `Total amount credited is #${totalcredit}`);
    } catch (error) {
      next(error);
    }
  };

  static totalAmountDebited: RequestHandler = async (req, res, next) => {
    try {
      //Get all transactions made by the user
      await req.user.populate({
        path: "transactions",
        match: { transaction_type: "debit" }
      });
      const transactions = req.user.transactions;
      //Sum up the debit amount
      let totalDebit = 0;
      transactions?.forEach((transaction) => (totalDebit += transaction.amount));
      return responseHelper.successResponse(res, `The total amount debited is #${totalDebit}`);
    } catch (error) {
      next(error);
    }
  };
}
