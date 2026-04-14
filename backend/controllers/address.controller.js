import Address from "../models/Address.js";

// CREATE ADDRESS
export const createAddress = async (req, res) => {
    try {
        const address = await Address.create(req.body);
        res.status(201).json({ success: true, data: address });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// GET ALL ADDRESSES
export const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find();
        res.json({ success: true, data: addresses });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};