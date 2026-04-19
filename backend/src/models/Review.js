import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile" },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: "PatientProfile" },
  rating: { type: Number, min: 1, max: 5 },
  comment: String
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("Review", schema);