import ResearchPaper from "../models/ResearchPaper.js";
import Like from "../models/Like.js";
import Comment from "../models/Comment.js";
import SavedItem from "../models/SavedItem.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";

const base = createBaseController(ResearchPaper, "ResearchPaper");

export default {
    ...base,

    // Dynamic retrieval with interaction counts
    getAll: async (req, res) => {
        try {
            const { status } = req.query;
            const query = status ? { status } : {};

            const papers = await ResearchPaper.find(query)
                .populate('publisherId', 'name username role avatar text')
                .populate('departmentId', 'name')
                .populate('subDeptId', 'name')
                .sort({ createdAt: -1 });

            // Enhance with dynamic interaction aggregations
            const enrichedPapers = await Promise.all(papers.map(async (paper) => {
                const [likes, comments, saves] = await Promise.all([
                    Like.countDocuments({ targetId: paper._id }),
                    Comment.countDocuments({ targetId: paper._id }),
                    SavedItem.countDocuments({ itemId: paper._id })
                ]);
                return {
                    ...paper.toObject(),
                    likesCount: likes,
                    commentsCountVal: comments,
                    savedCount: saves
                };
            }));

            res.status(200).json({ success: true, count: enrichedPapers.length, data: enrichedPapers });
        } catch (error) {
            logger.error("Error fetching archival papers", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Detailed retrieval with curated interaction identity lists
    getById: async (req, res) => {
        try {
            const paper = await ResearchPaper.findById(req.params.id)
                .populate('publisherId', 'name username role avatar email')
                .populate('departmentId', 'name')
                .populate('subDeptId', 'name');

            if (!paper) return res.status(404).json({ success: false, error: "Manuscript not found" });

            const [likes, comments, saves] = await Promise.all([
                Like.find({ targetId: paper._id }).populate('userId', 'name avatar username role'),
                Comment.find({ targetId: paper._id }).populate('userId', 'name avatar username role'),
                SavedItem.countDocuments({ itemId: paper._id })
            ]);

            res.status(200).json({
                success: true,
                data: {
                    ...paper.toObject(),
                    likes,
                    comments,
                    savedCount: saves
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Nodal Access Control (Approve, Reject, Suspend)
    updateNodalStatus: async (req, res) => {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const validStatuses = ['Pending', 'Approved', 'Rejected', 'Suspended'];
            if (!validStatuses.includes(status)) {
                return res.status(400).json({ success: false, error: "Invalid status protocol" });
            }

            const paper = await ResearchPaper.findByIdAndUpdate(
                id,
                { status },
                { new: true }
            );

            if (!paper) return res.status(404).json({ success: false, error: "Manuscript not found" });

            res.status(200).json({
                success: true,
                data: paper,
                message: `Manuscript status transitioned to ${status}`
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
