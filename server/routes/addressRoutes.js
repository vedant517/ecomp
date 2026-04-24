const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const Address = require("../models/Address");

// @route   POST /api/addresses
// @desc    Add a new address
// @access  Private
router.post("/", protect, async (req, res) => {
  try {
    const addressCount = await Address.countDocuments({ user: req.user.id });
    if (addressCount >= 2) {
      return res.status(400).json({ message: "You can only store up to 2 addresses. Please delete one to add a new one." });
    }

    const { contact, shippingAddress } = req.body;
    
    const address = new Address({
      user: req.user.id,
      contact,
      shippingAddress,
    });

    const savedAddress = await address.save();
    res.status(201).json(savedAddress);
  } catch (error) {
    console.error("Save address error:", error);
    res.status(500).json({ message: "Server error saving address" });
  }
});

// @route   GET /api/addresses
// @desc    Get user's addresses
// @access  Private
router.get("/", protect, async (req, res) => {
  try {
    // Some clients send order info in GET body for checkout context
    if (req.body && Object.keys(req.body).length > 0) {
      console.log(`[ADDRESS-CONTEXT] Fetching addresses for order:`, req.body);
    }
    const addresses = await Address.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(addresses);
  } catch (error) {
    console.error("Fetch addresses error:", error);
    res.status(500).json({ message: "Server error fetching addresses" });
  }
});

// @route   DELETE /api/addresses/:id
// @desc    Delete an address
// @access  Private
router.delete("/:id", protect, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);

    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    if (address.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "Not authorized" });
    }

    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address removed", success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error deleting address" });
  }
});

// @route   DELETE /api/addresses/:userId/:id
// @desc    Delete an address (specifically for a user)
// @access  Private
router.delete("/:userId/:id", protect, async (req, res) => {
  try {
    // If not admin, the userId must match the authenticated user
    if (req.user.role !== 'admin' && req.params.userId !== req.user.id) {
      return res.status(401).json({ message: "Not authorized to delete another user's address" });
    }

    const address = await Address.findOne({ _id: req.params.id, user: req.params.userId });

    if (!address) {
      return res.status(404).json({ message: "Address not found for this user" });
    }

    await Address.findByIdAndDelete(req.params.id);
    res.json({ message: "Address removed", success: true });
  } catch (error) {
    console.error("Delete address error:", error);
    res.status(500).json({ message: "Server error deleting address" });
  }
});

module.exports = router;
