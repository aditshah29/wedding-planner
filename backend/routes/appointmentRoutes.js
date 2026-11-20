const express = require("express");
const router = express.Router();
const Appointment = require("../models/Appointment");

// POST /api/appointments - Create new appointment
router.post("/", async (req, res) => {
    try {
        const { name, email, phone, eventDate, guestCount, notes } = req.body;

        if (!name || !email || !phone || !eventDate) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields: name, email, phone, eventDate."
            });
        }

        const newAppointment = await Appointment.create({
            name,
            email,
            phone,
            eventDate,
            guestCount,
            notes
        });

        return res.status(201).json({
            success: true,
            message: "Appointment booked successfully!",
            data: newAppointment
        });
    } catch (error) {
        console.error("Error creating appointment:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while booking appointment."
        });
    }
});

// GET /api/appointments - Retrieve all appointments
router.get("/", async (req, res) => {
    try {
        const appointments = await Appointment.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: appointments.length,
            data: appointments
        });
    } catch (error) {
        console.error("Error fetching appointments:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching appointments."
        });
    }
});

module.exports = router;