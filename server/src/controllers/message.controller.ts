import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.middleware.js";
import Conversations from "../models/conversation.model.js";
import cloudinary from "../config/cloudinary.config.js";
import { Readable } from "stream";
import Messages from "../models/message.model.js";
import { handleConversationEvent } from "../socket/socket.manager.js";

// Find convo. between two users.

async function findConversation(userId: string, otherId: string) {
    return await Conversations.findOne({
        $and: [
            { participants: { $elemMatch: { $eq: userId } } },
            { participants: { $elemMatch: { $eq: otherId } } },
            { $expr: { $eq: [{ $size: "$participants" }, 2] } }
        ]
    } as any)
}

// Start or get a conversation with a user.
export const getOrCreateConversation = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const targetUserId = String(req.params.targetUserId);

    let conversation: any = await findConversation(userId, targetUserId);
    if (conversation) {
        await conversation.populate("participants", "name email handle avatar isOnline lastSeen");
        await conversation.populate("lastMessage");
    } else {
        conversation = await Conversations.create({
            participants: [userId, String(targetUserId)]
        });
        await conversation.populate("participants", "name email handle avatar isOnline lastSeen");
    }
    const other = (conversation.participants as any[]).find((p: any) => String(p._id !== userId));

    return res.json({
        success: true,
        conversation: {
            _id: conversation._id,
            participant: other,
            lastMessage: conversation.lastMessage
        }
    })
}

// Get all conversations for the current user.
export const getConversations = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const conversations = await Conversations.find({ participants: { $in: [userId] } }).populate("participants", "name email handle avatar isOnline lastSeen").populate("lastMessage").sort({ updatedAt: -1 });
    const shaped = conversations.map((c) => {
        const other = (c.participants as any[]).find((p: any) => String(p._id) !== userId);
        return { _id: c.id, isGroup: false, participant: other, lastMessage: c.lastMessage, updatedAt: c.updatedAt }
    })

    return res.json({
        success: true,
        conversations: shaped
    })
}

// Send Message.
export const sendMessage = async (req: AuthRequest, res: Response) => {
    const senderId = req.user!.id;
    const { receiverId, conversationId, text } = req.body;
    const file = req.file;
    if ((!receiverId && !conversationId) || (!text.trim() && !file)) {
        return res.status(400).json({
            success: false,
            message: "(receiverid, conversationid) and (text or file) are required."
        })
    }
    let mediaUrl = "";
    let mediaType: "image" | "video" | undefined;
    if (file) {
        try {
            const resourceType = file.mimetype.startsWith("video") ? "video" : "image";
            mediaType = resourceType;
            const uploadPromise = new Promise<{ secure_url: string }>((resolve, rejects) => {
                const uploadStream = cloudinary.uploader.upload_stream({
                    folder: "BuddyChat_Messages",
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
            mediaUrl = result.secure_url;

        } catch (error) {
            console.log("Cloudinary Upload Error:", error)
            return res.status(401).json({
                success: false,
                message: 'Media Upload Failed.'
            })
        }
    }

    let conversation;
    if (conversationId) {
        conversation = await Conversations.findOne({ _id: conversationId, participants: { $in: [senderId] } });
    } else {
        conversation = await findConversation(senderId, receiverId);
        if(!conversation){
            conversation = await Conversations.create({
                participants: [senderId, receiverId]
            })
        }
    }
    if(!conversation){
        return res.status(404).json({
            success: false,
            message: "Can't find Conversation"
        })
    }
    const message = await Messages.create({
        sender: senderId,
        receiver: receiverId || conversation.participants.find((p)=> String(p)!==senderId),
        conversationId: conversation._id,
        text: text?.trim(),
        mediaUrl: mediaUrl || undefined,
        mediaType
    })
    conversation.lastMessage = message._id as any;
    conversation.updatedAt = new Date();
    await conversation.save();
    return res.status(201).json({
        success: true,
        message
    })
}

// Get all messages in a conversation.
export const getMessages = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const conversation = await Conversations.findOne({_id: conversationId, participants: {$in: [userId]}});
    if(!conversation){
        return res.status(404).json({
            success: false,
            message: "Can't find Conversation."
        })
    }
    const messages = await Messages.find({conversationId}).sort({createdAt: 1});
    await Messages.updateMany({conversationId, receiver: userId, read: false}, {read: true});

    return res.json({
        success: true,
        messages
    })
}

// Delete a conversation.
export const deleteConversation = async (req: AuthRequest, res: Response) => {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    try {
        const conversation = await Conversations.findById(conversationId);
        if(!conversation){
            return res.status(404).json({
                success: false,
                message: "Conversation not found."
            })
        }
        // Check if user is part of the conversation.
        const isParticipant = conversation.participants.some((p)=> String(p)===userId);
        if(!isParticipant){
            return res.status(403).json({
                success: false,
                message: "Not authorized to delete this conversation."
            })
        }
        // Notify other participants before deleting.
        await handleConversationEvent(userId, String(conversationId), {
            type: "chat_deleted",
            conversationId
        })

        // Delete all the messages in the conversation.
        await Messages.deleteMany({conversationId})

        // Delete the conversation itself.
        await Conversations.findByIdAndDelete(conversationId);

        return res.status(201).json({
            success: true,
            message: "Chat Deleted Successfully."
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server Error."
        })
    }
}