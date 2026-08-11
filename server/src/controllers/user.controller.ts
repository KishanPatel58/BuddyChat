import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware.js';
import Users from '../models/user.model.js';
import cloudinary from '../config/cloudinary.config.js';
import { Readable } from 'stream';
import { broadcaseUserUpdate } from '../socket/socket.manager.js';

// Get All Users.
export const getUsers = async (req: AuthRequest, res: Response) => {
    try {
        const users = await Users.find({
            _id: {
                $ne: req.user!.id
            }
        }).select("name email handle avatar bio isOnline lastSeen");
        return res.status(200).json({
            success: true,
            message: "User Find Successfully.",
            users
        })
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Problem to Get the User."
        })
    }
}

// Search user by 'name', 'email', and 'handle'.
export const searchUsers = async (req: AuthRequest, res: Response) => {
    try {
        const { query } = req.query;
        if (!query || typeof query !== "string") {
            return res.status(401).json({
                success: false,
                users: []
            })
        }
        const regex = new RegExp(query, "i");
        const users = await Users.find({
            _id: {
                $ne: req.user!.id
            },
            $or: [
                { name: regex },
                { email: regex },
                { handle: regex }
            ]
        }).select("name email handle avatar bio isOnline lastSeen").limit(20);
        return res.status(200).json({
            success: true,
            message: "User Fetched Successfully.",
            users
        })
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Problem to Get Users."
        })
    }
}

// Get Current User Profile.
export const getProfile = async (req: AuthRequest, res: Response) => {
    try {
        const user = await Users.findById(req.user!.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not exists.",
                user: []
            })
        }
        return res.status(200).json({
            success: true,
            message: "User Profile Fetched Successfully.",
            user
        })
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "Problem to Get the User Profile."
        })
    }
}

// Update user profile.
export const updateProfile = async (req: AuthRequest, res: Response) => {
    const { name, bio, handle } = req.body;
    const file = req.file;
    if (handle) {
        const handleExists = await Users.findOne({ handle, _id: { $ne: req.user!.id } });
        if (handleExists) {
            return res.status(400).json({
                success: false,
                message: "Handle already in Use."
            })
        }
    }
    let avatarUrl = "";
    if (file) {
        try {
            const uploadPromise = new Promise<{ secure_url: string }>((resolve, rejects) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: "BuddyChat_Avatars"
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
            avatarUrl = result.secure_url;

        } catch (error) {
            console.log("Avatar Upload Error:", error)
            return res.status(401).json({
                success: false,
                message: 'Avatar Upload Failed.'
            })
        }
    }

    const updateData: any = {
        ...(name && { name }),
        ...(bio !== undefined && { bio }),
        ...(handle && { handle: handle.toLowerCase().trim() }),
    }

    if (avatarUrl) {
        updateData.avatar = avatarUrl;
    }

    const updated = await Users.findByIdAndUpdate(req.user!.id, updateData, {returnDocument: "after"});

    if(updated){
        broadcaseUserUpdate(updated)
    }

    return res.status(201).json({
        success: true,
        message: "User Updated Successfully.",
        user: updated
    })
}

