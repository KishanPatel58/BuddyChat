import mongoose, { Document, Model } from "mongoose";

export interface InterfaceMessage extends Document {
    sender: string;
    receiver?: string;
    conversationId: mongoose.Types.ObjectId;
    text?: string;
    mediaUrl?: string;
    mediaType?: "image" | "video";
    read: boolean;
    createdAt: Date;
}

const messageSchema = new mongoose.Schema<InterfaceMessage>({
    sender: {
        type: String,
        ref: "User",
        required: true
    },
    receiver: {
        type: String,
        ref: "User",
        required: true
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Conversation",
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    mediaUrl: {
        type: String
    },
    mediaType: {
        type: String,
        enum: ["image", "video"]
    },
    read: {
        type: Boolean,
        default: false
    }
}, {timestamps: true})

const Messages: Model<InterfaceMessage> = mongoose.model("Message", messageSchema);

export default Messages;