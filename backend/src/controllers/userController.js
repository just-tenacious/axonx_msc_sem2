import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import DoctorProfile from "../models/DoctorProfile.js";
import HospitalProfile from "../models/HospitalProfile.js";
import ResearcherProfile from "../models/ResearcherProfile.js";
import PatientProfile from "../models/PatientProfile.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";

const base = createBaseController(User, "User");

export default {
    ...base,

    // Specific logic: user + roleProfile
    getUserWithProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, error: "User not found" });
            }

            let profile = null;
            const profileFilter = { userId: id };

            // Dynamically fetch profile based on role
            switch (user.role) {
                case "student":
                    profile = await StudentProfile.findOne(profileFilter);
                    break;
                case "doctor":
                    profile = await DoctorProfile.findOne(profileFilter).populate("hospitalId");
                    break;
                case "hospital":
                    profile = await HospitalProfile.findOne(profileFilter);
                    break;
                case "researcher":
                    profile = await ResearcherProfile.findOne(profileFilter);
                    break;
                case "patient":
                    profile = await PatientProfile.findOne(profileFilter);
                    break;
                default:
                    break;
            }

            res.status(200).json({
                success: true,
                data: {
                    ...user._doc,
                    profile: profile || {}
                }
            });
        } catch (error) {
            logger.error("Error in getUserWithProfile", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    login: async (req, res) => {
        try {
            const { identifier, password } = req.body;
            
            // Search by email OR username
            const user = await User.findOne({ 
                $or: [
                    { email: identifier },
                    { username: identifier }
                ]
            });

            if (!user) {
                return res.status(404).json({ success: false, error: "User not found" });
            }

            // check password (simple comparison for now as requested)
            if (user.password !== password) {
                return res.status(401).json({ success: false, error: "Invalid credentials" });
            }

            res.status(200).json({
                success: true,
                message: "Login successful",
                data: user
            });
        } catch (error) {
            logger.error("Error in login", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    register: async (req, res) => {
        try {
            const userData = req.body;
            
            // Check if user already exists
            const existingUser = await User.findOne({ 
                $or: [
                    { email: userData.email },
                    { username: userData.username }
                ]
            });

            if (existingUser) {
                return res.status(400).json({ success: false, error: "Username or Email already exists" });
            }

            const user = await User.create(userData);
            
            res.status(201).json({
                success: true,
                message: "User registered successfully",
                data: user
            });
        } catch (error) {
            logger.error("Error in register", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
