"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generateOTP = () => {
    return Math.floor(Math.random() * (9999 - 1000 + 1) + 1000);
};
exports.default = generateOTP;
