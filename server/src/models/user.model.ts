import mongoose, { Model } from "mongoose";

export interface UserInterface {
    _id: string;
    name: string;
    email: string;
    handle: string;
    avatar?: string;
    bio?: string;
    isOnline: boolean;
    lastSeen: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema<UserInterface>({
    _id: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: [true, "All Fields are Required."],
        trim: true
    },
    email: {
        type: String,
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid Email."],
        required: [true, "Email is required."],
        trim: true
    },
    handle: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    avatar: {
        type: String,
        default: ""
    },
    bio: {
        type: String,
        default: ""
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastSeen: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true })

const Users: Model<UserInterface> = mongoose.model("User", userSchema);

export default Users;