import { Request, Response, NextFunction } from "express";
import { clerkClient, getAuth } from "@clerk/express";
import Users from "../models/user.model.js";

export interface AuthRequest extends Request {
    user?: {
        id: string;
        name: string;
        email: string;
    };
}

export const authMiddleware = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {

        const { isAuthenticated, userId } = getAuth(req);

        // -----------------------------
        // Check Clerk authentication
        // -----------------------------

        if (!userId || !isAuthenticated) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated",
            });
        }

        // -----------------------------
        // Fetch local MongoDB user
        // -----------------------------

        let localUser = await Users.findById(userId);

        // -----------------------------
        // Create local user if missing
        // -----------------------------

        if (!localUser) {

            const clerkUser =
                await clerkClient.users.getUser(userId);

            const email =
                clerkUser.emailAddresses[0]?.emailAddress || "";

            const name =
                [
                    clerkUser.firstName,
                    clerkUser.lastName,
                ]
                    .filter(Boolean)
                    .join(" ")
                ||
                clerkUser.username
                ||
                "Anonymous";

            // -----------------------------
            // Generate handle
            // -----------------------------

            const originalHandle =
                clerkUser.username ||
                clerkUser.emailAddresses[0]
                    ?.emailAddress
                    ?.split("@")[0] ||
                userId;

            let finalHandle =
                originalHandle
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, "");

            if (!finalHandle) {
                finalHandle = `user_${userId
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .slice(-8)}`;
            }

            // Check handle
            let handleExists =
                await Users.findOne({
                    handle: finalHandle,
                });

            let counter = 1;

            while (
                handleExists &&
                handleExists._id !== userId
            ) {
                const testHandle =
                    `${finalHandle}${counter}`;

                handleExists =
                    await Users.findOne({
                        handle: testHandle,
                    });

                if (!handleExists) {
                    finalHandle = testHandle;
                    break;
                }

                counter++;
            }

            // -----------------------------
            // ATOMIC CREATE / FIND
            // -----------------------------

            localUser =
                await Users.findOneAndUpdate(
                    {
                        _id: userId,
                    },
                    {
                        $setOnInsert: {
                            _id: userId,
                            name,
                            email:
                                email.toLowerCase(),
                            handle: finalHandle,
                            avatar:
                                clerkUser.imageUrl || "",
                            bio:
                                "Hey there! I am using BuddyChat.",
                            isOnline: true,
                            lastSeen: new Date(),
                        },
                    },
                    {
                        upsert: true,
                        returnDocument: "after",
                    }
                );
        }

        // -----------------------------
        // Attach user to request
        // -----------------------------

        req.user = {
            id: localUser!._id,
            name: localUser!.name,
            email: localUser!.email,
        };

        next();

    } catch (error: any) {

        console.error(
            "Auth Middleware Error:",
            error
        );

        return res.status(401).json({
            success: false,
            message: "Invalid or Expired Token.",
        });
    }
};