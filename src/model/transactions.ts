import { model, Schema } from "mongoose";

const TransactionSchema = new Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    transaction_type: {
      type: String,
      required: true,
    },
    transaction_status: {
      type: String,
      default: "Pending",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      default: 0,
    },
    receiver_id: {
      type: String,
      required: true,
    },
    transaction_fee: {
      type: Number,
      required: true,
      default: 0,
    },
    balance_before: {
      type: Number,
      required: true,
      default: 0,
    },
    newBalance: {
      type: Number,
      required: true,
      default: 0,
    },
    description: String,
  },
  { timestamps: true }
);

const Transaction = model("Transaction", TransactionSchema);

export default Transaction;
