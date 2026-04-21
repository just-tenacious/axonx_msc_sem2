import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ["Event", "ResearchPaper", "DoctorProfile"], required: true }
}, { timestamps: true });

// One like per user per target
schema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });
schema.plugin(softDeletePlugin);

export default mongoose.model("Like", schema);