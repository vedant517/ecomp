import Order from "../models/Order.js";

// 1. CUSTOMER DASHBOARD STATS
export const getCustomerStats = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Total Unique Customers (Users who have placed orders)
    const totalCustomers = await Order.aggregate([
      { $group: { _id: "$user" } },
      { $count: "total" }
    ]);

    // New Customers in last 7 days
    const newCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: lastWeek } } },
      { $group: { _id: "$user" } },
      { $count: "total" }
    ]);

    // Repeat Customers (more than 1 order)
    const repeatCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 }
        }
      },
      { $match: { orderCount: { $gt: 1 } } },
      { $count: "total" }
    ]);

    res.json({
      success: true,
      data: {
        totalCustomers: totalCustomers[0]?.total || 0,
        newCustomers: newCustomers[0]?.total || 0,
        repeatCustomers: repeatCustomers[0]?.total || 0
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. CUSTOMER TABLE
export const getAllCustomers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const skip = (page - 1) * limit;

    const customers = await Order.aggregate([
      // Group by user first
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpend: { $sum: "$totalPrice" },
          lastOrderDate: { $max: "$createdAt" }
        }
      },
      // Join with Users collection to get the name
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          orderCount: 1,
          totalSpend: 1,
          lastOrderDate: 1
        }
      },
      // search filter on name or email
      {
        $match: search ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } }
          ]
        } : {}
      },
      // Status Logic
      {
        $addFields: {
          status: {
            $cond: [
              { $gte: ["$totalSpend", 500] },
              "VIP",
              {
                $cond: [
                  { $gte: ["$orderCount", 2] },
                  "Active",
                  "Inactive"
                ]
              }
            ]
          }
        }
      },
      { $sort: { totalSpend: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const total = await Order.aggregate([
      { $group: { _id: "$user" } },
      { $count: "total" }
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        total: total[0]?.total || 0,
        page,
        pages: Math.ceil((total[0]?.total || 0) / limit)
      }
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 3. SINGLE CUSTOMER DETAILS
export const getCustomerById = async (req, res) => {
  try {
    const { userId } = req.params;
    const mongoose = (await import('mongoose')).default;

    const customer = await Order.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: "$user",
          orderCount: { $sum: 1 },
          totalSpend: { $sum: "$totalPrice" },
          orders: {
            $push: {
              orderId: "$orderId",
              totalPrice: "$totalPrice",
              status: "$status",
              date: "$createdAt"
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails"
        }
      },
      { $unwind: "$userDetails" },
      {
        $project: {
          _id: 1,
          name: "$userDetails.name",
          email: "$userDetails.email",
          orderCount: 1,
          totalSpend: 1,
          orders: 1
        }
      }
    ]);

    if (!customer.length) {
      return res.status(404).json({ success: false, message: "Customer not found" });
    }

    res.json({
      success: true,
      data: customer[0]
    });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
