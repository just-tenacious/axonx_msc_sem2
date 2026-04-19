import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  college: { type: String, required: true },
  degree: { type: String },
  yearOfStudy: { type: Number, default: 1, max: 5 }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("StudentProfile", schema);