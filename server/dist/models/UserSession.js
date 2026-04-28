"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// models/UserSession.ts
// @ts-nocheck
const mongoose_1 = __importDefault(require("mongoose"));
const userSessionSchema = new mongoose_1.default.Schema({
    username: String,
    roomId: String,
    joinTime: Date,
    leaveTime: Date,
    duration: Number,
    date: String // YYYY-MM-DD
});
const UserSession = mongoose_1.default.model("UserSession", userSessionSchema);
exports.default = UserSession;
