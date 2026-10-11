import Destination from "../models/Destination.js";
import Attraction from "../models/Attraction.js";
import MissingDestination from "../models/MissingDestination.js";
import SearchHistory from "../models/SearchHistory.js";
import cloudinary from "../config/cloudinary.js";

import createNotification from "../utils/createNotification.js";
import normalizeSearchName from "../utils/normalizeSearchName.js";

// Get Cloudinary public ID
const getPublicIdFromCloudinaryUrl = (url) => {
  if (!url || typeof url !== "string") {
    return "";
  }

  try {
    if (!url.includes("res.cloudinary.com")) {
      return "";
    }

    const uploadIndex = url.indexOf("/upload/");

    if (uploadIndex === -1) {
      return "";
    }

    let publicId = url.substring(uploadIndex + "/upload/".length);

    // Remove version
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch (error) {
    console.error("Failed to get Cloudinary public ID:", error);

    return "";
  }
};

// Delete image from Cloudinary
const deleteCloudinaryImage = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    console.log("Cloudinary image delete:", result);

    return result;
  } catch (error) {
    console.error("Cloudinary image deletion failed:", error);
  }
};

// Delete video from Cloudinary
const deleteCloudinaryVideo = async (publicId) => {
  if (!publicId) {
    return;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });

    console.log("Cloudinary video delete:", result);

    return result;
  } catch (error) {
    console.error("Cloudinary video deletion failed:", error);
  }
};

// Parse JSON safely
const parseJSON = (value, fallback = []) => {
  if (value === undefined || value === null || value === "") {
    return fallback;
  }

  if (Array.isArray(value) || typeof value === "object") {
    return value;
  }

  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch (error) {
      console.error("JSON parsing failed:", error);

      return fallback;
    }
  }

  return fallback;
};

// Format gallery images
const normalizeGalleryImages = (galleryImages) => {
  galleryImages = parseJSON(galleryImages, []);

  if (!Array.isArray(galleryImages)) {
    return [];
  }

  return galleryImages
    .map((item) => {
      // New format
      if (item && typeof item === "object") {
        const url = typeof item.url === "string" ? item.url.trim() : "";

        if (!url) {
          return null;
        }

        return {
          url,

          publicId:
            typeof item.publicId === "string" && item.publicId.trim()
              ? item.publicId.trim()
              : getPublicIdFromCloudinaryUrl(url),
        };
      }

      // Old format
      if (typeof item === "string") {
        const url = item.trim();

        if (!url) {
          return null;
        }

        return {
          url,

          publicId: getPublicIdFromCloudinaryUrl(url),
        };
      }

      return null;
    })
    .filter(Boolean);
};

// Get gallery public IDs
const getGalleryPublicIds = (galleryImages) => {
  galleryImages = parseJSON(galleryImages, []);

  if (!Array.isArray(galleryImages)) {
    return [];
  }

  return galleryImages
    .map((item) => {
      if (typeof item === "string") {
        return getPublicIdFromCloudinaryUrl(item);
      }

      if (item && typeof item === "object") {
        return item.publicId || getPublicIdFromCloudinaryUrl(item.url);
      }

      return "";
    })
    .filter(Boolean);
};

// Format videos
const normalizeShortVideos = (shortVideos) => {
  shortVideos = parseJSON(shortVideos, []);

  if (!Array.isArray(shortVideos)) {
    return [];
  }

  return shortVideos
    .map((video) => {
      // New video format
      if (video && typeof video === "object") {
        const url = typeof video.url === "string" ? video.url.trim() : "";

        if (!url) {
          return null;
        }

        let type =
          typeof video.type === "string" ? video.type.trim().toLowerCase() : "";

        // Detect Cloudinary video
        if (url.includes("res.cloudinary.com")) {
          type = "cloudinary";
        }

        if (!type) {
          type = "url";
        }

        if (!["url", "cloudinary"].includes(type)) {
          type = "url";
        }

        return {
          type,

          url,

          publicId:
            typeof video.publicId === "string" && video.publicId.trim()
              ? video.publicId.trim()
              : type === "cloudinary"
                ? getPublicIdFromCloudinaryUrl(url)
                : "",
        };
      }

      // Old string format
      if (typeof video === "string") {
        const url = video.trim();

        if (!url) {
          return null;
        }

        const isCloudinaryVideo = url.includes("res.cloudinary.com");

        return {
          type: isCloudinaryVideo ? "cloudinary" : "url",

          url,

          publicId: isCloudinaryVideo ? getPublicIdFromCloudinaryUrl(url) : "",
        };
      }

      return null;
    })
    .filter(Boolean);
};

// Get Cloudinary video IDs
const getVideoPublicIds = (shortVideos) => {
  const videos = normalizeShortVideos(shortVideos);

  return videos
    .filter((video) => video.type === "cloudinary")
    .map((video) => video.publicId || getPublicIdFromCloudinaryUrl(video.url))
    .filter(Boolean);
};

// Normalize Things To Do
const normalizeThingsToDo = (thingsToDo) => {
  const activities = parseJSON(thingsToDo, []);

  if (!Array.isArray(activities)) {
    return [];
  }

  return activities.map((item) => {
    return {
      name: item?.name || "",

      description: item?.description || "",

      image: item?.image || "",

      imagePublicId: item?.imagePublicId || "",

      galleryImages: Array.isArray(item?.galleryImages)
        ? item.galleryImages
            .map((image) => {
              if (typeof image === "string") {
                return {
                  url: image,
                  publicId: getPublicIdFromCloudinaryUrl(image),
                };
              }

              return {
                url: image?.url || "",
                publicId:
                  image?.publicId || getPublicIdFromCloudinaryUrl(image?.url),
              };
            })
            .filter((image) => image.url)
        : [],

      shortVideos: Array.isArray(item?.shortVideos)
        ? normalizeShortVideos(item.shortVideos)
        : [],

      price: item?.price || "",

      duration: item?.duration || "",

      bestTime: item?.bestTime || "",

      safetyTips: item?.safetyTips || "",

      rating: Number(item?.rating) || 0,
    };
  });
};

// Normalize Nearby Places
const normalizeNearbyPlaces = (nearbyPlaces) => {
  const places = parseJSON(nearbyPlaces, []);

  if (!Array.isArray(places)) {
    return [];
  }

  return places
    .map((place) => {
      if (!place || typeof place !== "object") {
        return null;
      }

      // Main image
      let image = "";

      if (typeof place.image === "string") {
        image = place.image.trim();
      } else if (place.image && typeof place.image === "object") {
        image = place.image.url || "";
      }

      // Gallery images
      const galleryImages = Array.isArray(place.galleryImages)
        ? place.galleryImages
            .map((image) => {
              if (typeof image === "string") {
                return image.trim();
              }

              if (image && typeof image === "object") {
                return image.url || "";
              }

              return "";
            })
            .filter(Boolean)
        : [];

      return {
        name: typeof place.name === "string" ? place.name.trim() : "",

        description:
          typeof place.description === "string" ? place.description.trim() : "",

        distance:
          typeof place.distance === "string" ? place.distance.trim() : "",

        location:
          typeof place.location === "string" ? place.location.trim() : "",

        famousFor:
          typeof place.famousFor === "string" ? place.famousFor.trim() : "",

        image,

        galleryImages,

        bestTime:
          typeof place.bestTime === "string" ? place.bestTime.trim() : "",

        rating: Number(place.rating) || 0,
      };
    })
    .filter((place) => place);
};

// Create Destination
export const createDestination = async (req, res) => {
  try {
    const {
      stateId,
      name,
      description,
      location,
      category,
      famousFor,
      image,
      imagePublicId,
      galleryImages,
      shortVideos,
      thingsToDo,
      nearbyPlaces,
      bestTime,
      travelTips,
      rating,
    } = req.body;

    // Check required fields
    if (
      !stateId ||
      !name ||
      !description ||
      !category ||
      !famousFor ||
      !image ||
      !bestTime
    ) {
      return res.status(400).json({
        message: "Please provide all required fields",
      });
    }

    // Check duplicate
    const existingDestination = await Destination.findOne({
      stateId,

      name: {
        $regex: `^${name.trim()}$`,
        $options: "i",
      },
    });

    if (existingDestination) {
      return res.status(400).json({
        message: "Destination already exists for this state",
      });
    }

    // Main image
    const finalImage = image.trim();

    const finalImagePublicId =
      imagePublicId?.trim() || getPublicIdFromCloudinaryUrl(finalImage);

    // Destination gallery
    const finalGalleryImages = normalizeGalleryImages(galleryImages);

    // Destination videos
    const finalShortVideos = normalizeShortVideos(shortVideos);

    // Things To Do
    const finalThingsToDo = normalizeThingsToDo(thingsToDo);

    // Nearby Places
    const finalNearbyPlaces = normalizeNearbyPlaces(nearbyPlaces);

    // Create destination
    const destination = await Destination.create({
      stateId,

      name: name.trim(),

      description: description.trim(),

      location: location?.trim() || "",

      category: category.trim(),

      famousFor: famousFor.trim(),

      image: finalImage,

      imagePublicId: finalImagePublicId,

      galleryImages: finalGalleryImages,

      shortVideos: finalShortVideos,

      thingsToDo: finalThingsToDo,

      nearbyPlaces: finalNearbyPlaces,

      bestTime: bestTime.trim(),

      travelTips: travelTips?.trim() || "",

      rating: Number(rating) || 0,
    });

    // Remove from missing destinations
    const normalizedDestination = normalizeSearchName(name);

    const missingDestinations = await MissingDestination.find();

    for (const item of missingDestinations) {
      if (normalizeSearchName(item.name) === normalizedDestination) {
        await item.deleteOne();
      }
    }

    // Notification
    await createNotification({
      title: "New Destination Added",

      message: `${destination.name} has been added successfully.`,

      type: "destination",

      audience: "admin",
    });

    return res.status(201).json({
      message: "Destination created successfully",

      destination,
    });
  } catch (error) {
    console.error("Create destination error:", error);

    return res.status(500).json({
      message: "Failed to create destination",

      error: error.message,

      details: error.errors || null,
    });
  }
};

// Get all destinations
export const getDestinations = async (req, res) => {
  try {
    const destinations = await Destination.find()
      .populate("stateId", "name")
      .sort({
        rating: -1,
        wishlistCount: -1,
        createdAt: -1,
      });

    return res.status(200).json(destinations);
  } catch (error) {
    console.error("Get destinations error:", error);

    return res.status(500).json({
      message: "Failed to fetch destinations",

      error: error.message,
    });
  }
};

// Get destinations by state
export const getDestinationsByState = async (req, res) => {
  try {
    const destinations = await Destination.find({
      stateId: req.params.stateId,
    })
      .populate("stateId", "name")
      .sort({
        rating: -1,
        wishlistCount: -1,
        createdAt: -1,
      });

    return res.status(200).json(destinations);
  } catch (error) {
    console.error("Get state destinations error:", error);

    return res.status(500).json({
      message: "Failed to fetch state destinations",

      error: error.message,
    });
  }
};

// Get single destination
export const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id).populate(
      "stateId",
      "name",
    );

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    const destinationData = destination.toObject();

    // Things To Do
    destinationData.thingsToDo = Array.isArray(destinationData.thingsToDo)
      ? destinationData.thingsToDo
      : [];

    // Nearby Places
    destinationData.nearbyPlaces = normalizeNearbyPlaces(
      destinationData.nearbyPlaces,
    );

    return res.status(200).json(destinationData);
  } catch (error) {
    console.error("Get destination error:", error);

    return res.status(500).json({
      message: "Failed to fetch destination",

      error: error.message,
    });
  }
};

// Search destinations
export const searchDestinations = async (req, res) => {
  try {
    const { query = "", exact = "false" } = req.query;

    if (!query.trim()) {
      return res.status(200).json([]);
    }

    const searchQuery = query.trim();

    const nameRegex =
      exact === "true"
        ? new RegExp(`^${searchQuery}$`, "i")
        : new RegExp(searchQuery, "i");

    const destinations = await Destination.find({
      $or: [
        {
          name: nameRegex,
        },

        {
          location: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          category: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          famousFor: {
            $regex: searchQuery,
            $options: "i",
          },
        },

        {
          "nearbyPlaces.name": {
            $regex: searchQuery,
            $options: "i",
          },
        },
      ],
    })
      .populate("stateId", "name")
      .sort({
        rating: -1,
        wishlistCount: -1,
        createdAt: -1,
      });

    return res.status(200).json(destinations);
  } catch (error) {
    console.error("Search destinations error:", error);

    return res.status(500).json({
      message: "Failed to search destinations",

      error: error.message,
    });
  }
};

// Filter destinations

export const filterDestinations = async (req, res) => {
  try {
    const { category, rating } = req.query;

    const categoryKeywords = {
      hills: [
        "hill",
        "hills",
        "mountain",
        "mountains",
        "valley",
        "hill station",
      ],
      lakes: ["lake", "lakes", "lagoon", "reservoir"],
      waterfall: ["waterfall", "waterfalls", "falls", "cascade"],
      beach: ["beach", "beaches", "coastal", "coast", "shore"],
      adventure: [
        "adventure",
        "trekking",
        "trek",
        "camping",
        "rafting",
        "hiking",
      ],
      temple: [
        "temple",
        "temples",
        "mandir",
        "religious",
        "spiritual",
        "pilgrimage",
        "gurudwara",
        "mosque",
        "church",
      ],
      historical: [
        "historical",
        "history",
        "heritage",
        "fort",
        "forts",
        "palace",
        "monument",
        "architecture",
        "archaeological",
      ],
      wildlife: [
        "wildlife",
        "zoo",
        "zoos",
        "sanctuary",
        "sanctuaries",
        "national park",
        "national parks",
        "tiger reserve",
        "bird sanctuary",
      ],
      nature: [
        "nature",
        "scenic",
        "forest",
        "forests",
        "garden",
        "gardens",
        "viewpoint",
        "view point",
        "landscape",
      ],
      culture: [
        "culture",
        "cultural",
        "museum",
        "museums",
        "art",
        "handicrafts",
        "festival",
      ],
      backwaters: [
        "backwater",
        "backwaters",
        "island",
        "islands",
        "houseboat",
        "houseboats",
      ],
      city: ["city", "cities", "town", "towns", "urban"],
      other: [],
    };

    const filter = {};

    if (category) {
      const keywords = categoryKeywords[category];

      if (!keywords) {
        return res.status(400).json({
          message: "Invalid destination category",
        });
      }

      if (category === "other") {
        const allKeywords = Object.values(categoryKeywords)
          .flat()
          .filter(Boolean);

        filter.category = {
          $nin: allKeywords.map((keyword) => new RegExp(keyword, "i")),
        };
      } else {
        filter.category = {
          $in: keywords.map((keyword) => new RegExp(keyword, "i")),
        };
      }
    }

    if (rating) {
      const minimumRating = Number(rating);

      if (!Number.isFinite(minimumRating) || minimumRating < 0) {
        return res.status(400).json({
          message: "Invalid rating filter",
        });
      }

      filter.rating = {
        $gte: minimumRating,
      };
    }

    const destinations = await Destination.find(filter)
      .populate("stateId", "name")
      .sort({
        rating: -1,
        wishlistCount: -1,
        createdAt: -1,
      });

    return res.status(200).json(destinations);
  } catch (error) {
    console.error("Filter destinations error:", error);

    return res.status(500).json({
      message: "Failed to filter destinations",
      error: error.message,
    });
  }
};


// Get categories

export const getDestinationCategories = async (req, res) => {
  try {
    const categories = [
      { value: "hills", label: "Hills & Mountains" },
      { value: "lakes", label: "Lakes" },
      { value: "waterfall", label: "Waterfalls" },
      { value: "beach", label: "Beaches" },
      { value: "adventure", label: "Adventure" },
      { value: "temple", label: "Temples & Religious" },
      { value: "historical", label: "Historical & Heritage" },
      { value: "wildlife", label: "Wildlife & Zoos" },
      { value: "nature", label: "Nature & Scenic" },
      { value: "culture", label: "Culture & Museums" },
      { value: "backwaters", label: "Backwaters & Islands" },
      { value: "city", label: "Cities & Towns" },
      { value: "other", label: "Other Attractions" },
    ];

    return res.status(200).json(categories);
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      message: "Failed to fetch categories",
      error: error.message,
    });
  }
};


// Update destination
export const updateDestination = async (req, res) => {
  try {
    const {
      stateId,
      name,
      description,
      location,
      category,
      famousFor,
      image,
      imagePublicId,
      galleryImages,
      shortVideos,
      thingsToDo,
      nearbyPlaces,
      bestTime,
      travelTips,
      rating,
    } = req.body;

    // Find destination
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    // State ID
    const finalStateId =
      typeof stateId === "object" && stateId !== null ? stateId._id : stateId;

    // Old main image
    const oldImage = destination.image;

    const oldImagePublicId =
      destination.imagePublicId || getPublicIdFromCloudinaryUrl(oldImage);

    // New main image
    const newImage = typeof image === "string" ? image.trim() : oldImage;

    const newImagePublicId =
      typeof imagePublicId === "string" && imagePublicId.trim()
        ? imagePublicId.trim()
        : getPublicIdFromCloudinaryUrl(newImage);

    // Check image change
    const imageChanged =
      oldImage !== newImage &&
      oldImagePublicId &&
      oldImagePublicId !== newImagePublicId;

    // Old gallery
    const oldGallery = destination.galleryImages || [];

    const oldGalleryPublicIds = getGalleryPublicIds(oldGallery);

    // New gallery
    const newGallery = normalizeGalleryImages(galleryImages);

    const newGalleryPublicIds = getGalleryPublicIds(newGallery);

    // Removed gallery images
    const removedGalleryPublicIds = oldGalleryPublicIds.filter(
      (oldPublicId) => !newGalleryPublicIds.includes(oldPublicId),
    );

    // Old videos
    const oldVideos = normalizeShortVideos(destination.shortVideos);

    // New videos
    const newVideos = normalizeShortVideos(shortVideos);

    const oldVideoPublicIds = getVideoPublicIds(oldVideos);

    const newVideoPublicIds = getVideoPublicIds(newVideos);

    // Removed videos
    const removedVideoPublicIds = oldVideoPublicIds.filter(
      (oldPublicId) => !newVideoPublicIds.includes(oldPublicId),
    );

    // Things To Do
    const finalThingsToDo = normalizeThingsToDo(thingsToDo);

    // Nearby Places
    const finalNearbyPlaces = normalizeNearbyPlaces(nearbyPlaces);

    // Update basic data
    destination.stateId = finalStateId;

    destination.name =
      typeof name === "string" ? name.trim() : destination.name;

    destination.description =
      typeof description === "string"
        ? description.trim()
        : destination.description;

    destination.location =
      typeof location === "string" ? location.trim() : destination.location;

    destination.category =
      typeof category === "string" ? category.trim() : destination.category;

    destination.famousFor =
      typeof famousFor === "string" ? famousFor.trim() : destination.famousFor;

    // Main image
    destination.image = newImage;

    destination.imagePublicId = newImagePublicId;

    // Destination gallery
    destination.galleryImages = newGallery;

    // Destination videos
    destination.shortVideos = newVideos;

    // Things To Do
    destination.thingsToDo = finalThingsToDo;

    // Nearby Places
    destination.nearbyPlaces = finalNearbyPlaces;

    // Travel information
    destination.bestTime =
      typeof bestTime === "string" ? bestTime.trim() : destination.bestTime;

    destination.travelTips =
      typeof travelTips === "string"
        ? travelTips.trim()
        : destination.travelTips;

    destination.rating =
      rating !== undefined && rating !== ""
        ? Number(rating)
        : destination.rating;

    // Save
    const updatedDestination = await destination.save();

    // Delete old main image
    if (imageChanged) {
      await deleteCloudinaryImage(oldImagePublicId);
    }

    // Delete removed gallery
    for (const publicId of removedGalleryPublicIds) {
      await deleteCloudinaryImage(publicId);
    }

    // Delete removed videos
    for (const publicId of removedVideoPublicIds) {
      await deleteCloudinaryVideo(publicId);
    }

    // Notification
    await createNotification({
      title: "Destination Updated",

      message: `${updatedDestination.name} has been updated successfully.`,

      type: "destination",

      audience: "admin",
    });

    return res.status(200).json({
      message: "Destination updated successfully",

      destination: updatedDestination,
    });
  } catch (error) {
    console.error("Update destination error:", error);

    return res.status(500).json({
      message: "Failed to update destination",

      error: error.message,

      details: error.errors || null,
    });
  }
};

// Delete destination
export const deleteDestination = async (req, res) => {
  try {
    // Find destination
    const destination = await Destination.findById(req.params.id);

    if (!destination) {
      return res.status(404).json({
        message: "Destination not found",
      });
    }

    const destinationName = destination.name;

    // Main image
    const mainImagePublicId =
      destination.imagePublicId ||
      getPublicIdFromCloudinaryUrl(destination.image);

    // Gallery images
    const galleryPublicIds = getGalleryPublicIds(destination.galleryImages);

    // Videos
    const videoPublicIds = getVideoPublicIds(destination.shortVideos);

    // Delete destination
    await destination.deleteOne();

    // Delete associated attractions
    await Attraction.deleteMany({
      destinationId: destination._id,
    });

    // Delete main image
    if (mainImagePublicId) {
      await deleteCloudinaryImage(mainImagePublicId);
    }

    // Delete gallery images
    for (const publicId of galleryPublicIds) {
      await deleteCloudinaryImage(publicId);
    }

    // Delete videos
    for (const publicId of videoPublicIds) {
      await deleteCloudinaryVideo(publicId);
    }

    // Notification
    await createNotification({
      title: "Destination Deleted",

      message: `${destinationName} has been deleted.`,

      type: "destination",

      audience: "admin",
    });

    return res.status(200).json({
      message: "Destination and associated media deleted successfully",
    });
  } catch (error) {
    console.error("Delete destination error:", error);

    return res.status(500).json({
      message: "Failed to delete destination",

      error: error.message,

      details: error.errors || null,
    });
  }
};
