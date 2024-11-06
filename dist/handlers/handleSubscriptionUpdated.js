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
exports.handleSubscriptionUpdated = void 0;
const http_status_codes_1 = require("http-status-codes");
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const user_model_1 = require("../app/modules/user/user.model");
const handleSubscriptionUpdated = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Use a single query to find and update the subscription
        const updatedSubscription = yield subscription_model_1.Subscription.findOneAndUpdate({
            stripeSubscriptionId: data.id,
            status: 'active',
        }, { status: data.status }, { new: true });
        if (!updatedSubscription) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `Subscription with ID: ${data.id} not found.`);
        }
        // Use a single query to find and update the user
        const updatedUser = yield user_model_1.User.findByIdAndUpdate(updatedSubscription.providerId, {
            isSubscribed: data.status === 'active' || data.status === 'incomplete',
        }, { new: true });
        if (!updatedUser) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `User with ID: ${updatedSubscription.providerId} not found.`);
        }
        return {
            subscription: updatedSubscription,
            user: updatedUser,
        };
    }
    catch (error) {
        if (error instanceof ApiError_1.default)
            throw error;
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Error processing subscription deletion');
    }
});
exports.handleSubscriptionUpdated = handleSubscriptionUpdated;
