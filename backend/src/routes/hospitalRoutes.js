import express from "express";
import hospitalController from "../controllers/hospitalController.js";

const router = express.Router();

router.get("/", hospitalController.getAll);
router.get("/:id", hospitalController.getById);
router.get("/:id/doctors", hospitalController.getHospitalDoctors);
router.get("/:id/events", hospitalController.getHospitalEvents);
router.post("/", hospitalController.create);
router.put("/:id", hospitalController.update);
router.delete("/:id", hospitalController.delete);

export default router;
