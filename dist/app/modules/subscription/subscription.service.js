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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionServices = void 0;
const http_status_codes_1 = require("http-status-codes");
const stripe_1 = __importDefault(require("../../../config/stripe"));
const subscription_model_1 = require("./subscription.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_model_1 = require("../user/user.model");
const cancelSubscription = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    // Find the active subscription
    const activeSubscription = yield subscription_model_1.Subscription.findOne({
        providerId: userId,
        status: 'active',
    });
    const isExistUser = yield user_model_1.User.findById(userId);
    if (!activeSubscription || !isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No active subscription found');
    }
    try {
        const canceled = yield stripe_1.default.subscriptions.cancel(activeSubscription.stripeSubscriptionId);
        if (canceled.status !== 'canceled') {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to cancel subscription');
        }
        const deletedSubscription = yield subscription_model_1.Subscription.findByIdAndDelete(activeSubscription._id);
        const updatedUser = yield user_model_1.User.findByIdAndUpdate(userId, { isSubscribed: false, subscription: null }, { new: true });
        return {
            deletedSubscription,
            updatedUser,
            canceled,
        };
    }
    catch (error) {
        console.log(error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to cancel subscription');
    }
});
exports.SubscriptionServices = {
    cancelSubscription,
};
