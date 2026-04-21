import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import Department from "../models/Department.js";
import SubDepartment from "../models/SubDepartment.js";
import logger from "../utils/logger.js";
import { uploadDeptImage } from "../middleware/upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/** Build the public URL for a stored image filename */
const imageUrl = (filename) =>
    filename ? `/uploads/departments/${filename}` : null;

/** Delete old image file from disk if it exists */
const deleteImageFile = (imageField) => {
    if (!imageField) return;
    // imageField may be a full URL path like /uploads/departments/dept-xxx.jpg
    const filename = path.basename(imageField);
    const filepath = path.join(__dirname, "../../uploads/departments", filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
};

/** Attach subDepartmentCount to a dept document object */
const withSubCount = async (dept) => {
    const subCount = await SubDepartment.countDocuments({ departmentId: dept._id });
    return { ...dept.toObject(), subDepartmentCount: subCount };
};

export default {
    // ────────────────────────────────────────────────────────────────
    // GET /departments
    // ────────────────────────────────────────────────────────────────
    getAll: async (req, res) => {
        try {
            const departments = await Department.find();
            const result = await Promise.all(departments.map(withSubCount));
            res.status(200).json({ success: true, count: result.length, data: result });
        } catch (error) {
            logger.error("Error fetching departments", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ────────────────────────────────────────────────────────────────
    // GET /departments/:id
    // ────────────────────────────────────────────────────────────────
    getById: async (req, res) => {
        try {
            const dept = await Department.findById(req.params.id);
            if (!dept) return res.status(404).json({ success: false, error: "Department not found" });
            res.status(200).json({ success: true, data: await withSubCount(dept) });
        } catch (error) {
            logger.error("Error fetching department by ID", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ────────────────────────────────────────────────────────────────
    // POST /departments  (multipart/form-data)
    // ────────────────────────────────────────────────────────────────
    create: (req, res) => {
        uploadDeptImage(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, error: err.message });
            try {
                const { name, description, details } = req.body;
                const image = req.file ? imageUrl(req.file.filename) : null;
                const dept = await Department.create({ name, description, details, image });
                logger.success("Department created", dept._id);
                res.status(201).json({ success: true, data: { ...dept.toObject(), subDepartmentCount: 0 } });
            } catch (error) {
                logger.error("Error creating department", error.message);
                res.status(400).json({ success: false, error: error.message });
            }
        });
    },

    // ────────────────────────────────────────────────────────────────
    // PUT /departments/:id  (multipart/form-data)
    // ────────────────────────────────────────────────────────────────
    update: (req, res) => {
        uploadDeptImage(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, error: err.message });
            try {
                const dept = await Department.findById(req.params.id);
                if (!dept) return res.status(404).json({ success: false, error: "Department not found" });

                const { name, description, details } = req.body;
                const updates = { name, description, details };

                if (req.file) {
                    // Remove old image if present
                    deleteImageFile(dept.image);
                    updates.image = imageUrl(req.file.filename);
                }
                // Allow explicitly clearing image via body flag
                if (req.body.clearImage === "true") {
                    deleteImageFile(dept.image);
                    updates.image = null;
                }

                const updated = await Department.findByIdAndUpdate(req.params.id, updates, {
                    new: true,
                    runValidators: true
                });

                logger.success("Department updated", updated._id);
                res.status(200).json({ success: true, data: await withSubCount(updated) });
            } catch (error) {
                console.error("DEPT_UPDATE_ERROR:", error);
                logger.error("Error updating department", error.message);
                res.status(400).json({ success: false, error: error.message });
            }
        });
    },

    // ────────────────────────────────────────────────────────────────
    // DELETE /departments/:id  — soft delete
    // ────────────────────────────────────────────────────────────────
    delete: async (req, res) => {
        try {
            const dept = await Department.findById(req.params.id);
            if (!dept) return res.status(404).json({ success: false, error: "Department not found" });
            await dept.softDelete();
            logger.warn("Department soft-deleted", dept._id);
            res.status(200).json({ success: true, message: "Department deleted successfully" });
        } catch (error) {
            logger.error("Error deleting department", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ────────────────────────────────────────────────────────────────
    // PATCH /departments/:id/block
    // ────────────────────────────────────────────────────────────────
    block: async (req, res) => {
        try {
            const dept = await Department.findByIdAndUpdate(
                req.params.id, { isActive: false }, { new: true }
            );
            if (!dept) return res.status(404).json({ success: false, error: "Department not found" });
            logger.warn("Department blocked", dept._id);
            res.status(200).json({ success: true, data: dept, message: "Department blocked" });
        } catch (error) {
            logger.error("Error blocking department", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // ────────────────────────────────────────────────────────────────
    // PATCH /departments/:id/revoke
    // ────────────────────────────────────────────────────────────────
    revoke: async (req, res) => {
        try {
            const dept = await Department.findByIdAndUpdate(
                req.params.id, { isActive: true }, { new: true }
            );
            if (!dept) return res.status(404).json({ success: false, error: "Department not found" });
            logger.success("Department access restored", dept._id);
            res.status(200).json({ success: true, data: dept, message: "Department access restored" });
        } catch (error) {
            logger.error("Error revoking department block", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
