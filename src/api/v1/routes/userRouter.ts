import express from "express";
import authMiddleware from "../../../middleware/authMiddleware";
import userController from "../controllers/userController";
import adminMiddleware from "../../../middleware/adminMiddleware";
const router = express.Router();

router.get("/", adminMiddleware, userController.getAll);
router.get("/query/:id", userController.getByUserId);
router.post("/me", authMiddleware, userController.getMe);
router.patch("/me/updateProfile", authMiddleware, userController.updateProfile);
router.patch("/me/updateClient", authMiddleware, userController.updateClient);
router.patch("/me/uploadImages", authMiddleware, userController.updateClient);

export default router;
