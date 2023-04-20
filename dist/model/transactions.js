"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const TransactionSchema = new mongoose_1.Schema({
    sender_id: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    transaction_type: {
        type: String,
        required: true
    },
    transaction_status: {
        type: String,
        default: "Pending",
        required: true
    },
    amount: {
        type: Number,
        required: true,
        default: 0
    },
    receiver_id: {
        type: String,
        required: true
    },
    transaction_fee: {
        type: Number,
        required: true,
        default: 0
    },
    balance_before: {
        type: Number,
        required: true,
        default: 0
    },
    newBalance: {
        type: Number,
        required: true,
        default: 0
    },
    description: String
}, { timestamps: true });
const Transaction = (0, mongoose_1.model)("Transaction", TransactionSchema);
exports.default = Transaction;
