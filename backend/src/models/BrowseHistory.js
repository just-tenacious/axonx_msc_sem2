import mongoose from "mongoose";

const browseHistorySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  url: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["Department", "Research", "Event", "Doctor", "Dashboard"],
    required: true,
  },
  viewedAt: {
    type: Date,
    default: Date.now,
  },
});

const BrowseHistory = mongoose.model("BrowseHistory", browseHistorySchema);
export default BrowseHistory;
