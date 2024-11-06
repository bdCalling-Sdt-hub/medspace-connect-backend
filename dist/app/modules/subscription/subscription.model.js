"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Subscription = void 0;
const mongoose_1 = require("mongoose");
const subscription_constant_1 = require("./subscription.constant");
const subscriptionSchema = new mongoose_1.Schema({
    package: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Package',
        required: true,
    },
    providerId: {
        type: String,
        required: true,
    },
    stripeSubscriptionId: {
        type: String,
        required: true,
    },
    amountPaid: {
        type: Number,
        required: true,
    },
    trxId: {
        type: String,
    },
    status: {
        type: String,
        enum: Object.values(subscription_constant_1.SUBSCRIPTION_STATUS),
    },
}, { timestamps: true });
exports.Subscription = (0, mongoose_1.model)('Subscription', subscriptionSchema);
