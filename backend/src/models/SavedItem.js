import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

// Polymorphic saved/bookmarked items for any logged-in user
const schema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  itemId:   { type: mongoose.Schema.Types.ObjectId, required: true },
  itemType: { type: String, enum: ["ResearchPaper", "DoctorProfile", "Event"], required: true }
}, { timestamps: true });

// One save per user per item
schema.index({ userId: 1, itemId: 1, itemType: 1 }, { unique: true });
schema.plugin(softDeletePlugin);

export default mongoose.model("SavedItem", schema);