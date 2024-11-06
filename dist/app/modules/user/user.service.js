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
exports.UserService = void 0;
const http_status_codes_1 = require("http-status-codes");
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const emailHelper_1 = require("../../../helpers/emailHelper");
const emailTemplate_1 = require("../../../shared/emailTemplate");
const unlinkFile_1 = __importDefault(require("../../../shared/unlinkFile"));
const generateOTP_1 = __importDefault(require("../../../util/generateOTP"));
const user_model_1 = require("./user.model");
const subscription_model_1 = require("../subscription/subscription.model");
const space_model_1 = require("../space/space.model");
const createUserToDB = (payload) => __awaiter(void 0, void 0, void 0, function* () {
    //set role
    if (!payload.role) {
        payload.role = user_1.USER_ROLES.SPACESEEKER;
    }
    const createUser = yield user_model_1.User.create(payload);
    if (!createUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Failed to create user');
    }
    //send email
    const otp = (0, generateOTP_1.default)();
    const values = {
        name: createUser.name,
        otp: otp,
        email: createUser.email,
    };
    const createAccountTemplate = emailTemplate_1.emailTemplate.createAccount(values);
    emailHelper_1.emailHelper.sendEmail(createAccountTemplate);
    //save to DB
    const authentication = {
        oneTimeCode: otp,
        expireAt: new Date(Date.now() + 60 * 60000),
    };
    yield user_model_1.User.findOneAndUpdate({ _id: createUser._id }, { $set: { authentication } });
    return createUser;
});
const getUserProfileFromDB = (user) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.findById(id).select('-password');
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    if (isExistUser.role !== user_1.USER_ROLES.SPACEPROVIDER) {
        return { user: isExistUser };
    }
    const userSubscription = yield subscription_model_1.Subscription.findOne({
        providerId: id,
    }).populate('package');
    if (!userSubscription) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'You have not bought any package yet!');
    }
    // Create dates in UTC to match the stored format
    const subscriptionDate = new Date(userSubscription === null || userSubscription === void 0 ? void 0 : userSubscription.createdAt);
    const currentDate = new Date();
    // Calculate days since subscription
    const daysSinceSubscription = Math.floor((currentDate.getTime() - subscriptionDate.getTime()) / (1000 * 60 * 60 * 24));
    const thirtyDayPeriods = Math.floor(daysSinceSubscription / 30);
    // Calculate period start and end dates
    const startDate = new Date(subscriptionDate);
    const endDate = new Date(subscriptionDate);
    endDate.setDate(subscriptionDate.getDate() + 30); // Add exactly 30 days
    // Query spaces posted in this period
    const spacesPosted = yield space_model_1.Space.find({
        providerId: id,
        createdAt: { $gte: startDate, $lte: endDate },
    });
    // For debugging
    console.log({
        subscriptionCreated: subscriptionDate.toISOString(),
        periodStart: startDate.toISOString(),
        periodEnd: endDate.toISOString(),
    });
    const finalResult = {
        user: isExistUser,
        posts: spacesPosted,
        //@ts-ignore
        allowedSpaces: userSubscription === null || userSubscription === void 0 ? void 0 : userSubscription.package.allowedSpaces,
        spacesPosted: spacesPosted.length,
        deadLine: endDate.toDateString(),
    };
    return finalResult;
});
const updateProfileToDB = (user, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = user;
    const isExistUser = yield user_model_1.User.isExistUserById(id);
    if (!isExistUser) {
        throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, "User doesn't exist!");
    }
    //unlink file here
    if (payload.profile && isExistUser.profile !== '/profiles/default.png') {
        (0, unlinkFile_1.default)(isExistUser.profile);
    }
    if (payload.banner && isExistUser.banner !== '/banners/default.png') {
        (0, unlinkFile_1.default)(isExistUser.banner);
    }
    if (payload.profile === null) {
        payload.profile = isExistUser.profile;
    }
    if (payload.banner === null) {
        payload.banner = isExistUser.banner;
    }
    const updateDoc = yield user_model_1.User.findOneAndUpdate({ _id: id }, payload, {
        new: true,
    });
    return updateDoc;
});
const userStatisticFromDB = (year) => __awaiter(void 0, void 0, void 0, function* () {
    const months = [
        { name: 'Jan', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Feb', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Mar', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Apr', spaceprovider: 0, spaceseeker: 0 },
        { name: 'May', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Jun', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Jul', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Aug', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Sep', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Oct', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Nov', spaceprovider: 0, spaceseeker: 0 },
        { name: 'Dec', spaceprovider: 0, spaceseeker: 0 },
    ];
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year + 1, 0, 1);
    // Aggregate users by month
    const monthlyEmployer = yield user_model_1.User.aggregate([
        {
            $match: {
                role: user_1.USER_ROLES.SPACESEEKER,
                createdAt: { $gte: startDate, $lt: endDate },
            },
        },
        {
            $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } },
        },
    ]);
    // Aggregate artists by month
    const monthlyProvider = yield user_model_1.User.aggregate([
        {
            $match: {
                role: user_1.USER_ROLES.SPACEPROVIDER,
                createdAt: { $gte: startDate, $lt: endDate },
            },
        },
        {
            $group: { _id: { month: { $month: '$createdAt' } }, count: { $sum: 1 } },
        },
    ]);
    // Merge user data into the months array
    monthlyEmployer.forEach((employer) => {
        const monthIndex = employer._id.month - 1;
        months[monthIndex].spaceseeker = employer.count;
    });
    // Merge provider data into the months array
    monthlyProvider.forEach((provider) => {
        const monthIndex = provider._id.month - 1;
        months[monthIndex].spaceprovider = provider.count;
    });
    return months;
});
exports.UserService = {
    createUserToDB,
    getUserProfileFromDB,
    updateProfileToDB,
    userStatisticFromDB,
};
