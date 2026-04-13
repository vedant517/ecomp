import Order from "../models/Order.js";

// 1. CUSTOMER DASHBOARD STATS
export const getCustomerStats = async (req, res) => {
  try {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    // Total Customers
    const totalCustomers = await Order.aggregate([
      { $group: { _id: "$userId" } },
      { $count: "total" }
    ]);

    // New Customers
    const newCustomers = await Order.aggregate([
      { $match: { createdAt: { $gte: lastWeek } } },
      { $group: { _id: "$userId" } },
      { $count: "total" }
    ]);

    // Repeat Customers
    const repeatCustomers = await Order.aggregate([
      {
        $group: {
          _id: "$userId",
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
    res.status(500).json({ error: error.message });
  }
};



// 2. CUSTOMER TABLE (with pagination + search)
export const getAllCustomers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // Search filter
    const matchStage = search
      ? {
          customerName: { $regex: search, $options: "i" }
        }
      : {};

    const customers = await Order.aggregate([
      { $match: matchStage },

      {
        $group: {
          _id: "$userId",
          name: { $first: "$customerName" },
          orderCount: { $sum: 1 },
          totalSpend: { $sum: "$price" },
          lastOrderDate: { $max: "$createdAt" }
        }
      },

      // Status Logic
      {
        $addFields: {
          status: {
            $cond: [
              { $gte: ["$totalSpend", 4000] },
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

    // Total count for pagination
    const total = await Order.aggregate([
      { $group: { _id: "$userId" } },
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
    res.status(500).json({ error: error.message });
  }
};



// 3. SINGLE CUSTOMER DETAILS
export const getCustomerById = async (req, res) => {
  try {
    const { userId } = req.params;

    const customer = await Order.aggregate([
      { $match: { userId } },

      {
        $group: {
          _id: "$userId",
          name: { $first: "$customerName" },
          orderCount: { $sum: 1 },
          totalSpend: { $sum: "$price" },
          orders: {
            $push: {
              orderId: "$orderId",
              price: "$price",
              status: "$status",
              date: "$createdAt"
            }
          }
        }
      }
    ]);

    if (!customer.length) {
      return res.status(404).json({ message: "Customer not found" });
    }

    res.json({
      success: true,
      data: customer[0]
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
