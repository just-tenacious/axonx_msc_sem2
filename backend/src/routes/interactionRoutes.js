import express from "express";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";
import SavedItem from "../models/SavedItem.js";
import Review from "../models/Review.js";
import logger from "../utils/logger.js";

const router = express.Router();

// ── LIKES ─────────────────────────────────────────────────────────────────
// GET  /interactions/likes?targetId=&targetType=   → count + check if user liked
// POST /interactions/likes                         → toggle like (add/remove)
router.get("/likes", async (req, res) => {
    try {
        const { targetId, targetType, userId } = req.query;
        const filter = { targetId, targetType };
        const count = await Like.countDocuments(filter);
        const liked = userId ? !!(await Like.findOne({ ...filter, userId })) : false;
        res.json({ success: true, data: { count, liked } });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/likes/toggle", async (req, res) => {
    try {
        const { userId, targetId, targetType } = req.body;
        const existing = await Like.findOne({ userId, targetId, targetType });
        if (existing) {
            await Like.deleteOne({ _id: existing._id });
            return res.json({ success: true, liked: false });
        }
        await Like.create({ userId, targetId, targetType });
        res.json({ success: true, liked: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── COMMENTS ──────────────────────────────────────────────────────────────
// GET  /interactions/comments?targetId=&targetType=
// POST /interactions/comments
// DELETE /interactions/comments/:id
router.get("/comments", async (req, res) => {
    try {
        const { targetId, targetType } = req.query;
        const comments = await Comment.find({ targetId, targetType })
            .populate("userId", "name avatar role")
            .sort({ createdAt: -1 });
        res.json({ success: true, data: comments });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/comments", async (req, res) => {
    try {
        const { userId, targetId, targetType, content } = req.body;
        if (!content?.trim()) return res.status(400).json({ success: false, error: "Comment content is required." });
        const comment = await Comment.create({ userId, targetId, targetType, content });
        const populated = await comment.populate("userId", "name avatar role");
        res.status(201).json({ success: true, data: populated });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete("/comments/:id", async (req, res) => {
    try {
        await Comment.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── SAVED ITEMS ───────────────────────────────────────────────────────────
// GET  /interactions/saved?userId=&itemType=
// POST /interactions/saved/toggle
router.get("/saved", async (req, res) => {
    try {
        const { userId, itemType, itemId } = req.query;
        const filter = { userId };
        if (itemType) filter.itemType = itemType;
        if (itemId) {
            // Just check if saved
            const saved = await SavedItem.findOne({ userId, itemId, itemType });
            return res.json({ success: true, data: { saved: !!saved } });
        }
        const items = await SavedItem.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, data: items });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/saved/toggle", async (req, res) => {
    try {
        const { userId, itemId, itemType } = req.body;
        const existing = await SavedItem.findOne({ userId, itemId, itemType });
        if (existing) {
            await SavedItem.deleteOne({ _id: existing._id });
            return res.json({ success: true, saved: false });
        }
        await SavedItem.create({ userId, itemId, itemType });
        res.json({ success: true, saved: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.get("/saved/count", async (req, res) => {
    try {
        const { itemId, itemType } = req.query;
        const count = await SavedItem.countDocuments({ itemId, itemType });
        res.json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// ── REVIEWS (Doctor-specific) ─────────────────────────────────────────────
// GET  /interactions/reviews?doctorId=
// POST /interactions/reviews
// DELETE /interactions/reviews/:id
router.get("/reviews", async (req, res) => {
    try {
        const { doctorId } = req.query;
        const filter = doctorId ? { doctorId } : {};
        const reviews = await Review.find(filter)
            .populate("patientId", "name avatar")
            .sort({ createdAt: -1 });
        const avgRating = reviews.length
            ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length).toFixed(1)
            : 0;
        res.json({ success: true, data: reviews, avgRating });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.post("/reviews", async (req, res) => {
    try {
        const { doctorId, patientId, rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({ success: false, error: "Rating must be between 1 and 5." });
        }
        // One review per patient per doctor
        const existing = await Review.findOne({ doctorId, patientId });
        if (existing) {
            const updated = await Review.findByIdAndUpdate(existing._id, { rating, comment }, { new: true });
            return res.json({ success: true, data: updated, updated: true });
        }
        const review = await Review.create({ doctorId, patientId, rating, comment });
        res.status(201).json({ success: true, data: review });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

router.delete("/reviews/:id", async (req, res) => {
    try {
        await Review.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

export default router;
