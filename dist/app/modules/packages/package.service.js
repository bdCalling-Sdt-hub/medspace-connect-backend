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
exports.PackageService = void 0;
const http_status_codes_1 = require("http-status-codes");
const package_model_1 = require("./package.model");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const user_1 = require("../../../enums/user");
const user_model_1 = require("../user/user.model");
const stripeHelper_1 = require("../../../helpers/stripeHelper");
const getDeadline_1 = require("../../../shared/getDeadline");
const createPackageToDB = (payload, user) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistAdmin = yield user_model_1.User.findOne({
        _id: user.id,
        role: user_1.USER_ROLES.ADMIN,
    });
    if (!isExistAdmin) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.FORBIDDEN, 'Forbidden');
    }
    const stripeProduct = yield stripeHelper_1.stripeHelper.createStripeProduct(payload.name, `This is the ${payload.name} package with ${payload.allowedSpaces} spaces allowed`, payload.price);
    // Add Stripe IDs to payload
    const packageWithStripe = Object.assign(Object.assign({}, payload), { stripeProductId: stripeProduct.id, priceId: stripeProduct.priceId, paymentLink: stripeProduct.paymentLink });
    const result = yield package_model_1.Package.create(packageWithStripe);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create package!');
    }
    return result;
});
const getAllPackagesFromDB = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_model_1.Package.find();
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'No packages found');
    }
    return result;
});
const getSinglePackageFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield package_model_1.Package.findOne({ _id: id });
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Package not found');
    }
    return result;
});
const updatePackageToDB = (id, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield package_model_1.Package.findOne({ _id: id });
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Package not found');
    }
    const result = yield package_model_1.Package.findByIdAndUpdate(id, payload, { new: true });
    return result;
});
const deletePackageFromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield package_model_1.Package.findOne({ _id: id });
    if (!isExist) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Package not found');
    }
    const result = yield package_model_1.Package.findByIdAndDelete(id);
    if (!result) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to delete package');
    }
    return result;
});
const getSubscribedPackagesfromDB = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExistUser = yield user_model_1.User.findById(id).populate('subscription');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User not found');
    }
    if (!isExistUser.subscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'User has no subscription');
    }
    const isExistPackage = yield package_model_1.Package.findOne({
        // @ts-expect-error
        _id: isExistUser.subscription.package,
    });
    //@ts-ignore
    const { start: periodStart, end: periodEnd } = (0, getDeadline_1.getSubscriptionPeriodDates)(new Date(isExistUser.subscription.createdAt));
    if (!isExistPackage) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.NOT_FOUND, 'Package not found');
    }
    const finalResult = Object.assign(Object.assign({}, isExistPackage._doc), { deadline: periodEnd.toLocaleDateString("en-GB", { year: 'numeric', month: 'long', day: 'numeric' }) });
    return finalResult;
});
exports.PackageService = {
    createPackageToDB,
    deletePackageFromDB,
    updatePackageToDB,
    getAllPackagesFromDB,
    getSinglePackageFromDB,
    getSubscribedPackagesfromDB,
};
