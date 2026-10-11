import Wishlist from "../models/Wishlist.js";
import Destination from "../models/Destination.js";
import createNotification from "../utils/createNotification.js";

// Add ya Remove Wishlist

export const toggleWishlist = async (req, res) => {
  try {
    const { userId } = req.body;
    const destinationId = req.params.id;

    // Required values

    if (!userId || !destinationId) {
      return res.status(400).json({
        message: "User ID and destination ID are required",
      });
    }

    // Check existing wishlist

    const existingWishlist = await Wishlist.findOne({
      userId,
      destinationId,
    });

    // Remove from wishlist

    if (existingWishlist) {
      await Wishlist.deleteOne({
        _id: existingWishlist._id,
      });

      const destination = await Destination.findById(destinationId);

      if (destination && destination.wishlistCount > 0) {
        destination.wishlistCount -= 1;

        await destination.save();

        // User Notification

        await createNotification({
          userId,

          title: "Destination Removed from Wishlist",

          message: `${destination.name} has been removed from your wishlist.`,

          type: "wishlist",

          audience: "user",
        });
      }

      return res.status(200).json({
        message: "Removed from wishlist",

        isWishlisted: false,
      });
    }

    // Add to wishlist

    await Wishlist.create({
      userId,
      destinationId,
    });

    const destination = await Destination.findByIdAndUpdate(
      destinationId,
      {
        $inc: {
          wishlistCount: 1,
        },
      },
      {
        new: true,
      },
    );

    // User Notification

    await createNotification({
      userId,

      title: "Destination Added to Wishlist",

      message: `${destination.name} has been added to your wishlist.`,

      type: "wishlist",

      audience: "user",
    });

    return res.status(200).json({
      message: "Added to wishlist",

      isWishlisted: true,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Wishlist action failed",

      error: error.message,
    });
  }
};
// Logged-in user ke saare saved destinations fetch karne ke liye

export const getUserWishlist = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    // User ki wishlist fetch karke destination ki full details lana

    const wishlist = await Wishlist.find({
      userId,
    })
      .populate("destinationId")
      .sort({
        createdAt: -1,
      });

    return res.status(200).json(wishlist);
  } catch (error) {
    return res.status(500).json({
      message: "Failed to fetch wishlist",

      error: error.message,
    });
  }
};

// Check karna ki current destination user ki wishlist me saved hai ya nahi

export const checkWishlistStatus = async (req, res) => {
  try {
    const { destinationId, userId } = req.params;

    if (!destinationId || !userId) {
      return res.status(400).json({
        message: "User ID and destination ID are required",
      });
    }

    // Same user aur destination ka wishlist record search karna

    const wishlist = await Wishlist.findOne({
      userId,
      destinationId,
    });

    return res.status(200).json({
      isWishlisted: Boolean(wishlist),
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to check wishlist status",

      error: error.message,
    });
  }
};