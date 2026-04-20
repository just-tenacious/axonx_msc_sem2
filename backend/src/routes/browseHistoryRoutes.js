import express from "express";
import browseHistoryController from "../controllers/browseHistoryController.js";

const router = express.Router();

router.post("/", browseHistoryController.logActivity);
router.get("/user/:userId", browseHistoryController.getUserHistory);

export default router;
