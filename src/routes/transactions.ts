import { Application, Router } from "express";
import TransactionController from "../controller/transactions";
import joiSchema from "../library/joiSchema";
import validator from "../middleware/validator";
import auth from "../middleware/auth";

class TransactionRoutes {
  public router: Router;
  constructor() {
    this.router = Router();
    this.registeredRoutes();
  }
  private registeredRoutes() {
    //Every routes below will require authentication
    this.router.use(auth);
    this.router.post(
      "/fund_wallet",
      validator(joiSchema.fundWallet, "body"),
      TransactionController.fundWallet
    );
    this.router.post(
      "/transfer",
      validator(joiSchema.transferFunds, "body"),
      TransactionController.transferFunds
    );
    this.router.get("/balance", TransactionController.viewBalance);
    this.router.post(
      "/withdrawal",
      validator(joiSchema.withdrawFunds, "body"),
      TransactionController.withdrawFunds
    );
    this.router.get(
      "/transaction_history",
      TransactionController.viewTransactionHistory
    );
    this.router.get(
      "/transaction_details/:transaction_id",
      TransactionController.viewTransactionDetails
    );
  }
}

//Register transaction routes in App
const transactionRouter = (app: Application) => {
  app.use("/transaction", new TransactionRoutes().router);
};

export default transactionRouter;
