import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from "../models/User.js";

const chatController = {
    // Get all chats, populated with participants
    getAll: async (req, res) => {
        try {
            const chats = await Chat.find()
                .populate("participants", "name email role avatar")
                .populate({ path: "lastMessage", model: "Message" })
                .sort({ updatedAt: -1 });
            res.status(200).json({ success: true, count: chats.length, data: chats });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get messages for a chat ID
    getMessages: async (req, res) => {
        try {
            const { chatId } = req.params;
            const messages = await Message.find({ chatId })
                .populate("senderId", "name email role avatar")
                .sort({ createdAt: 1 });
            res.status(200).json({ success: true, count: messages.length, data: messages });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Find or create a chat between two users
    findOrCreate: async (req, res) => {
        try {
            const { user1, user2 } = req.body;
            // Find existing chat with exactly these two participants
            let chat = await Chat.findOne({
                participants: { $all: [user1, user2], $size: 2 }
            }).populate("participants", "name email role avatar");

            if (!chat) {
                chat = await Chat.create({ participants: [user1, user2] });
                chat = await Chat.findById(chat._id).populate("participants", "name email role avatar");
            }
            res.status(200).json({ success: true, data: chat });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Get all users for the people picker
    getUsers: async (req, res) => {
        try {
            const users = await User.find({}, "name email role avatar").sort({ name: 1 });
            res.status(200).json({ success: true, data: users });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    },

    // Stats
    getStats: async (req, res) => {
        try {
            const all = await Chat.countDocuments();
            res.status(200).json({ success: true, data: { all } });
        } catch (err) {
            res.status(500).json({ success: false, error: err.message });
        }
    }
};

export default chatController;
