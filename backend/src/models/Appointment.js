import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending","Confirmed","Cancelled", "Completed"],
    default: "Pending"
  }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Appointment", schema);