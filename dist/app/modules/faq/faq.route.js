"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FaqRoutes = void 0;
const express_1 = __importDefault(require("express"));
const faq_controller_1 = require("./faq.controller");
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const faq_validation_1 = require("./faq.validation");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(faq_validation_1.FaqValidation.createFaqZodSchema), faq_controller_1.FaqController.createFaq);
router.get('/', faq_controller_1.FaqController.getAllFaqs);
router.get('/:id', faq_controller_1.FaqController.getFaqById);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(faq_validation_1.FaqValidation.updateFaqZodSchema), faq_controller_1.FaqController.updateFaq);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), faq_controller_1.FaqController.deleteFaq);
exports.FaqRoutes = router;
