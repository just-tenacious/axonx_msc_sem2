import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  deptIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  subDeptIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "SubDepartment" }],
  publications: { type: Number, default: 0 }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("ResearcherProfile", schema);