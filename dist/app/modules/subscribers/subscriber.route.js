"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriberRoutes = void 0;
const express_1 = __importDefault(require("express"));
const subscriber_controller_1 = require("./subscriber.controller");
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post('/create', subscriber_controller_1.SubscriberController.createSubscriber);
router.post('/send', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), subscriber_controller_1.SubscriberController.sendEmail);
router.get('/', subscriber_controller_1.SubscriberController.getAllSubscribers);
router.get('/:id', subscriber_controller_1.SubscriberController.getSubscriberById);
router.get('/email/:email', subscriber_controller_1.SubscriberController.getSubscriberByEmail);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), subscriber_controller_1.SubscriberController.deleteSubscriber);
exports.SubscriberRoutes = router;
