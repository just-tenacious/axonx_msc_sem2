import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile" },
  date: { type: Date, required: true },
  slots: [
    {
      time: String,
      isBooked: { type: Boolean, default: false }
    }
  ],
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("DoctorAvailability", schema);