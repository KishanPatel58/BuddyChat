import mongoose, {Schema, Model, Document} from "mongoose";

export interface InterfaceStory extends Document{
    user: string;
    mediaUrl: string;
    mediaType: "image" | "video";
    createdAt: Date;
}

const storySchema = new Schema<InterfaceStory>({
    user: {
        type: String,
        ref: "User",
        required: true
    },
    mediaUrl: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ["image","video"],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400
    }
})

const Stories: Model<InterfaceStory> = mongoose.model("Story", storySchema);

export default Stories;