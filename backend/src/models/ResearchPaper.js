import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  publisherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  publishDate: { type: Date, default: Date.now },
  commentsCount: { type: Number, default: 0 }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("ResearchPaper", schema);