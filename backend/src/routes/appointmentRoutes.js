import express from "express";
import appointmentController from "../controllers/appointmentController.js";

const router = express.Router();

router.get("/stats", appointmentController.getStats);
router.get("/history", appointmentController.getHistory);
router.get("/", appointmentController.getAll);
router.get("/:id", appointmentController.getById);
router.post("/", appointmentController.create);
router.put("/:id", appointmentController.update);
router.delete("/:id", appointmentController.delete);

export default router;
