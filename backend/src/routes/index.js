import express from "express";
import userRoutes from "./userRoutes.js";
import availabilityRoutes from "./availabilityRoutes.js";
import departmentController from "../controllers/departmentController.js";
import subDeptController from "../controllers/subDeptController.js";
import * as contactController from "../controllers/contactController.js";
import eventRoutes from "./eventRoutes.js";
import interactionRoutes from "./interactionRoutes.js";
import researchRoutes from "./researchRoutes.js";
import appointmentRoutes from "./appointmentRoutes.js";

const router = express.Router();

// Modular Routes
router.use("/users", userRoutes);
router.use("/availability", availabilityRoutes);
router.use("/events", eventRoutes);
router.use("/interactions", interactionRoutes);
router.use("/appointments", appointmentRoutes);
router.use("/research-papers", researchRoutes);

// ── Department Routes (custom controller with block/revoke + subdept count) ──
router.get("/departments",             departmentController.getAll);
router.get("/departments/:id",         departmentController.getById);
router.post("/departments",            departmentController.create);
router.put("/departments/:id",         departmentController.update);
router.delete("/departments/:id",      departmentController.delete);
router.patch("/departments/:id/block", departmentController.block);
router.patch("/departments/:id/revoke",departmentController.revoke);

// Shared/Simple Routes
const mapBasicRoutes = (path, controller) => {
    router.get(path, controller.getAll);
    router.get(`${path}/:id`, controller.getById);
    router.post(path, controller.create);
    router.put(`${path}/:id`, controller.update);
    router.delete(`${path}/:id`, controller.delete);
};

// ── Sub-Department Routes (custom controller with image upload + dept filter) ──
router.get("/sub-departments",              subDeptController.getAll);
router.get("/sub-departments/:id",          subDeptController.getById);
router.post("/sub-departments",             subDeptController.create);
router.put("/sub-departments/:id",          subDeptController.update);
router.delete("/sub-departments/:id",       subDeptController.delete);
router.patch("/sub-departments/:id/block",  subDeptController.block);
router.patch("/sub-departments/:id/revoke", subDeptController.revoke);
// ── Support/Contact Routes ──
router.get("/support/queries",    contactController.getAllQueries);
router.post("/support/queries",   contactController.createQuery);
router.patch("/support/queries/:id", contactController.updateQueryStatus);

export default router;
