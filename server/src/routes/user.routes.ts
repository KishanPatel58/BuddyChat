import { Router } from 'express';
import { getProfile, getUsers, searchUsers, updateProfile } from '../controllers/user.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const userRouter = Router();

userRouter.get("/", getUsers)
userRouter.get("/search", searchUsers)
userRouter.get("/profile", authMiddleware, getProfile)

userRouter.put("/profile", upload.single("avatar"), authMiddleware, updateProfile)

export default userRouter;