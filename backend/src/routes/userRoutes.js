import express from "express";
import userController from "../controllers/userController.js";

const router = express.Router();

router.post("/login", userController.login);
router.post("/register", userController.register);

router.get("/", userController.getAll);
router.get("/hospitals/by-subdept/:subDeptId", userController.getHospitalsBySubDept);
router.get("/:id", userController.getById);
router.get("/:id/profile", userController.getUserWithProfile);
router.post("/", userController.create);
router.put("/:id", userController.update);
router.delete("/:id", userController.delete);

export default router;
