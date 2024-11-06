"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const user_controller_1 = require("./user.controller");
const user_validation_1 = require("./user.validation");
const router = express_1.default.Router();
router.get('/profile', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER), user_controller_1.UserController.getUserProfile);
router
    .route('/')
    .post((0, validateRequest_1.default)(user_validation_1.UserValidation.createUserZodSchema), user_controller_1.UserController.createUser)
    .patch((0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER), (0, fileUploadHandler_1.default)(), user_controller_1.UserController.updateProfile);
router.get('/user-statistic', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), user_controller_1.UserController.userStatistic);
router.post('/register-device', (0, auth_1.default)(user_1.USER_ROLES.ADMIN, user_1.USER_ROLES.SPACEPROVIDER, user_1.USER_ROLES.SPACESEEKER), user_controller_1.UserController.registerDeviceToken);
exports.UserRoutes = router;
