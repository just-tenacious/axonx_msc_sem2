import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  name:        { type: String, unique: true, required: true },
  image:       String,
  description: String,
  details:     String,
  isActive:    { type: Boolean, default: true }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Department", schema);