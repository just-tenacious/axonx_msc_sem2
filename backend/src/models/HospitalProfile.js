import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  hospitalName: { type: String, required: true },
  registrationNumber: { type: String, unique: true },
  address: {
    city: String,
    state: String,
    pincode: String
  },
  departments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Department" }],
  facilities: Object,
  rating: { type: Number, default: 0, max: 5 }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("HospitalProfile", schema);