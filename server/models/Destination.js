import mongoose from "mongoose";

const destinationSchema = new mongoose.Schema(
  {
    // state
    stateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "State",
      required: true,
    },

    // basic information
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    location: {
      type: String,
      default: "",
    },

    category: {
      type: String,
      required: true,
    },

    famousFor: {
      type: String,
      required: true,
    },

    // main image
    image: {
      type: String,
      required: true,
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    // destination gallery
    galleryImages: [
      {
        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    // destination videos
    shortVideos: [
      {
        type: {
          type: String,
          enum: ["url", "cloudinary"],
          required: true,
        },

        url: {
          type: String,
          required: true,
        },

        publicId: {
          type: String,
          default: "",
        },
      },
    ],

    // things to do
    thingsToDo: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          default: "",
        },

        image: {
          type: String,
          default: "",
        },

        imagePublicId: {
          type: String,
          default: "",
        },

        galleryImages: [
          {
            url: {
              type: String,
              required: true,
            },

            publicId: {
              type: String,
              default: "",
            },
          },
        ],

        shortVideos: [
          {
            type: {
              type: String,
              enum: ["url", "cloudinary"],
              required: true,
            },

            url: {
              type: String,
              required: true,
            },

            publicId: {
              type: String,
              default: "",
            },
          },
        ],

        price: {
          type: String,
          default: "",
        },

        bestTime: {
          type: String,
          default: "",
        },

        safetyTips: {
          type: String,
          default: "",
        },

        rating: {
          type: Number,
          default: 0,
        },
      },
    ],

    // nearby places
    nearbyPlaces: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },

        description: {
          type: String,
          default: "",
        },

        distance: {
          type: String,
          default: "",
        },

        location: {
          type: String,
          default: "",
        },

        famousFor: {
          type: String,
          default: "",
        },

        image: {
          type: String,
          default: "",
        },

        galleryImages: [
          {
            type: String,
          },
        ],

        shortVideos: [
          {
            type: {
              type: String,
              enum: ["url", "cloudinary"],
              required: true,
            },

            url: {
              type: String,
              required: true,
            },

            publicId: {
              type: String,
              default: "",
            },
          },
        ],

        bestTime: {
          type: String,
          default: "",
        },

        travelTips: {
          type: String,
          default: "",
        },

        rating: {
          type: Number,
          default: 0,
        },
      },
    ],

    // travel information
    bestTime: {
      type: String,
      required: true,
    },

    travelTips: {
      type: String,
      default: "",
    },

    // rating
    rating: {
      type: Number,
      default: 0,
    },

    // wishlist count
    wishlistCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

const Destination = mongoose.model("Destination", destinationSchema);

export default Destination;
