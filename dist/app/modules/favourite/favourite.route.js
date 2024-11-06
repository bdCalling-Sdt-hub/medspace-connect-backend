"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FavouriteRoute = void 0;
const express_1 = __importDefault(require("express"));
const validateRequest_1 = __importDefault(require("../../middlewares/validateRequest"));
const favourite_validation_1 = require("./favourite.validation");
const favourite_controller_1 = require("./favourite.controller");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const user_1 = require("../../../enums/user");
const router = express_1.default.Router();
router.post('/create', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER), (0, validateRequest_1.default)(favourite_validation_1.FavouriteValidation.createFavouriteZodSchema), favourite_controller_1.FavouriteController.createFavourite);
router.get('/', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER), favourite_controller_1.FavouriteController.getFavouriteByUserId);
router.patch('/:id', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER), favourite_controller_1.FavouriteController.updateFavourite);
router.delete('/:id', (0, auth_1.default)(user_1.USER_ROLES.SPACESEEKER), favourite_controller_1.FavouriteController.deleteFavourite);
exports.FavouriteRoute = router;
