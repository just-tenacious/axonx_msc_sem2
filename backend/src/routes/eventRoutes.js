import express from "express";
import eventController from "../controllers/eventController.js";

const router = express.Router();

router.get("/stats", eventController.getStats);
router.get("/", eventController.getAll);
router.get("/:id", eventController.getById);
router.get("/hospital/:hospitalId", eventController.getByHospital);
router.post("/", eventController.create);
router.put("/:id", eventController.update);
router.delete("/:id", eventController.delete);

export default router;
