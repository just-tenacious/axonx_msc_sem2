import mongoose from "mongoose";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "HospitalProfile" },
  deptIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  role: { type: String, required: true },
  qualifications: [
    {
      degree: String,
      year: Number
    }
  ],
  licenseNumber: { type: String, unique: true },
  bio: String,
  rating: { type: Number, default: 0, max: 5 },
  availability: [
    {
      date: { type: Date, required: true },
      slots: [{ time: String, isBooked: { type: Boolean, default: false } }]
    }
  ]
}, { timestamps: true });

import { softDeletePlugin } from "../utils/mongoosePlugins.js";
schema.plugin(softDeletePlugin);

export default mongoose.model("DoctorProfile", schema);