import mongoose from "mongoose";
import { softDeletePlugin } from "../utils/mongoosePlugins.js";

const schema = new mongoose.Schema({
  email: { type: String, required: true },
  subject: { type: String, required: true },
  status: {
    type: String,
    enum: ["Pending","Resolved"],
    default: "Pending"
  }
}, { timestamps: true });

schema.plugin(softDeletePlugin);

export default mongoose.model("ContactQuery", schema);