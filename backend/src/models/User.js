import mongoose from "mongoose";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin","doctor","patient","hospital","researcher","student"],
    default: "patient"
  },
  isActive: { type: Boolean, default: true },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: { type: Date }
}, { timestamps: true });

import { softDeletePlugin } from "../utils/mongoosePlugins.js";
schema.plugin(softDeletePlugin);

export default mongoose.model("User", schema);