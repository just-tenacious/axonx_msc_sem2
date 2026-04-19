import express from "express";
import chatController from "../controllers/chatController.js";

const router = express.Router();

router.get("/stats", chatController.getStats);
router.get("/users", chatController.getUsers);
router.get("/messages/:chatId", chatController.getMessages);
router.post("/find-or-create", chatController.findOrCreate);
router.get("/", chatController.getAll);

export default router;
