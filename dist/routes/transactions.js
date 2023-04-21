"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const transactions_1 = __importDefault(require("../controller/transactions"));
const joiSchema_1 = __importDefault(require("../library/joiSchema"));
const validator_1 = __importDefault(require("../middleware/validator"));
const auth_1 = __importDefault(require("../middleware/auth"));
class TransactionRoutes {
  constructor() {
    this.router = (0, express_1.Router)();
    this.registeredRoutes();
  }
  registeredRoutes() {
    //Every routes below will require authentication
    this.router.use(auth_1.default);
    this.router.post(
      "/fund_wallet",
      (0, validator_1.default)(joiSchema_1.default.fundWallet, "body"),
      transactions_1.default.fundWallet
    );
    this.router.post(
      "/transfer",
      (0, validator_1.default)(joiSchema_1.default.transferFunds, "body"),
      transactions_1.default.transferFunds
    );
    this.router.get("/balance", transactions_1.default.viewBalance);
    this.router.post(
      "/withdrawal",
      (0, validator_1.default)(joiSchema_1.default.withdrawFunds, "body"),
      transactions_1.default.withdrawFunds
    );
    this.router.get("/transaction_history", transactions_1.default.viewTransactionHistory);
    this.router.get(
      "/transaction_details/:transaction_id",
      transactions_1.default.viewTransactionDetails
    );
    this.router.get("/totalamount_credited", transactions_1.default.totalAmountCredited);
    this.router.get("/totalamount_debited", transactions_1.default.totalAmountDebited);
  }
}
//Register transaction routes in App
const transactionRouter = (app) => {
  app.use("/transaction", new TransactionRoutes().router);
};
exports.default = transactionRouter;
