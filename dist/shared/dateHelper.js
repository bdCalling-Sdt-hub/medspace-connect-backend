"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertISOToHumanReadable = void 0;
const convertISOToHumanReadable = (isoDate) => {
    const date = new Date(isoDate);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};
exports.convertISOToHumanReadable = convertISOToHumanReadable;
