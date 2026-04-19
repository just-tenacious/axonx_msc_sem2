import logger from "../utils/logger.js";

export const createBaseController = (Model, modelName) => {
    return {
        // Create
        create: async (req, res) => {
            try {
                const doc = await Model.create(req.body);
                logger.success(`${modelName} created successfully`, doc._id);
                res.status(201).json({ success: true, data: doc });
            } catch (error) {
                logger.error(`Error creating ${modelName}`, error.message);
                res.status(400).json({ success: false, error: error.message });
            }
        },

        // Get All
        getAll: async (req, res) => {
            try {
                // Support soft delete filter via plugin (default is false)
                const docs = await Model.find();
                res.status(200).json({ success: true, count: docs.length, data: docs });
            } catch (error) {
                logger.error(`Error fetching ${modelName}s`, error.message);
                res.status(500).json({ success: false, error: error.message });
            }
        },

        // Get By ID
        getById: async (req, res) => {
            try {
                const doc = await Model.findById(req.params.id);
                if (!doc) {
                    return res.status(404).json({ success: false, error: `${modelName} not found` });
                }
                res.status(200).json({ success: true, data: doc });
            } catch (error) {
                logger.error(`Error fetching ${modelName} by ID`, error.message);
                res.status(500).json({ success: false, error: error.message });
            }
        },

        // Update
        update: async (req, res) => {
            try {
                const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                    new: true,
                    runValidators: true
                });
                if (!doc) {
                    return res.status(404).json({ success: false, error: `${modelName} not found` });
                }
                logger.success(`${modelName} updated`, doc._id);
                res.status(200).json({ success: true, data: doc });
            } catch (error) {
                logger.error(`Error updating ${modelName}`, error.message);
                res.status(400).json({ success: false, error: error.message });
            }
        },

        // Delete (Soft Delete)
        delete: async (req, res) => {
            try {
                const doc = await Model.findById(req.params.id);
                if (!doc) {
                    return res.status(404).json({ success: false, error: `${modelName} not found` });
                }
                
                // Use the softDelete method from plugin
                await doc.softDelete();
                
                logger.warn(`${modelName} soft-deleted`, doc._id);
                res.status(200).json({ success: true, message: `${modelName} deleted successfully` });
            } catch (error) {
                logger.error(`Error deleting ${modelName}`, error.message);
                res.status(500).json({ success: false, error: error.message });
            }
        }
    };
};
