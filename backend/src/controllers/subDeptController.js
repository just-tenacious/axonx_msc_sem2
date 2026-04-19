import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import SubDepartment from "../models/SubDepartment.js";
import logger from "../utils/logger.js";
import { uploadSubDeptImage } from "../middleware/upload.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const imageUrl = (filename) =>
    filename ? `/uploads/sub-departments/${filename}` : null;

const deleteFile = (imagePath) => {
    if (!imagePath) return;
    const fp = path.join(__dirname, "../../uploads/sub-departments", path.basename(imagePath));
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
};

export default {
    // GET /sub-departments?departmentId=xxx
    getAll: async (req, res) => {
        try {
            const filter = {};
            if (req.query.departmentId) filter.departmentId = req.query.departmentId;
            const docs = await SubDepartment.find(filter);
            res.status(200).json({ success: true, count: docs.length, data: docs });
        } catch (error) {
            logger.error("SubDept getAll", error.message);
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // GET /sub-departments/:id
    getById: async (req, res) => {
        try {
            const doc = await SubDepartment.findById(req.params.id);
            if (!doc) return res.status(404).json({ success: false, error: "Not found" });
            res.status(200).json({ success: true, data: doc });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // POST /sub-departments  (multipart/form-data)
    create: (req, res) => {
        uploadSubDeptImage(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, error: err.message });
            try {
                const { departmentId, name, info, description, details } = req.body;
                const image = req.file ? imageUrl(req.file.filename) : null;
                const doc = await SubDepartment.create({ departmentId, name, info, description, details, image });
                logger.success("SubDepartment created", doc._id);
                res.status(201).json({ success: true, data: doc });
            } catch (error) {
                logger.error("SubDept create", error.message);
                res.status(400).json({ success: false, error: error.message });
            }
        });
    },

    // PUT /sub-departments/:id  (multipart/form-data)
    update: (req, res) => {
        uploadSubDeptImage(req, res, async (err) => {
            if (err) return res.status(400).json({ success: false, error: err.message });
            try {
                const doc = await SubDepartment.findById(req.params.id);
                if (!doc) return res.status(404).json({ success: false, error: "Not found" });

                const { name, info, description, details } = req.body;
                const updates = { name, info, description, details };

                if (req.file) {
                    deleteFile(doc.image);
                    updates.image = imageUrl(req.file.filename);
                }
                if (req.body.clearImage === "true") {
                    deleteFile(doc.image);
                    updates.image = null;
                }

                const updated = await SubDepartment.findByIdAndUpdate(req.params.id, updates, {
                    new: true, runValidators: true
                });
                logger.success("SubDepartment updated", updated._id);
                res.status(200).json({ success: true, data: updated });
            } catch (error) {
                logger.error("SubDept update", error.message);
                res.status(400).json({ success: false, error: error.message });
            }
        });
    },

    // DELETE /sub-departments/:id  (soft delete)
    delete: async (req, res) => {
        try {
            const doc = await SubDepartment.findById(req.params.id);
            if (!doc) return res.status(404).json({ success: false, error: "Not found" });
            await doc.softDelete();
            logger.warn("SubDepartment soft-deleted", doc._id);
            res.status(200).json({ success: true, message: "Sub-Department deleted" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // PATCH /sub-departments/:id/block
    block: async (req, res) => {
        try {
            const doc = await SubDepartment.findByIdAndUpdate(
                req.params.id, { isActive: false }, { new: true }
            );
            if (!doc) return res.status(404).json({ success: false, error: "Not found" });
            logger.warn("SubDepartment blocked", doc._id);
            res.status(200).json({ success: true, data: doc, message: "Sub-Department blocked" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    },

    // PATCH /sub-departments/:id/revoke
    revoke: async (req, res) => {
        try {
            const doc = await SubDepartment.findByIdAndUpdate(
                req.params.id, { isActive: true }, { new: true }
            );
            if (!doc) return res.status(404).json({ success: false, error: "Not found" });
            logger.success("SubDepartment access restored", doc._id);
            res.status(200).json({ success: true, data: doc, message: "Sub-Department access restored" });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
};
