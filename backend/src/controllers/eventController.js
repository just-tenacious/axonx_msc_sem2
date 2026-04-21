import Event from "../models/Event.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";

const baseController = createBaseController(Event, "Event");

const eventController = {
    ...baseController,
    
    getAll: async (req, res) => {
        try {
            const { status } = req.query;
            let query = {};
            if (status && status !== 'All') {
                query.status = status;
            }
            const docs = await Event.find(query).sort({ startDate: -1 });
            res.status(200).json({ success: true, count: docs.length, data: docs });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },
    
    getStats: async (req, res) => {
        try {
            const all = await Event.countDocuments();
            const upcoming = await Event.countDocuments({ status: "Upcoming" });
            const ongoing = await Event.countDocuments({ status: "Ongoing" });
            const completed = await Event.countDocuments({ status: "Completed" });
            const cancelled = await Event.countDocuments({ status: "Cancelled" });

            res.status(200).json({
                success: true,
                data: { all, upcoming, ongoing, completed, cancelled }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getByHospital: async (req, res) => {
        try {
            const { hospitalId } = req.params;
            const docs = await Event.find({ hospitalId }).sort({ startDate: -1 });
            res.status(200).json({ success: true, data: docs });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

export default eventController;
