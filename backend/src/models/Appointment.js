import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile" },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile" },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending","Confirmed","Cancelled"],
    default: "Pending"
  },
  type: {
    type: String,
    enum: ["online","offline"],
    default: "offline"
  }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Appointment", schema);