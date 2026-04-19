import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  name: { type: String, unique: true },
  image: String,
  description: String,
  details: String
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Department", schema);