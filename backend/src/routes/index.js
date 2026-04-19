import express from "express";
import userRoutes from "./userRoutes.js";
import hospitalRoutes from "./hospitalRoutes.js";
import researchRoutes from "./researchRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import departmentController from "../controllers/departmentController.js";
import subDeptController from "../controllers/subDeptController.js";
import appointmentController from "../controllers/appointmentController.js";
import messageController from "../controllers/messageController.js";

const router = express.Router();

// Modular Routes
router.use("/users", userRoutes);
router.use("/hospitals", hospitalRoutes);
router.use("/research", researchRoutes);
router.use("/availability", availabilityRoutes);

// Shared/Simple Routes (Map controllers directly if no specialized logic needed yet)
const mapBasicRoutes = (path, controller) => {
    router.get(path, controller.getAll);
    router.get(`${path}/:id`, controller.getById);
    router.post(path, controller.create);
    router.put(`${path}/:id`, controller.update);
    router.delete(`${path}/:id`, controller.delete);
};

mapBasicRoutes("/departments", departmentController);
mapBasicRoutes("/sub-departments", subDeptController);
mapBasicRoutes("/appointments", appointmentController);
mapBasicRoutes("/messages", messageController);

export default router;
