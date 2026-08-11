import { Router } from 'express';
import { getProfile, getUsers, searchUsers, updateProfile } from '../controllers/user.controller.js';
import upload from '../middlewares/upload.middleware.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const userRouter = Router();
userRouter.use(authMiddleware)
userRouter.get("/", getUsers)
userRouter.get("/search", searchUsers)
userRouter.get("/profile", getProfile)
userRouter.put("/profile", upload.single("avatar"), updateProfile)
export default userRouter;