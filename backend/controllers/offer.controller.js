import Offer from "../models/offer.model.js";

//  GET ALL OFFERS
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find().populate("productId", "name price");

    res.json({
      success: true,
      count: offers.length,
      data: offers
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

// CREATE
export const createOffer = async (req, res) => {
  try {
    const offer = await Offer.create(req.body);
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET BY PRODUCT
export const getOffersByProduct = async (req, res) => {
  try {
    const offers = await Offer.find({ productId: req.params.productId });
    res.json({ success: true, data: offers });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// UPDATE
export const updateOffer = async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json({ success: true, data: offer });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};

// DELETE
export const deleteOffer = async (req, res) => {
  try {
    await Offer.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
};