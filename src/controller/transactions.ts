import { RequestHandler } from "express";
import { ITransaction } from "../library/interfaces";
import User from "../model/user";
import Transaction from "../model/transactions";
import { responseHelper } from "../library/responseHelper";

export default class Controller {
  static fundWallet: RequestHandler = async (req, res, next) => {
    const { amount } = req.body as { amount: ITransaction["amount"] };
    const sender = req.user!;
    const transaction_id = Math.floor(Math.random() * 1000000000);
    //Zero naira charge if funding wallet
    const kimbali_transaction_fee = amount * 0;

    //Send Commission to Kimbali company wallet
    //TODO: send commission to kimbali company wallet

    try {
      //Update user account balance
      const balance_before = sender.balance;
      sender.balance = sender.balance! + Number(amount);
      sender.save();

      //Create Transaction
      await Transaction.create({
        transaction_id,
        amount,
        transaction_type: "credit",
        transaction_fee: kimbali_transaction_fee,
        transaction_status: "success",
        balance_before,
        newBalance: sender.balance,
        receiver_id: sender.wallet_id,
        description: `Hi ${sender.name}, your wallet have been funded with #${amount}`,
      });

      responseHelper.createdResponse(res, "Wallet funded successfully");
    } catch (error) {
      next(error);
    }
  };
}
