import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  username: { type: String, unique: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["admin", "doctor", "patient", "hospital", "researcher", "student"],
    default: "patient"
  },
  isActive: { type: Boolean, default: true },
  gender: { type: String, enum: ["Male", "Female", "Other"] },
  dob: { type: Date },
  avatar: { type: String },
  bio: { type: String },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Department" },
  subDepartmentId: { type: mongoose.Schema.Types.ObjectId, ref: "SubDepartment" },
  hospitalId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true });

schema.pre('save', function() {
  if (this.hospitalId && this.role !== 'doctor') {
    throw new Error('Security Constraint: Hospital associations are only valid for clinical commander (doctor) nodes.');
  }
});

schema.pre('findOneAndUpdate', function() {
  const update = this.getUpdate();
  const role = update.role || (update.$set && update.$set.role);
  if ((update.hospitalId || (update.$set && update.$set.hospitalId)) && role && role !== 'doctor') {
    throw new Error('Security Constraint: Hospital associations are only valid for clinical commander (doctor) nodes.');
  }
});

schema.plugin(softDeletePlugin);

export default mongoose.model("User", schema);