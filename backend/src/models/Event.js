import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  status: {
    type: String,
    enum: ["Upcoming","Ongoing","Finished"],
    default: "Upcoming"
  },
  title: { type: String, required: true },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "HospitalProfile" },
  description: { type: String },
  timings: { type: String },
  startDate: Date,
  endDate: Date
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Event", schema);