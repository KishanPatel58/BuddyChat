import {Router} from 'express';
import upload from '../middlewares/upload.middleware.js';
import { createStory, getStories } from '../controllers/story.controller.js';
import { authMiddleware } from '../middlewares/auth.middleware.js';
const storyRouter = Router();

storyRouter.use(authMiddleware)
storyRouter.post("/", upload.single("file"), createStory);
storyRouter.get("/", getStories);

export default storyRouter;