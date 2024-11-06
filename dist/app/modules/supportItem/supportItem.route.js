"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SupportItemRoute = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const supportItem_validation_1 = require("./supportItem.validation");
const supportItem_controller_1 = require("./supportItem.controller");
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post('/', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(supportItem_validation_1.SupportItemValidation.createSupportItemZodSchema), supportItem_controller_1.SupportItemController.createSupportItemControllerFunction);
router.get('/', supportItem_controller_1.SupportItemController.getAllSupportItemControllerFunction);
router.get('/:id', supportItem_controller_1.SupportItemController.getSupportItemByIdControllerFunction);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, validateRequest_1.default)(supportItem_validation_1.SupportItemValidation.updateSupportItemZodSchema), supportItem_controller_1.SupportItemController.updateSupportItemByIdControllerFunction);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), supportItem_controller_1.SupportItemController.deleteSupportItemByIdControllerFunction);
exports.SupportItemRoute = router;
