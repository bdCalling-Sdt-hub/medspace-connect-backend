"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SpaceRoutes = void 0;
const express_1 = __importDefault(require("express"));
const user_1 = require("../../../enums/user");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const fileUploadHandler_1 = __importDefault(require("../../middlewares/fileUploadHandler"));
const space_controller_1 = require("./space.controller");
const router = express_1.default.Router();
router.post('/create-space', (0, auth_1.default)(user_1.USER_ROLES.SPACEPROVIDER), (0, fileUploadHandler_1.default)(), space_controller_1.SpaceController.createSpace);
router.get('/status', space_controller_1.SpaceController.getSpaceStatus);
router.get('/filter', space_controller_1.SpaceController.filterSpaces);
router.get('/providers', space_controller_1.SpaceController.getProviders);
router.get('/recent', space_controller_1.SpaceController.getRecentSpaces);
router.get('/my-spaces', (0, auth_1.default)(user_1.USER_ROLES.SPACEPROVIDER), space_controller_1.SpaceController.getMySpaces);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.SPACEPROVIDER), (0, fileUploadHandler_1.default)(), 
// validateRequest(SpaceValidation.updateSpaceZodSchema),
space_controller_1.SpaceController.updateSpace);
router.patch('/:id/images', (0, auth_1.default)(user_1.USER_ROLES.SPACEPROVIDER), (0, fileUploadHandler_1.default)(), space_controller_1.SpaceController.updateSpaceImages);
router.patch('/:id/facilities/add', (0, auth_1.default)(user_1.USER_ROLES.SPACEPROVIDER), space_controller_1.SpaceController.addSpaceFacilities);
router.patch('/:id/facilities/remove', (0, auth_1.default)(user_1.USER_ROLES.SPACEPROVIDER), space_controller_1.SpaceController.removeSpaceFacilities);
router.get('/:id', space_controller_1.SpaceController.getSpaceById);
router.get('/', space_controller_1.SpaceController.getAllSpaces);
exports.SpaceRoutes = router;
