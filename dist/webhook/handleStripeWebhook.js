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
const config_1 = __importDefault(require("../config"));
const stripe_1 = __importDefault(require("../config/stripe"));
const http_status_codes_1 = require("http-status-codes");
const logger_1 = require("../shared/logger");
const colors_1 = __importDefault(require("colors"));
const handleAccountUpdatedEvent_1 = require("../handlers/handleAccountUpdatedEvent");
const handleSubscriptionCreated_1 = require("../handlers/handleSubscriptionCreated");
const handleSubscriptionDeleted_1 = require("../handlers/handleSubscriptionDeleted");
const handleSubscriptionUpdated_1 = require("../handlers/handleSubscriptionUpdated");
const handleStripeWebhook = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Extract Stripe signature and webhook secret
    const signature = req.headers['stripe-signature'];
    const webhookSecret = config_1.default.stripe.webhook_secret;
    let event;
    // Verify the event signature
    try {
        // Use raw request body for verification
        event = stripe_1.default.webhooks.constructEvent(req.body, signature.toString(), webhookSecret);
    }
    catch (error) {
        // Log the error and send a response back to Stripe
        logger_1.logger.error(`Webhook signature verification failed: ${error}`);
        return res
            .status(http_status_codes_1.StatusCodes.BAD_REQUEST)
            .send(`Webhook Error: ${error.message}`);
    }
    // Check if the event is valid
    if (!event) {
        logger_1.logger.error('Invalid event received!');
        return res.status(http_status_codes_1.StatusCodes.BAD_REQUEST).send('Invalid event received!');
    }
    // Extract event data and type
    const data = event.data.object;
    const eventType = event.type;
    // Handle the event based on its type
    try {
        switch (eventType) {
            case 'customer.subscription.created':
                yield (0, handleSubscriptionCreated_1.handleSubscriptionCreated)(data);
                break;
            case 'customer.subscription.updated':
                yield (0, handleSubscriptionUpdated_1.handleSubscriptionUpdated)(data);
                break;
            case 'customer.subscription.deleted':
                yield (0, handleSubscriptionDeleted_1.handleSubscriptionDeleted)(data);
                break;
            case 'account.updated':
                yield (0, handleAccountUpdatedEvent_1.handleAccountUpdatedEvent)(data);
                break;
            default:
                // Log unhandled event types
                logger_1.logger.warn(colors_1.default.bgGreen.bold(`Unhandled event type: ${eventType}`));
        }
    }
    catch (error) {
        // Handle errors during event processing
        logger_1.logger.error(`Error handling event: ${error}`);
        // Optionally, you can log the event data for debugging
        logger_1.logger.error(`Event data: ${JSON.stringify(data)}`);
    }
    // Always send a response to Stripe
    res.sendStatus(200);
});
exports.default = handleStripeWebhook;
