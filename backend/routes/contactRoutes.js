const express = require("express");
const router = express.Router();
const Contact = require("../models/Contact");

// @route   POST /api/contact
// @desc    Submit a new contact form message
// @access  Public
router.post("/", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        if (!name || !email || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: "Please fill in all required fields: name, email, subject, message."
            });
        }

        const newContact = await Contact.create({
            name,
            email,
            subject,
            message
        });

        return res.status(201).json({
            success: true,
            message: "Your message has been sent successfully!",
            data: newContact
        });
    } catch (error) {
        console.error("Error creating contact entry:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while saving contact message."
        });
    }
});

// @route   GET /api/contact
// @desc    Retrieve all contact messages
// @access  Public (Will be secured in milestone 4)
router.get("/", async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        return res.status(200).json({
            success: true,
            count: contacts.length,
            data: contacts
        });
    } catch (error) {
        console.error("Error fetching contact messages:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching contact messages."
        });
    }
});

module.exports = router;