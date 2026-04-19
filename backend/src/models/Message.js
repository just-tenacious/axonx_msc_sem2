import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  chatId: { type: mongoose.Schema.Types.ObjectId, ref: "Chat" },
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  text: { type: String, required: true },
  fileUrl: { type: String },
  fileType: { type: String },
  fileName: { type: String }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Message", schema);