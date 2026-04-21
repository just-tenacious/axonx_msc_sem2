import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  targetId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { type: String, enum: ["Event", "ResearchPaper", "DoctorProfile"], required: true },
  content:    { type: String, required: true }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Comment", schema);