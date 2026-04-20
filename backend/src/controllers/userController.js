import User from "../models/User.js";
import { createBaseController } from "./baseController.js";
import logger from "../utils/logger.js";

const base = createBaseController(User, "User");

export default {
    ...base,

    // Override getAll to support ?role=, ?subDeptId= filters
    getAll: async (req, res) => {
        try {
            const filter = {};
            if (req.query.role) filter.role = req.query.role;
            const users = await User.find(filter).select('-password');
            res.status(200).json({ success: true, count: users.length, data: users });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Get hospitals for a specific sub-department
    getHospitalsBySubDept: async (req, res) => {
        try {
            const { subDeptId } = req.params;
            const hospitals = await User.find({ role: 'hospital' })
                .select('-password');
            res.status(200).json({ success: true, count: hospitals.length, data: hospitals });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // Specific logic: user detail
    getUserWithProfile: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findById(id);
            if (!user) {
                return res.status(404).json({ success: false, error: "User not found" });
            }
            res.status(200).json({
                success: true,
                data: user
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
