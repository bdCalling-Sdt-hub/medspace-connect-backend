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
exports.handleSubscriptionCreated = void 0;
const stripe_1 = __importDefault(require("../config/stripe"));
const package_model_1 = require("../app/modules/packages/package.model");
const user_model_1 = require("../app/modules/user/user.model");
const ApiError_1 = __importDefault(require("../errors/ApiError"));
const http_status_codes_1 = require("http-status-codes");
const subscription_model_1 = require("../app/modules/subscription/subscription.model");
const subscription_service_1 = require("../app/modules/subscription/subscription.service");
const handleSubscriptionCreated = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve the subscription from Stripe
        const subscription = yield stripe_1.default.subscriptions.retrieve(data.id);
        // Retrieve the customer associated with the subscription
        const customer = (yield stripe_1.default.customers.retrieve(subscription.customer));
        // Extract the price ID from the subscription items
        const productId = subscription.items.data[0].plan.product;
        // Retrieve the invoice to get the transaction ID and amount paid
        const invoice = yield stripe_1.default.invoices.retrieve(subscription.latest_invoice);
        const trxId = invoice === null || invoice === void 0 ? void 0 : invoice.payment_intent;
        const amountPaid = (invoice === null || invoice === void 0 ? void 0 : invoice.total) / 100;
        if (customer === null || customer === void 0 ? void 0 : customer.email) {
            // Find the user by email
            const existingUser = yield user_model_1.User.findOne({ email: customer === null || customer === void 0 ? void 0 : customer.email });
            if (existingUser) {
                // Find the pricing plan by priceId
                const pricingPlan = yield package_model_1.Package.findOne({
                    stripeProductId: productId,
                });
                if (pricingPlan) {
                    // Find the current active subscription
                    const currentActiveSubscription = yield subscription_model_1.Subscription.findOne({
                        providerId: existingUser._id,
                        status: 'active',
                    });
                    if (currentActiveSubscription) {
                        yield subscription_service_1.SubscriptionServices.cancelSubscription(existingUser._id.toString());
                        yield subscription_model_1.Subscription.findOneAndDelete(currentActiveSubscription._id);
                    }
                    // Create a new subscription record
                    const newSubscription = new subscription_model_1.Subscription({
                        package: pricingPlan._id,
                        status: subscription.status,
                        amountPaid,
                        providerId: existingUser._id,
                        stripeSubscriptionId: subscription.id,
                        trxId,
                    });
                    yield newSubscription.save();
                    const purchasedPlan = yield user_model_1.User.findByIdAndUpdate(existingUser._id, {
                        subscription: newSubscription._id,
                        isSubscribed: subscription.status === 'active',
                        'stripeAccountInfo.stripeCustomerId': customer.id,
                    }, { new: true });
                    if (!purchasedPlan) {
                        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'Failed to update user subscription');
                    }
                    console.log({
                        message: 'Subscription created successfully',
                        subscription: newSubscription,
                        user: purchasedPlan,
                    });
                }
                else {
                    // Pricing plan not found
                    throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `Pricing plan with Product ID: ${productId} not found!`);
                }
            }
            else {
                // User not found
                throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, `User with Email: ${customer.email} not found!`);
            }
        }
        else {
            // No email found for the customer
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'No email found for the customer!');
        }
    }
    catch (error) {
        console.error('Error handling subscription created:', error);
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.INTERNAL_SERVER_ERROR, 'An error occurred while processing the subscription.');
    }
});
exports.handleSubscriptionCreated = handleSubscriptionCreated;
