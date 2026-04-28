// models/UserSession.ts
import mongoose from "mongoose"

const userSessionSchema = new mongoose.Schema({
    username: String,
    roomId: String,
    joinTime: Date,
    leaveTime: Date,
    duration: Number, // in seconds
    date: String // YYYY-MM-DD
})

export default mongoose.model("UserSession", userSessionSchema)