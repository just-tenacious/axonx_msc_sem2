import Appointment from "../models/Appointment.js";
import User from "../models/User.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";
import { emitEvent } from "../socket.js";

const baseController = createBaseController(Appointment, "Appointment");

const appointmentController = {
    ...baseController,

    // Override getAll to include deep population for patient and doctor user info
    getAll: async (req, res) => {
        try {
            const { status } = req.query;
            let query = {};
            if (status && status !== 'All') {
                query.status = status;
            }

            const appointments = await Appointment.find(query)
                .populate('patientId', 'name email role gender avatar')
                .populate('doctorId', 'name email role gender avatar')
                .sort({ date: -1, time: -1 });

            res.status(200).json({
                success: true,
                count: appointments.length,
                data: appointments
            });
        } catch (error) {
            logger.error(`Error fetching appointments`, error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Detailed getById with population
    getById: async (req, res) => {
        try {
            const appointment = await Appointment.findById(req.params.id)
                .populate('patientId')
                .populate('doctorId');

            if (!appointment) {
                return res.status(404).json({ success: false, error: "Appointment not found" });
            }

            res.status(200).json({ success: true, data: appointment });
        } catch (error) {
            logger.error(`Error fetching appointment by ID`, error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // New stats method
    getStats: async (req, res) => {
        try {
            const all = await Appointment.countDocuments();
            const pending = await Appointment.countDocuments({ status: "Pending" });
            const confirmed = await Appointment.countDocuments({ status: "Confirmed" });
            const completed = await Appointment.countDocuments({ status: "Completed" });
            const cancelled = await Appointment.countDocuments({ status: "Cancelled" });

            res.status(200).json({
                success: true,
                data: { all, pending, confirmed, completed, cancelled }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    getHistory: async (req, res) => {
        try {
            const { userId, role } = req.query;
            let query = {};
            if (role === 'doctor') query.doctorId = userId;
            else query.patientId = userId;

            const history = await Appointment.find(query)
                .populate('patientId', 'name avatar role')
                .populate('doctorId', 'name avatar role')
                .sort({ date: -1 });

            res.status(200).json({ success: true, data: history });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    create: async (req, res) => {
        try {
            const { patientId, doctorId } = req.body;
            
            // Validate Patient/Student
            const patient = await User.findById(patientId);
            if (!patient || patient.role === 'admin') {
                return res.status(400).json({ success: false, error: "Invalid client node. Admin accounts cannot book clinical sessions." });
            }

            // Validate Doctor
            const doctor = await User.findById(doctorId);
            if (!doctor || doctor.role !== 'doctor') {
                return res.status(400).json({ success: false, error: "Invalid medical specialist node. Must be Doctor." });
            }

            const appointment = await Appointment.create(req.body);
            emitEvent("appointment_created", appointment);
            res.status(201).json({ success: true, data: appointment });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    update: async (req, res) => {
        try {
            const { patientId, doctorId } = req.body;
            
            if (patientId) {
                const patient = await User.findById(patientId);
                if (!patient || (patient.role !== 'patient' && patient.role !== 'student')) {
                    return res.status(400).json({ success: false, error: "Invalid client role." });
                }
            }

            if (doctorId) {
                const doctor = await User.findById(doctorId);
                if (!doctor || doctor.role !== 'doctor') {
                    return res.status(400).json({ success: false, error: "Invalid specialist role." });
                }
            }

            const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!appointment) return res.status(404).json({ success: false, error: "Record not found" });
            
            emitEvent("appointment_updated", appointment);
            res.status(200).json({ success: true, data: appointment });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};

export default appointmentController;
