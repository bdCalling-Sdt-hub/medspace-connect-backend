"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubscriptionPeriodDates = void 0;
const getSubscriptionPeriodDates = (subscriptionDate) => {
    const start = new Date(subscriptionDate);
    const end = new Date(subscriptionDate);
    end.setDate(start.getDate() + 30);
    return { start, end };
};
exports.getSubscriptionPeriodDates = getSubscriptionPeriodDates;
