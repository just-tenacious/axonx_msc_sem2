import DoctorAvailability from "../models/DoctorAvailability.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";

const base = createBaseController(DoctorAvailability, "DoctorAvailability");

export default {
    ...base,

    // Overwrite getAll or add specialized get
    getUpcomingAvailability: async (req, res) => {
        try {
            const { doctorId } = req.params;
            const now = new Date();
            const availability = await DoctorAvailability.find({
                doctorId,
                date: { $gte: now },
                isActive: true
            }).sort({ date: 1 });
            
            res.status(200).json({ success: true, count: availability.length, data: availability });
        } catch (error) {
            logger.error("Error fetching upcoming availability", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
