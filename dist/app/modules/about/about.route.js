"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AboutRoute = void 0;
const express_1 = __importDefault(require("express"));
const about_controller_1 = require("./about.controller");
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, fileUploadHandler_1.default)(), about_controller_1.AboutController.createAbout);
router.get('/', about_controller_1.AboutController.getAllAbout);
router.get('/:id', about_controller_1.AboutController.getSingleAbout);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), (0, fileUploadHandler_1.default)(), about_controller_1.AboutController.updateAbout);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.ADMIN), about_controller_1.AboutController.deleteAbout);
exports.AboutRoute = router;
