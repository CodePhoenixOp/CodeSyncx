"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const socket_1 = require("./types/socket");
const user_1 = require("./types/user");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
const UserSession_1 = __importDefault(require("./models/UserSession"));
dotenv_1.default.config();
const mongoose_1 = __importDefault(require("mongoose"));
mongoose_1.default.connect(process.env.MONGO_URI)
    .then(() => {
    console.log("MongoDB Connected");
})
    .catch((err) => {
    console.error("MongoDB Error:", err);
});
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.post("/run", async (req, res) => {
    try {
        const { script, language, versionIndex, stdin } = req.body;
        const response = await axios_1.default.post("https://api.jdoodle.com/v1/execute", {
            clientId: process.env.JDOODLE_CLIENT_ID,
            clientSecret: process.env.JDOODLE_CLIENT_SECRET,
            script,
            stdin,
            language,
            versionIndex,
        });
        return res.json(response.data);
    }
    catch (error) {
        console.error("JDoodle Error:", error?.response?.data || error.message);
        return res.status(500).json({
            error: "Code execution failed",
            details: error?.response?.data,
        });
    }
});
app.use(express_1.default.static(path_1.default.join(__dirname, "public"))); // Serve static files
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: false
    },
    maxHttpBufferSize: 1e8,
    pingTimeout: 60000
});
let userSocketMap = [];
// Function to get all users in a room
function getUsersInRoom(roomId) {
    return userSocketMap.filter((user) => user.roomId == roomId);
}
// Function to get room id by socket id
function getRoomId(socketId) {
    const roomId = userSocketMap.find((user) => user.socketId === socketId)?.roomId;
    if (!roomId) {
        console.error("Room ID is undefined for socket ID:", socketId);
        return null;
    }
    return roomId;
}
function getUserBySocketId(socketId) {
    const user = userSocketMap.find((user) => user.socketId === socketId);
    if (!user) {
        console.error("User not found for socket ID:", socketId);
        return null;
    }
    return user;
}
io.on("connection", (socket) => {
    // Handle user actions
    socket.on(socket_1.SocketEvent.JOIN_REQUEST, ({ roomId, username }) => {
        // Check is username exist in the room
        const isUsernameExist = getUsersInRoom(roomId).filter((u) => u.username === username);
        if (isUsernameExist.length > 0) {
            io.to(socket.id).emit(socket_1.SocketEvent.USERNAME_EXISTS);
            return;
        }
        const user = {
            username,
            roomId,
            status: user_1.USER_CONNECTION_STATUS.ONLINE,
            cursorPosition: 0,
            typing: false,
            socketId: socket.id,
            currentFile: null,
            joinTime: new Date(),
        };
        userSocketMap.push(user);
        socket.join(roomId);
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.USER_JOINED, { user });
        const users = getUsersInRoom(roomId);
        io.to(socket.id).emit(socket_1.SocketEvent.JOIN_ACCEPTED, { user, users });
    });
    socket.on("disconnecting", async () => {
        const user = getUserBySocketId(socket.id);
        if (!user)
            return;
        const leaveTime = new Date();
        const joinTime = user.joinTime || leaveTime;
        const duration = Math.floor((leaveTime.getTime() - new Date(joinTime).getTime()) / 1000);
        const today = new Date().toISOString().split("T")[0];
        try {
            await UserSession_1.default.create({
                username: user.username,
                roomId: user.roomId,
                joinTime,
                leaveTime,
                duration,
                date: today
            });
        }
        catch (err) {
            console.error("Error saving session:", err);
        }
        const roomId = user.roomId;
        socket.broadcast
            .to(roomId)
            .emit(socket_1.SocketEvent.USER_DISCONNECTED, { user });
        userSocketMap = userSocketMap.filter((u) => u.socketId !== socket.id);
        socket.leave(roomId);
    });
    // Handle file actions
    socket.on(socket_1.SocketEvent.SYNC_FILE_STRUCTURE, ({ fileStructure, openFiles, activeFile, socketId }) => {
        io.to(socketId).emit(socket_1.SocketEvent.SYNC_FILE_STRUCTURE, {
            fileStructure,
            openFiles,
            activeFile,
        });
    });
    socket.on(socket_1.SocketEvent.DIRECTORY_CREATED, ({ parentDirId, newDirectory }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.DIRECTORY_CREATED, {
            parentDirId,
            newDirectory,
        });
    });
    socket.on(socket_1.SocketEvent.DIRECTORY_UPDATED, ({ dirId, children }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.DIRECTORY_UPDATED, {
            dirId,
            children,
        });
    });
    socket.on(socket_1.SocketEvent.DIRECTORY_RENAMED, ({ dirId, newName }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.DIRECTORY_RENAMED, {
            dirId,
            newName,
        });
    });
    socket.on(socket_1.SocketEvent.DIRECTORY_DELETED, ({ dirId }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast
            .to(roomId)
            .emit(socket_1.SocketEvent.DIRECTORY_DELETED, { dirId });
    });
    socket.on(socket_1.SocketEvent.FILE_CREATED, ({ parentDirId, newFile }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast
            .to(roomId)
            .emit(socket_1.SocketEvent.FILE_CREATED, { parentDirId, newFile });
    });
    socket.on(socket_1.SocketEvent.FILE_UPDATED, ({ fileId, newContent }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.FILE_UPDATED, {
            fileId,
            newContent,
        });
    });
    socket.on(socket_1.SocketEvent.FILE_RENAMED, ({ fileId, newName }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.FILE_RENAMED, {
            fileId,
            newName,
        });
    });
    socket.on(socket_1.SocketEvent.FILE_DELETED, ({ fileId }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.FILE_DELETED, { fileId });
    });
    // Handle user status
    socket.on(socket_1.SocketEvent.USER_OFFLINE, ({ socketId }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socketId) {
                return { ...user, status: user_1.USER_CONNECTION_STATUS.OFFLINE };
            }
            return user;
        });
        const roomId = getRoomId(socketId);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.USER_OFFLINE, { socketId });
    });
    socket.on(socket_1.SocketEvent.USER_ONLINE, ({ socketId }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socketId) {
                return { ...user, status: user_1.USER_CONNECTION_STATUS.ONLINE };
            }
            return user;
        });
        const roomId = getRoomId(socketId);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.USER_ONLINE, { socketId });
    });
    // Handle chat actions
    socket.on(socket_1.SocketEvent.SEND_MESSAGE, ({ message }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast
            .to(roomId)
            .emit(socket_1.SocketEvent.RECEIVE_MESSAGE, { message });
    });
    // Handle cursor position and selection
    socket.on(socket_1.SocketEvent.TYPING_START, ({ cursorPosition, selectionStart, selectionEnd }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socket.id) {
                return {
                    ...user,
                    typing: true,
                    cursorPosition,
                    selectionStart,
                    selectionEnd
                };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user)
            return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.TYPING_START, { user });
    });
    socket.on(socket_1.SocketEvent.TYPING_PAUSE, () => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socket.id) {
                return { ...user, typing: false };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user)
            return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.TYPING_PAUSE, { user });
    });
    // Handle cursor movement without typing
    socket.on(socket_1.SocketEvent.CURSOR_MOVE, ({ cursorPosition, selectionStart, selectionEnd }) => {
        userSocketMap = userSocketMap.map((user) => {
            if (user.socketId === socket.id) {
                return {
                    ...user,
                    cursorPosition,
                    selectionStart,
                    selectionEnd
                };
            }
            return user;
        });
        const user = getUserBySocketId(socket.id);
        if (!user)
            return;
        const roomId = user.roomId;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.CURSOR_MOVE, { user });
    });
    socket.on(socket_1.SocketEvent.REQUEST_DRAWING, () => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast
            .to(roomId)
            .emit(socket_1.SocketEvent.REQUEST_DRAWING, { socketId: socket.id });
    });
    socket.on(socket_1.SocketEvent.SYNC_DRAWING, ({ drawingData, socketId }) => {
        socket.broadcast
            .to(socketId)
            .emit(socket_1.SocketEvent.SYNC_DRAWING, { drawingData });
    });
    socket.on(socket_1.SocketEvent.DRAWING_UPDATE, ({ snapshot }) => {
        const roomId = getRoomId(socket.id);
        if (!roomId)
            return;
        socket.broadcast.to(roomId).emit(socket_1.SocketEvent.DRAWING_UPDATE, {
            snapshot,
        });
    });
});
const PORT = process.env.PORT || 3000;
app.get("/", (req, res) => {
    // Send the index.html file
    res.sendFile(path_1.default.join(__dirname, "..", "public", "index.html"));
});
server.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`);
});
