import mongoose from 'mongoose';
import Like from '../src/models/Like.js';
import Comment from '../src/models/Comment.js';
import SavedItem from '../src/models/SavedItem.js';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/axonx";

async function fixData() {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected for Interaction Data Fix...");

    // FIX LIKES
    console.log("Processing Likes...");
    const orphanedLikes = await Like.find({ targetType: { $exists: false } });
    for (const like of orphanedLikes) {
        try {
            // Check if a like already exists with targetType: ResearchPaper
            const existing = await Like.findOne({ 
                userId: like.userId, 
                targetId: like.targetId, 
                targetType: 'ResearchPaper' 
            });
            if (existing) {
                await Like.deleteOne({ _id: like._id });
            } else {
                like.targetType = 'ResearchPaper';
                await like.save();
            }
        } catch (e) { console.error(`Error on like ${like._id}:`, e.message); }
    }

    // FIX COMMENTS
    console.log("Processing Comments...");
    const orphanedComments = await Comment.find({ targetType: { $exists: false } });
    for (const comm of orphanedComments) {
        comm.targetType = 'ResearchPaper';
        await comm.save();
    }

    // FIX SAVED ITEMS
    console.log("Processing SavedItems...");
    const orphanedSaved = await SavedItem.find({ itemType: { $exists: false } });
    for (const s of orphanedSaved) {
        s.itemType = 'ResearchPaper';
        await s.save();
    }

    console.log("Data Fix Complete.");
    process.exit();
}

fixData().catch(err => { console.error(err); process.exit(1); });
