import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  publisherId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  subDeptId: { type: mongoose.Schema.Types.ObjectId, ref: "SubDepartment" },
  title: { type: String, required: true },
  abstract: { type: String, required: true },
  content: { type: String }, 
  category: { type: String, default: "General" },
  publishDate: { type: Date, default: Date.now },
  pdfUrl: { type: String },
  
  // Nodal Status Management
  status: { 
    type: String, 
    enum: ['Pending', 'Approved', 'Rejected', 'Suspended'], 
    default: 'Pending' 
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

schema.plugin(softDeletePlugin);

export default mongoose.model("ResearchPaper", schema);