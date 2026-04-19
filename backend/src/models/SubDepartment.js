import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  name:         { type: String, required: true },
  info:         String,
  image:        String,
  description:  String,
  details:      String,
  isActive:     { type: Boolean, default: true }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("SubDepartment", schema);