import ResearchPaper from "../models/ResearchPaper.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";

const base = createBaseController(ResearchPaper, "ResearchPaper");

export default {
    ...base,

    // Get papers by publisher (User ID)
    getPapersByPublisher: async (req, res) => {
        try {
            const { userId } = req.params;
            const papers = await ResearchPaper.find({ publisherId: userId });
            res.status(200).json({ success: true, count: papers.length, data: papers });
        } catch (error) {
            logger.error("Error fetching papers by publisher", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
