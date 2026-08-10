import { Request, Response, NextFunction } from "express"
import { clerkClient, getAuth } from '@clerk/express'
import Users from "../models/user.model.js"

export interface AuthRequest extends Request {
    user?: {
        id: string,
        name: string,
        email: string
    }
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const { isAuthenticated, userId } = getAuth(req)
        if (!userId || !isAuthenticated) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            })

        }
        // check if user exists locally in mongodb.
        let localUser = await Users.findById(userId);

        if (!localUser) {
            // Lazy sync: Fetch Data from Clerk API.
            const clerkUser = await clerkClient.users.getUser(userId);
            const email = clerkUser.emailAddresses[0]?.emailAddress;
            const name = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "Anonymous";
            // create fallback handle.
            const handle = clerkUser.username || clerkUser.emailAddresses[0]?.emailAddress.split("@")[0] || userId;
            // Ensure unique handle in DB by appending random suffix if needed.

            let finalHandle = handle.toLowerCase().replace(/[^a-z0-9_]/g, "");
            let handleExists = await Users.findOne({ handle: finalHandle });
            let counter = 1;
            while (handleExists) {
                const testHandle = `${finalHandle}${counter}`
                handleExists = await Users.findOne({ handle: testHandle });
                if (!handleExists) {
                    finalHandle = testHandle;
                    break;
                }
                counter++;
            }
            localUser = await Users.create({
                _id: userId,
                name,
                email: email.toLowerCase(),
                handle: finalHandle,
                avatar: clerkUser.imageUrl || "",
                bio: "Hey there! I am using BuddyChat.",
                isOnline: true,
                lastSeen: new Date(),

            })
        }
        // Attach User to the Request.
        req.user = {
            id: localUser._id,
            name: localUser.name,
            email: localUser.email
        }
        next();
    } catch (error) {
        console.error("Auth Middleware Error:", error);
        res.status(401).json({
            success: false,
            message: "Invalid or Expired Token."
        })
    }
}