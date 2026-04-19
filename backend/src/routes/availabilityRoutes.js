import express from "express";
import availabilityController from "../controllers/doctorAvailabilityController.js";

const router = express.Router();

router.get("/", availabilityController.getAll);
router.get("/doctor/:doctorId", availabilityController.getUpcomingAvailability);
router.post("/", availabilityController.create);
router.put("/:id", availabilityController.update);
router.delete("/:id", availabilityController.delete);

export default router;
