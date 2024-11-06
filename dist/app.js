"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const http_status_codes_1 = require("http-status-codes");
const globalErrorHandler_1 = __importDefault(require("./app/middlewares/globalErrorHandler"));
const routes_1 = __importDefault(require("./routes"));
const morgen_1 = require("./shared/morgen");
const handleStripeWebhook_1 = __importDefault(require("./webhook/handleStripeWebhook"));
const subscription_controller_1 = require("./app/modules/subscription/subscription.controller");
const user_1 = require("./enums/user");
const auth_1 = __importDefault(require("./app/middlewares/auth"));
const config_1 = __importDefault(require("./config"));
const app = (0, express_1.default)();
//morgan
app.use(morgen_1.Morgan.successHandler);
app.use(morgen_1.Morgan.errorHandler);
app.use('/api/stripe/webhook', express_1.default.raw({ type: 'application/json' }), handleStripeWebhook_1.default);
//body parser
app.use((0, cors_1.default)({
    origin: config_1.default.client_url,
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Stripe webhook route
app.use('/api/stripe/subscription/cancel', (0, auth_1.default)(user_1.USER_ROLES.SPACEPROVIDER), subscription_controller_1.SubscriptionControllers.cancelSubscription);
//file retrieve
app.use(express_1.default.static('uploads'));
//router
app.use('/api/v1', routes_1.default);
//live response
app.get('/', (req, res) => {
    res.send('<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">Hey, How can I assist you today!</h1>');
});
// app.use((err: any, req: Request, res: Response, next: NextFunction) => {
//   logger.error(err); // Log the error
//   res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//     success: false,
//     message: 'An error occurred, please try again later.',
//   });
// });
//global error handle
app.use(globalErrorHandler_1.default);
//handle not found route;
app.use((req, res) => {
    res.status(http_status_codes_1.StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'Not found',
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST",
            },
        ],
    });
});
exports.default = app;
