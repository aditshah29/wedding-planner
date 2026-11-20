const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Name is required"],
            trim: true
        },
        email: {
            type: String,
            required: [true, "Email is required"],
            trim: true,
            lowercase: true
        },
        phone: {
            type: String,
            required: [true, "Phone number is required"],
            trim: true
        },
        eventDate: {
            type: Date,
            required: [true, "Event date is required"]
        },
        guestCount: {
            type: Number,
            default: 0
        },
        notes: {
            type: String,
            trim: true,
            default: ""
        },
        status: {
            type: String,
            enum: ["pending", "confirmed", "cancelled"],
            default: "pending"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Appointment", appointmentSchema);