import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  bloodGroup: String,
  medications: [String]
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("PatientProfile", schema);