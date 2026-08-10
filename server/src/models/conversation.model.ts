import mongoose, {Schema, Document, Model} from "mongoose";

export interface InterfaceConversation extends Document {
    participants: string[];
    lastMessage?: mongoose.Types.ObjectId;
    updatedAt: Date;
}

const conversationSchema = new Schema<InterfaceConversation>({
    participants: [{
        type: String,
        ref: "User",
        required: true
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: "Message"
    }
}, {timestamps: true})

conversationSchema.index({
    participants: 1
})

const Conversations: Model<InterfaceConversation> = mongoose.model("Conversation", conversationSchema);

export default Conversations;