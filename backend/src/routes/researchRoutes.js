import express from "express";
import researchController from "../controllers/researchController.js";

const router = express.Router();

router.get("/", researchController.getAll);
router.get("/:id", researchController.getById);
router.get("/publisher/:userId", researchController.getPapersByPublisher);
router.post("/", researchController.create);
router.put("/:id", researchController.update);
router.delete("/:id", researchController.delete);

export default router;
