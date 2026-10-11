import RecentlyViewed from "../models/RecentlyViewed.js";

// Destination ko recently viewed me add/update karna
export const addRecentlyViewed = async (req, res) => {
  try {
    const { userId } = req.body;
    const destinationId = req.params.destinationId;

    // Check: record pehle se exist karta hai ya nahi
    const existingRecord = await RecentlyViewed.findOne({
      userId,
      destinationId,
    });

    // Agar already exist karta hai to sirf viewedAt update karo
    if (existingRecord) {
      existingRecord.viewedAt = Date.now();
      await existingRecord.save();
    } else {
      // Naya record create karo
      await RecentlyViewed.create({
        userId,
        destinationId,
      });
    }

    // User ke total recent destinations count karo
    const count = await RecentlyViewed.countDocuments({
      userId,
    });

    // Sirf last 6 destinations rakhne hain
    if (count > 6) {
      const oldestRecord = await RecentlyViewed.findOne({
        userId,
      }).sort({
        viewedAt: 1,
      });

      if (oldestRecord) {
        await oldestRecord.deleteOne();
      }
    }

    res.status(200).json({
      message: "Recently viewed updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update recently viewed",
      error: error.message,
    });
  }
};

// Logged-in user ki recently viewed destinations fetch karna
export const getRecentlyViewed = async (req, res) => {
  try {
    const recentDestinations = await RecentlyViewed.find({
      userId: req.params.userId,
    })
      .populate("destinationId")
      .sort({
        viewedAt: -1,
      });

    res.status(200).json(recentDestinations);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch recently viewed destinations",
      error: error.message,
    });
  }
};
