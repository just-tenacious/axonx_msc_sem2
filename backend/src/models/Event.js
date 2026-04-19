import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Upcoming","Ongoing","Finished","Completed","Cancelled"],
    default: "Upcoming"
  },
  title: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "HospitalProfile" },
  description: { type: String },
  detailedDescription: { type: String },
  tagline: { type: String },
  image: { type: String, default: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&q=80" },
  departments: [{ type: String }],
  subDepartments: [{ type: String }],
  category: { type: String, default: "Conference" },
  location: { type: String },
  timings: { type: String },
  startDate: { type: Date },
  endDate: { type: Date }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Event", schema);