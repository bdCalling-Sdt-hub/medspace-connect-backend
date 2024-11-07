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
exports.User = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const http_status_codes_1 = require("http-status-codes");
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../../config"));
const user_1 = require("../../../enums/user");
const ApiError_1 = __importDefault(require("../../../errors/ApiError"));
const subscriber_model_1 = require("../subscribers/subscriber.model");
const userSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
    },
    adminType: {
        type: String,
        enum: user_1.ADMIN_TYPES,
        required: false,
    },
    banner: {
        type: String,
        required: false,
        default: '/banners/default.png',
    },
    role: {
        type: String,
        enum: Object.values(user_1.USER_ROLES),
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },
    contact: {
        type: String,
        required: false,
    },
    password: {
        type: String,
        required: true,
        select: 0,
        minlength: 8,
    },
    subscription: {
        type: mongoose_1.Types.ObjectId,
        ref: 'Subscription',
        required: false,
    },
    isSubscribed: {
        type: Boolean,
        default: false,
    },
    trxId: {
        type: String,
        required: false,
    },
    location: {
        type: String,
        required: false,
    },
    occupation: {
        type: String,
        required: false,
        default: '',
    },
    education: {
        degree: {
            type: String,
            required: false,
            default: '',
        },
        institutionName: {
            type: String,
            required: false,
            default: '',
        },
        institutionLocation: {
            type: String,
            required: false,
            default: '',
        },
        startYear: {
            type: String,
            required: false,
            default: '',
        },
        endYear: {
            type: String,
            required: false,
            default: '',
        },
    },
    profile: {
        type: String,
        default: '/profiles/default.png',
    },
    status: {
        type: String,
        enum: ['active', 'delete'],
        default: 'active',
    },
    verified: {
        type: Boolean,
        default: false,
    },
    NIDOrPassportNo: {
        type: String,
        required: false,
    },
    stripeAccountInfo: {
        stripeCustomerId: {
            type: String,
            required: false,
        },
        loginUrl: {
            type: String,
            required: false,
        },
    },
    authentication: {
        type: {
            isResetPassword: {
                type: Boolean,
                default: false,
            },
            oneTimeCode: {
                type: Number,
                default: null,
            },
            expireAt: {
                type: Date,
                default: null,
            },
        },
        select: 0,
    },
}, { timestamps: true });
//exist user check
userSchema.statics.isExistUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.User.findById(id);
    return isExist;
});
userSchema.statics.isExistUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield exports.User.findOne({ email });
    return isExist;
});
//is match password
userSchema.statics.isMatchPassword = (password, hashPassword) => __awaiter(void 0, void 0, void 0, function* () {
    return yield bcryptjs_1.default.compare(password, hashPassword);
});
//check user
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        //check user
        const isExist = yield exports.User.findOne({ email: this.email });
        if (isExist) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Email already exist!');
        }
        //password hash
        this.password = yield bcryptjs_1.default.hash(this.password, Number(config_1.default.bcrypt_salt_rounds));
        const createSubscriber = yield subscriber_model_1.Subscriber.create({
            email: this.email,
        });
        if (!createSubscriber) {
            throw new ApiError_1.default(http_status_codes_1.StatusCodes.BAD_REQUEST, 'Subscriber not created!');
        }
        next();
    });
});
exports.User = (0, mongoose_1.model)('User', userSchema);
