import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import cloudinary from "../config/cloudinary.config.js";
import { Readable } from "stream";
import Stories from "../models/story.model.js";

// Create a new story.
export const createStory = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const file = req.file;

    if (!file) {
        return res.status(400).json({
            success: false,
            message: "Media File is Required."
        })
    }

    try {
        const resourceType = file.mimetype.startsWith("image") ? "image" : "video";
        const uploadPromise = new Promise<{ secure_url: string }>((resolve, rejects) => {
            const uploadStream = cloudinary.uploader.upload_stream({
                folder: "BuddyChat_Stories",
                resource_type: resourceType
            }, (error, result) => {
                if (error) {
                    rejects(error)
                } else {
                    resolve(result as any)
                }
            })
            const readableStream = new Readable();
            readableStream.push(file.buffer);
            readableStream.push(null);
            readableStream.pipe(uploadStream);
        })
        const result = await uploadPromise;
        const story = await Stories.create({
            user: userId,
            mediaUrl: result.secure_url,
            mediaType: resourceType
        })

        await story.populate("user", "name avatar handle");
        return res.status(201).json({
            success: true,
            message: "Story Create Successfully.",
            story
        })
    } catch (error) {
        console.log("Cloudinary Upload Error:", error)
        return res.status(401).json({
            success: false,
            message: 'Story Upload Failed.'
        })
    }
}

// Get all recent stories (grouped by user).
export const getStories = async (req: AuthRequest, res: Response) => {
    const stories = await Stories.find().sort({ createdAt: -1 }).populate("user", "name avatar handle");

    // Group stories by user.
    const grouped: any = {};
    stories.forEach((s: any) => {
        const uid = String(s.user._id);
        if(!grouped[uid]){
            grouped[uid] = {
                user: s.user,
                stories: []
            }
        }
        grouped[uid].stories.push(s);
    });

    return res.json({
        success: true,
        stories: Object.values(grouped)
    })
}