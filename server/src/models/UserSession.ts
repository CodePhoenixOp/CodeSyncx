// models/UserSession.ts
// @ts-nocheck
import mongoose from "mongoose"

const userSessionSchema = new mongoose.Schema({
    username: String,
    roomId: String,
    joinTime: Date,
    leaveTime: Date,
    duration: Number, // in seconds
    date: String // YYYY-MM-DD
})

const UserSession = mongoose.model("UserSession", userSessionSchema) as any;
export default UserSession;