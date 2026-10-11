import User from "../models/User.js";
import Trip from "../models/Trip.js";
import Wishlist from "../models/Wishlist.js";
import Destination from "../models/Destination.js";
import Attraction from "../models/Attraction.js";
import State from "../models/State.js";
import MissingDestination from "../models/MissingDestination.js";
import SearchHistory from "../models/SearchHistory.js";

// Dashboard Analytics
export const getAnalytics = async (req, res) => {
  try {
    // Current date
    const now = new Date();

    // Start of current month
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Get last 7 months
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);

    // Get monthly growth for any model
    const getMonthlyGrowth = async (Model) => {
      // Count records created before the 7 month period
      const previousTotal = await Model.countDocuments({
        createdAt: {
          $lt: startDate,
        },
      });

      // Get monthly records
      const monthlyData = await Model.aggregate([
        {
          $match: {
            createdAt: {
              $gte: startDate,
            },
          },
        },

        {
          $group: {
            _id: {
              year: {
                $year: "$createdAt",
              },

              month: {
                $month: "$createdAt",
              },
            },

            count: {
              $sum: 1,
            },
          },
        },

        {
          $sort: {
            "_id.year": 1,
            "_id.month": 1,
          },
        },
      ]);

      // Store monthly data
      const monthlyMap = {};

      monthlyData.forEach((item) => {
        const key = `${item._id.year}-${item._id.month}`;

        monthlyMap[key] = item.count;
      });

      // Create 7 month result
      const result = [];

      // Running total
      let runningTotal = previousTotal;

      for (let i = 0; i < 7; i++) {
        const monthDate = new Date(
          now.getFullYear(),
          now.getMonth() - 6 + i,
          1,
        );

        const year = monthDate.getFullYear();

        const month = monthDate.getMonth() + 1;

        const key = `${year}-${month}`;

        // Records created in this month
        const newRecords = monthlyMap[key] || 0;

        // Add new records to total
        runningTotal += newRecords;

        // Add month data
        result.push({
          year,
          month,

          label: monthDate.toLocaleDateString("en-US", {
            month: "short",
          }),

          count: runningTotal,

          // New records created in this month
          newRecords,
        });
      }

      return result;
    };

    // Get real growth data
    const [
      userGrowth,
      tripGrowth,
      destinationGrowth,
      attractionGrowth,
      wishlistGrowth,
    ] = await Promise.all([
      getMonthlyGrowth(User),
      getMonthlyGrowth(Trip),
      getMonthlyGrowth(Destination),
      getMonthlyGrowth(Attraction),
      getMonthlyGrowth(Wishlist),
    ]);

    // Get current totals
    const totalUsers = await User.countDocuments();

    const totalTrips = await Trip.countDocuments();

    const totalWishlists = await Wishlist.countDocuments();

    const totalDestinations = await Destination.countDocuments();

    // Trips per month
    const tripsPerMonth = await Trip.aggregate([
      {
        $group: {
          _id: {
            year: {
              $year: "$createdAt",
            },

            month: {
              $month: "$createdAt",
            },
          },

          trips: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Most planned destinations
    const mostPlannedDestinations = await Trip.aggregate([
      {
        $group: {
          _id: "$destination",

          trips: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          trips: -1,
        },
      },

      {
        $limit: 5,
      },
    ]);

    // Most saved destinations
    const mostSavedDestinations = await Wishlist.aggregate([
      {
        $group: {
          _id: "$destinationId",

          saves: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          saves: -1,
        },
      },

      {
        $limit: 5,
      },

      {
        $lookup: {
          from: "destinations",

          localField: "_id",

          foreignField: "_id",

          as: "destination",
        },
      },

      {
        $unwind: "$destination",
      },

      {
        $project: {
          _id: 0,

          destination: "$destination.name",

          saves: 1,
        },
      },
    ]);

    // Budget distribution
    const budgetDistribution = await Trip.aggregate([
      {
        $bucket: {
          groupBy: "$budget",

          boundaries: [0, 5000, 10000, 20000, 50000, 1000000],

          default: "Others",

          output: {
            trips: {
              $sum: 1,
            },
          },
        },
      },
    ]);

    // Top travelers
    const topTravelers = await Trip.aggregate([
      {
        $group: {
          _id: "$userId",

          trips: {
            $sum: 1,
          },
        },
      },

      {
        $sort: {
          trips: -1,
        },
      },

      {
        $limit: 5,
      },

      {
        $lookup: {
          from: "users",

          localField: "_id",

          foreignField: "_id",

          as: "user",
        },
      },

      {
        $unwind: "$user",
      },

      {
        $project: {
          _id: 0,

          name: "$user.name",

          email: "$user.email",

          trips: 1,
        },
      },
    ]);

    // Get trending searches
    const rawTrending = await SearchHistory.find()
      .sort({
        count: -1,
        lastSearched: -1,
      })
      .limit(30)
      .select("name type count")
      .lean();

    // Escape regex characters
    const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const seen = new Set();

    const trendingSearches = [];

    // Check every search
    for (const entry of rawTrending) {
      if (trendingSearches.length >= 6) {
        break;
      }

      const dedupeKey = `${entry.type}:${entry.name}`;

      // Skip duplicate
      if (seen.has(dedupeKey)) {
        continue;
      }

      let match = null;

      // Search state
      if (entry.type === "state") {
        match = await State.findOne({
          name: {
            $regex: `^${escapeRegex(entry.name)}$`,
            $options: "i",
          },
        }).select("name");
      }

      // Search destination
      else if (entry.type === "destination") {
        match = await Destination.findOne({
          name: {
            $regex: `^${escapeRegex(entry.name)}$`,
            $options: "i",
          },
        }).select("name");
      }

      // Add valid search
      if (match) {
        seen.add(dedupeKey);

        trendingSearches.push({
          name: match.name,

          type: entry.type,

          count: entry.count,
        });
      }
    }

    // Missing destinations
    const missingDestinations = await MissingDestination.find()
      .sort({
        count: -1,
        lastSearched: -1,
      })
      .limit(10)
      .select("name count");

    // Send analytics response
    res.status(200).json({
      success: true,

      // Dashboard overview
      overview: {
        totalUsers,
        totalTrips,
        totalWishlists,
        totalDestinations,
      },

      // Real growth data
      userGrowth,

      tripGrowth,

      destinationGrowth,

      attractionGrowth,

      wishlistGrowth,

      // Existing analytics
      tripsPerMonth,

      mostPlannedDestinations,

      mostSavedDestinations,

      budgetDistribution,

      topTravelers,

      missingDestinations,

      trendingSearches,
    });
  } catch (error) {
    // Log error
    console.error("Analytics Error:", error);

    // Send error response
    res.status(500).json({
      success: false,

      message: "Failed to load analytics",
    });
  }
};
