import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
  {
    clerkId: {
      type: String,
      required: [true, "Clerk ID is required"],
      unique: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
    },

    username: {
      type: String,
      minlength: [3, "Username must be at least 3 characters"],
      maxlength: [30, "Username cannot exceed 30 characters"],
      sparse: true,
    },

    profile: {
      bio: {
        type: String,
        maxlength: [500, "Bio cannot exceed 500 characters"],
        default: "",
      },
      avatar: {
        type: String,
        default: null,
      },
    },

    wallet: {
      balance: {
        type: Number,
        default: 0,
        min: [0, "Balance cannot be negative"],
      },
      totalSpent: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark"],
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    isAdmin: {
  type: Boolean,
  default: false 
}
  },
  { timestamps: true }
);

// Indexes
userSchema.index({ clerkId: 1 });
userSchema.index({ email: 1 });

const User = mongoose.model("User", userSchema);

export default User;
