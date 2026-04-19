import HospitalProfile from "../models/HospitalProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import Event from "../models/Event.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";

const base = createBaseController(HospitalProfile, "HospitalProfile");

export default {
    ...base,

    // Get all doctors of a specific hospital
    getHospitalDoctors: async (req, res) => {
        try {
            const { id } = req.params; // hospitalProfile ID
            const doctors = await DoctorProfile.find({ hospitalId: id }).populate("userId", "name email");
            res.status(200).json({ success: true, count: doctors.length, data: doctors });
        } catch (error) {
            logger.error("Error fetching hospital doctors", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Get all events of a specific hospital
    getHospitalEvents: async (req, res) => {
        try {
            const { id } = req.params;
            const events = await Event.find({ hospitalId: id });
            res.status(200).json({ success: true, count: events.length, data: events });
        } catch (error) {
            logger.error("Error fetching hospital events", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
