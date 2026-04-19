import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  targetId: mongoose.Schema.Types.ObjectId,
  content: { type: String, required: true }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Comment", schema);