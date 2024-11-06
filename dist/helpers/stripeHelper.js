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
exports.stripeHelper = void 0;
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../config"));
const stripe = new stripe_1.default(config_1.default.stripe.secret_key, {
    apiVersion: '2024-09-30.acacia',
});
const createPaymentLink = (product) => __awaiter(void 0, void 0, void 0, function* () {
    const paymentLink = yield stripe.paymentLinks.create({
        line_items: [
            {
                price: product.default_price,
                quantity: 1,
            },
        ],
        after_completion: {
            type: 'redirect',
            redirect: {
                url: config_1.default.client_url,
            },
        },
    });
    return paymentLink.url;
});
const createStripeProduct = (name_1, ...args_1) => __awaiter(void 0, [name_1, ...args_1], void 0, function* (name, description = 'Another medspace connect package', price) {
    const product = yield stripe.products.create({
        name,
        description,
        default_price_data: {
            currency: 'usd',
            unit_amount: price * 100,
            recurring: {
                interval: 'month',
                interval_count: 1,
            },
        },
    });
    const paymentLink = yield createPaymentLink(product);
    return Object.assign(Object.assign({}, product), { priceId: product.default_price, paymentLink });
});
const createCheckoutSession = (product, customerId, successUrl, cancelUrl, metadata) => __awaiter(void 0, void 0, void 0, function* () {
    const session = yield stripe.checkout.sessions.create({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [
            {
                price: product.default_price,
                quantity: 1,
            },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata,
    });
    return session;
});
exports.stripeHelper = {
    createStripeProduct,
    createCheckoutSession,
    stripe,
};
