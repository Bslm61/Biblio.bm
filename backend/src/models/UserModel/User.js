import mongoose from "mongoose";
import { type } from "os";

const userSchema = new mongoose.schema(
  {
    clerkId: {
      type: String,
      required: true,
      unique: true,
      // ^-- Clerk generates this ID
      // Links your MongoDB user to Clerk user
    },

    email: {
      type: String,
      required: true,
      unique: true,
      // ^-- Clerk provides this
    },

    username: {
      type: String,
      // ^-- Optional custom username
    },

    profile: {
      bio: String,
      avatar: String,
      // ^-- Your custom profile data
    },

    wallet: {
      balance: {
        type: Number,
        default: 0,
      },
      // ^-- Your custom data (rentals, balance, etc.)
    },

    preferences: {
      theme: String,
      notifications: Boolean,
      // ^-- Custom preferences
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);


const User = mongoose.model('User', userSchema);

export default User;