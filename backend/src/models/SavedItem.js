import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  itemId: mongoose.Schema.Types.ObjectId,
  itemType: { type: String, enum: ["ResearchPaper", "DoctorProfile", "Event"] }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("SavedItem", schema);