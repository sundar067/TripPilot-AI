import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import { getDestinationById } from "../services/destinationService";
import {
  toggleWishlist,
  checkWishlistStatus,
} from "../services/wishlistService";

import { addRecentlyViewed } from "../services/recentlyViewedService";

import Loader from "../components/common/Loader";

import {
  Image,
  X,
  ChevronLeft,
  ChevronRight,
  Heart,
  MapPin,
  ArrowLeft,
  Navigation,
} from "lucide-react";

import { FaWhatsapp } from "react-icons/fa";

import { useSwipeable } from "react-swipeable";

function DestinationDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const [toastMessage, setToastMessage] = useState("");

  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);

  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Selected activity
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Selected nearby place
  const [selectedNearbyPlace, setSelectedNearbyPlace] = useState(null);

  // Load data
  useEffect(() => {
    setLoading(true);

    fetchAllData();
    fetchWishlistStatus();
    saveRecentlyViewed();
  }, [id]);

  // Scroll to top when activity or nearby place opens
  useEffect(() => {
    if (selectedActivity || selectedNearbyPlace) {
      setSelectedImage(null);
      setSelectedImageIndex(0);

      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant",
      });
    }
  }, [selectedActivity, selectedNearbyPlace]);

  // Close details with ESC
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === "Escape" && selectedActivity) {
        setSelectedActivity(null);
      }

      if (event.key === "Escape" && selectedNearbyPlace) {
        setSelectedNearbyPlace(null);
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [selectedActivity, selectedNearbyPlace]);

  // Show toast
  const showToast = (message) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage("");
    }, 2500);
  };

  // Get logged-in user ID
  const getLoggedInUserId = () => {
    const keys = ["user", "tripPilotUser", "authUser", "userInfo"];

    for (const key of keys) {
      const data = localStorage.getItem(key);

      if (!data) continue;

      try {
        const user = JSON.parse(data);

        const userId =
          user?._id || user?.id || user?.user?._id || user?.user?.id;

        if (userId) {
          return userId;
        }
      } catch (error) {
        console.log(error);
      }
    }

    return null;
  };

  // Check wishlist
  const fetchWishlistStatus = async () => {
    try {
      const userId = getLoggedInUserId();

      if (!userId) {
        setIsWishlisted(false);
        return;
      }

      const response = await checkWishlistStatus(id, userId);

      setIsWishlisted(response.data.isWishlisted);
    } catch (error) {
      console.log(error);
      setIsWishlisted(false);
    }
  };

  // Save recently viewed destination
  const saveRecentlyViewed = async () => {
    try {
      const userId = getLoggedInUserId();

      if (!userId) {
        return;
      }

      await addRecentlyViewed(id, userId);
    } catch (error) {
      console.log(error);
    }
  };

  // Fetch destination
  const fetchAllData = async () => {
    try {
      const destinationRes = await getDestinationById(id);

      setDestination(destinationRes.data);
    } catch (error) {
      console.log(error);

      showToast("Destination details load nahi ho paayi");
    } finally {
      setLoading(false);
    }
  };

  // Wishlist button
  const handleWishlist = async () => {
    try {
      const userId = getLoggedInUserId();

      if (!userId) {
        showToast("Please login to use wishlist");
        return;
      }

      const response = await toggleWishlist(id, userId);

      setIsWishlisted(response.data.isWishlisted);
    } catch (error) {
      console.log(error);

      showToast("Something went wrong");
    }
  };

  // Share on WhatsApp
  const handleShare = () => {
    if (!destination) return;

    const shareUrl = window.location.href;

    const message = `🌍 Check out ${destination.name} on TripPilot AI!

📍 ${destination.location}

${shareUrl}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  // Open Google Maps with current location
  const handleGetDirections = () => {
    if (!destination?.location) {
      showToast("Destination location is not available");
      return;
    }

    // Check browser geolocation support
    if (!navigator.geolocation) {
      showToast("Location is not supported by your browser");
      return;
    }

    showToast("Getting your current location...");

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        // Current user location
        const origin = `${latitude},${longitude}`;

        // Destination location
        const destinationLocation = encodeURIComponent(destination.location);

        // Google Maps directions URL
        const googleMapsUrl =
          `https://www.google.com/maps/dir/?api=1` +
          `&origin=${encodeURIComponent(origin)}` +
          `&destination=${destinationLocation}` +
          `&travelmode=driving`;

        // Open Google Maps
        window.open(googleMapsUrl, "_blank", "noopener,noreferrer");
      },
      (error) => {
        console.log("Location error:", error);

        if (error.code === error.PERMISSION_DENIED) {
          showToast("Please allow location permission");
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          showToast("Unable to get your location");
        } else if (error.code === error.TIMEOUT) {
          showToast("Location request timed out");
        } else {
          showToast("Unable to get your location");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // Get image URL
  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (typeof image === "string") {
      return image;
    }

    if (typeof image === "object") {
      return image.url || "";
    }

    return "";
  };

  // Get video URL
  const getVideoUrl = (video) => {
    if (!video) {
      return "";
    }

    if (typeof video === "string") {
      return video;
    }

    if (typeof video === "object") {
      return video.url || "";
    }

    return "";
  };

  // Get video type
  const getVideoType = (video) => {
    if (!video) {
      return "url";
    }

    if (typeof video === "string") {
      return "url";
    }

    if (typeof video === "object") {
      return video.type || "url";
    }

    return "url";
  };

  // Check direct video
  const isDirectVideo = (url, type) => {
    if (!url) {
      return false;
    }

    if (type === "cloudinary") {
      return true;
    }

    const lowerUrl = url.toLowerCase();

    return (
      lowerUrl.includes("res.cloudinary.com") ||
      lowerUrl.includes("/video/upload/") ||
      lowerUrl.endsWith(".mp4") ||
      lowerUrl.endsWith(".webm") ||
      lowerUrl.endsWith(".mov") ||
      lowerUrl.endsWith(".m4v")
    );
  };

  // Convert YouTube URL
  const getYouTubeEmbedUrl = (url) => {
    if (!url) {
      return "";
    }

    try {
      const parsedUrl = new URL(url);

      if (parsedUrl.hostname.includes("youtu.be")) {
        const videoId = parsedUrl.pathname.replace("/", "");

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (parsedUrl.hostname.includes("youtube.com")) {
        const videoId = parsedUrl.searchParams.get("v");

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }

        if (parsedUrl.pathname.startsWith("/embed/")) {
          return url;
        }

        if (parsedUrl.pathname.startsWith("/shorts/")) {
          const videoIdFromShorts = parsedUrl.pathname
            .replace("/shorts/", "")
            .split("/")[0];

          if (videoIdFromShorts) {
            return `https://www.youtube.com/embed/${videoIdFromShorts}`;
          }
        }
      }

      return url;
    } catch (error) {
      return url;
    }
  };

  // Convert Instagram URL
  const getInstagramEmbedUrl = (url) => {
    if (!url) {
      return "";
    }

    try {
      const parsedUrl = new URL(url);

      if (!parsedUrl.hostname.includes("instagram.com")) {
        return url;
      }

      const parts = parsedUrl.pathname.split("/").filter(Boolean);

      if (parts[0] === "reel" && parts[1]) {
        return `https://www.instagram.com/reel/${parts[1]}/embed/`;
      }

      if (parts[0] === "p" && parts[1]) {
        return `https://www.instagram.com/p/${parts[1]}/embed/`;
      }

      if (parts[0] === "tv" && parts[1]) {
        return `https://www.instagram.com/tv/${parts[1]}/embed/`;
      }

      return url;
    } catch (error) {
      return url;
    }
  };

  // Check Instagram URL
  const isInstagramUrl = (url) => {
    if (!url) {
      return false;
    }

    try {
      return new URL(url).hostname.includes("instagram.com");
    } catch (error) {
      return false;
    }
  };

  // Destination gallery
  const galleryImages = Array.isArray(destination?.galleryImages)
    ? destination.galleryImages
        .map((image) => getImageUrl(image))
        .filter(Boolean)
    : [];

  // Destination videos
  const videos = Array.isArray(destination?.shortVideos)
    ? destination.shortVideos
        .map((video) => ({
          type: getVideoType(video),
          url: getVideoUrl(video),
        }))
        .filter((video) => video.url)
    : [];

  // Things to do
  const thingsToDo = Array.isArray(destination?.thingsToDo)
    ? destination.thingsToDo
    : [];

  // Activity gallery
  const getActivityGallery = (activity) => {
    if (!Array.isArray(activity?.galleryImages)) {
      return [];
    }

    return activity.galleryImages
      .map((image) => getImageUrl(image))
      .filter(Boolean);
  };

  // Activity videos
  const getActivityVideos = (activity) => {
    if (!Array.isArray(activity?.shortVideos)) {
      return [];
    }

    return activity.shortVideos
      .map((video) => ({
        type: getVideoType(video),
        url: getVideoUrl(video),
      }))
      .filter((video) => video.url);
  };

  // Get activity images
  const getAllActivityImages = (activity) => {
    const mainImage = getImageUrl(activity?.image);
    const gallery = getActivityGallery(activity);

    return [
      ...(mainImage ? [mainImage] : []),
      ...gallery.filter((image) => image !== mainImage),
    ];
  };

  // Nearby places
  const nearbyPlaces = Array.isArray(destination?.nearbyPlaces)
    ? destination.nearbyPlaces
    : [];

  // Nearby place gallery
  const getNearbyGallery = (place) => {
    if (!Array.isArray(place?.galleryImages)) {
      return [];
    }

    return place.galleryImages
      .map((image) => getImageUrl(image))
      .filter(Boolean);
  };

  // Get nearby place images
  const getAllNearbyImages = (place) => {
    const mainImage = getImageUrl(place?.image);
    const gallery = getNearbyGallery(place);

    return [
      ...(mainImage ? [mainImage] : []),
      ...gallery.filter((image) => image !== mainImage),
    ];
  };

  // Images used in viewer
  const viewerImages = selectedActivity
    ? getAllActivityImages(selectedActivity)
    : selectedNearbyPlace
      ? getAllNearbyImages(selectedNearbyPlace)
      : galleryImages;

  // Visible destination images
  const visibleImages = showAllImages
    ? galleryImages
    : galleryImages.slice(0, 3);

  // Visible videos
  const visibleVideos = showAllVideos ? videos : videos.slice(0, 3);

  // Next image
  const nextImage = () => {
    if (viewerImages.length === 0) {
      return;
    }

    const next = (selectedImageIndex + 1) % viewerImages.length;

    setSelectedImageIndex(next);
    setSelectedImage(viewerImages[next]);
  };

  // Previous image
  const prevImage = () => {
    if (viewerImages.length === 0) {
      return;
    }

    const prev =
      (selectedImageIndex - 1 + viewerImages.length) % viewerImages.length;

    setSelectedImageIndex(prev);
    setSelectedImage(viewerImages[prev]);
  };

  // Swipe support
  const handlers = useSwipeable({
    onSwipedLeft: () => nextImage(),
    onSwipedRight: () => prevImage(),
    trackMouse: true,
  });

  // Loading
  if (loading) {
    return <Loader />;
  }

  // Destination not found
  if (!destination) {
    return (
      <div className="p-10 text-center text-xl">Destination not found</div>
    );
  }

  // Full activity details
  if (selectedActivity) {
    const activityImage = getImageUrl(selectedActivity?.image);
    const activityVideos = getActivityVideos(selectedActivity);

    const allActivityImages = getAllActivityImages(selectedActivity);

    const activityPreviewImages = allActivityImages.slice(0, 3);

    const hasMoreActivityImages = allActivityImages.length > 3;

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Activity top bar */}
        <div className="mx-auto max-w-7xl px-4 pt-5 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedActivity(null)}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft size={18} />
              <span>Back to {destination.name}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedActivity(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close activity"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <main className="mx-auto max-w-7xl px-4 pb-16 pt-4 sm:px-6 lg:px-8">
          {/* Hero */}
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="relative">
              {activityImage ? (
                <img
                  src={activityImage}
                  alt={selectedActivity.name}
                  className="h-[300px] w-full object-cover sm:h-[400px] lg:h-[500px]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center bg-gray-200 sm:h-[400px] lg:h-[500px]">
                  <Image size={60} className="text-gray-400" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                <div className="mb-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 backdrop-blur">
                  Things To Do
                </div>

                <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {selectedActivity.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={16} />
                    {destination.name}
                  </span>

                  {destination.location && (
                    <>
                      <span className="text-white/50">•</span>
                      <span>{destination.location}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick information */}
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 sm:grid-cols-4 sm:divide-y-0">
              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Price</p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {selectedActivity.price || "Not available"}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Timing</p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {selectedActivity.timing || "Not available"}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Best Time</p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  {selectedActivity.bestTime || "Not available"}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Rating</p>

                <p className="mt-1 text-lg font-bold text-gray-900">
                  ⭐ {selectedActivity.rating ?? 0}
                </p>
              </div>
            </div>
          </section>

          {/* About activity */}
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
            <div className="max-w-4xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                Experience
              </p>

              <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                About This Activity
              </h2>

              <p className="mt-4 text-base leading-8 text-gray-600">
                {selectedActivity.description ||
                  "Experience this activity and explore what this destination has to offer."}
              </p>
            </div>
          </section>

          {/* Activity gallery */}
          {allActivityImages.length > 0 && (
            <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Photos
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Activity Gallery
                  </h2>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                  {allActivityImages.length}{" "}
                  {allActivityImages.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {activityPreviewImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => {
                      setSelectedImage(image);
                      setSelectedImageIndex(index);
                    }}
                    className={`group relative overflow-hidden rounded-2xl ${
                      index === 0
                        ? "col-span-2 row-span-2 h-[360px] sm:h-[420px] lg:col-span-2 lg:h-[500px]"
                        : "h-44 sm:h-52"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${selectedActivity.name} ${index + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />

                    {index === 0 && (
                      <div className="absolute bottom-4 left-4 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                        View Gallery
                      </div>
                    )}
                  </button>
                ))}

                {hasMoreActivityImages && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(allActivityImages[3]);
                      setSelectedImageIndex(3);
                    }}
                    className="group relative h-44 overflow-hidden rounded-2xl sm:h-52"
                  >
                    <img
                      src={allActivityImages[3]}
                      alt={`${selectedActivity.name} more photos`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white transition group-hover:bg-black/70">
                      <Image size={30} />

                      <span className="mt-1 text-2xl font-bold">
                        +{allActivityImages.length - 3}
                      </span>

                      <span className="text-sm font-semibold">More Photos</span>
                    </div>
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Activity videos */}
          {activityVideos.length > 0 && (
            <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              <div className="mb-6">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Watch
                </p>

                <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                  Activity Videos
                </h2>

                <p className="mt-2 text-gray-500">
                  Watch videos and get a better feel for the experience.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {activityVideos.map((video, index) => {
                  if (isDirectVideo(video.url, video.type)) {
                    return (
                      <div
                        key={`${video.url}-${index}`}
                        className="overflow-hidden rounded-2xl bg-black shadow-sm"
                      >
                        <video
                          src={video.url}
                          controls
                          playsInline
                          preload="metadata"
                          className="aspect-video w-full object-cover"
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    );
                  }

                  if (isInstagramUrl(video.url)) {
                    return (
                      <div
                        key={`${video.url}-${index}`}
                        className="flex min-h-[500px] items-center justify-center overflow-hidden rounded-2xl bg-gray-50"
                      >
                        <iframe
                          src={getInstagramEmbedUrl(video.url)}
                          title={`${selectedActivity.name} Instagram video ${
                            index + 1
                          }`}
                          className="h-[600px] w-full max-w-[540px]"
                          scrolling="no"
                          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                          allowFullScreen
                        />
                      </div>
                    );
                  }

                  return (
                    <div
                      key={`${video.url}-${index}`}
                      className="overflow-hidden rounded-2xl bg-black shadow-sm"
                    >
                      <iframe
                        src={getYouTubeEmbedUrl(video.url)}
                        title={`${selectedActivity.name} video ${index + 1}`}
                        className="aspect-video w-full"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* Safety tips */}
          {selectedActivity.safetyTips && (
            <section className="mt-8 rounded-3xl border border-yellow-200 bg-yellow-50 p-6 sm:p-8">
              <p className="text-sm font-semibold uppercase tracking-wider text-yellow-700">
                Travel Safety
              </p>

              <h2 className="mt-1 text-2xl font-bold text-yellow-900">
                Safety Tips
              </h2>

              <p className="mt-3 max-w-5xl leading-7 text-yellow-900/80">
                {selectedActivity.safetyTips}
              </p>
            </section>
          )}

          {/* No media */}
          {allActivityImages.length === 0 && activityVideos.length === 0 && (
            <section className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
              <Image size={42} className="mx-auto text-gray-300" />

              <h3 className="mt-3 text-lg font-bold text-gray-800">
                More media coming soon
              </h3>

              <p className="mt-1 text-gray-500">
                Additional photos and videos for this activity are not available
                yet.
              </p>
            </section>
          )}

          {/* Back button */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setSelectedActivity(null)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Back to {destination.name}
            </button>
          </div>
        </main>

        {/* Activity image viewer */}
        {selectedImage && selectedActivity && (
          <div
            {...handlers}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute right-5 top-5 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
              aria-label="Close image viewer"
            >
              <X size={28} />
            </button>

            {viewerImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:left-8"
                aria-label="Previous image"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            <img
              src={selectedImage}
              alt={`${selectedActivity.name} gallery`}
              className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {viewerImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:right-8"
                aria-label="Next image"
              >
                <ChevronRight size={30} />
              </button>
            )}

            {viewerImages.length > 0 && (
              <div className="absolute bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                {selectedImageIndex + 1} / {viewerImages.length}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full nearby place details
  if (selectedNearbyPlace) {
    const nearbyImage = getImageUrl(selectedNearbyPlace.image);
    const allNearbyImages = getAllNearbyImages(selectedNearbyPlace);
    const nearbyPreviewImages = allNearbyImages.slice(0, 3);
    const hasMoreNearbyImages = allNearbyImages.length > 3;

    return (
      <div className="min-h-screen bg-[#f8fafc]">
        {/* Nearby place details */}
        <main className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 lg:px-8">
          {/* Back button */}
          <div className="mb-5 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedNearbyPlace(null)}
              className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              <ArrowLeft size={18} />
              <span>Back to {destination.name}</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedNearbyPlace(null)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 shadow-sm transition hover:bg-gray-100 hover:text-gray-900"
              aria-label="Close nearby place"
            >
              <X size={20} />
            </button>
          </div>

          {/* Hero */}
          <section className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200">
            <div className="relative">
              {nearbyImage ? (
                <img
                  src={nearbyImage}
                  alt={selectedNearbyPlace.name}
                  className="h-[300px] w-full object-cover sm:h-[400px] lg:h-[500px]"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              ) : (
                <div className="flex h-[300px] items-center justify-center bg-gray-200 sm:h-[400px] lg:h-[500px]">
                  <Image size={60} className="text-gray-400" />
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8 lg:p-10">
                <div className="mb-3 inline-flex rounded-full bg-white/90 px-3 py-1 text-sm font-semibold text-gray-800 backdrop-blur">
                  Nearby Place
                </div>

                <h1 className="max-w-4xl text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {selectedNearbyPlace.name}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-white/90">
                  {selectedNearbyPlace.distance && (
                    <span>{selectedNearbyPlace.distance}</span>
                  )}

                  {selectedNearbyPlace.location && (
                    <>
                      <span className="text-white/50">•</span>
                      <span className="flex items-center gap-1.5">
                        <MapPin size={16} />
                        {selectedNearbyPlace.location}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Quick information */}
            <div className="grid grid-cols-2 divide-x divide-y divide-gray-200 sm:grid-cols-4 sm:divide-y-0">
              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Distance</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {selectedNearbyPlace.distance || "Not available"}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Location</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {selectedNearbyPlace.location || "Not available"}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Best Time</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  {selectedNearbyPlace.bestTime || "Not available"}
                </p>
              </div>

              <div className="p-5 sm:p-6">
                <p className="text-sm text-gray-500">Rating</p>
                <p className="mt-1 text-lg font-bold text-gray-900">
                  ⭐ {selectedNearbyPlace.rating ?? 0}
                </p>
              </div>
            </div>
          </section>

          {/* About nearby place */}
          <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Explore
            </p>

            <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
              About This Place
            </h2>

            <p className="mt-4 max-w-5xl text-base leading-8 text-gray-600">
              {selectedNearbyPlace.description ||
                "Explore this nearby place and discover what makes it special."}
            </p>

            {selectedNearbyPlace.famousFor && (
              <div className="mt-6 rounded-2xl bg-blue-50 p-5">
                <p className="text-sm font-semibold text-blue-600">
                  Famous For
                </p>

                <p className="mt-1 text-base font-medium text-gray-800">
                  {selectedNearbyPlace.famousFor}
                </p>
              </div>
            )}
          </section>

          {/* Nearby gallery */}
          {allNearbyImages.length > 0 && (
            <section className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200 sm:p-8">
              <div className="mb-6 flex items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                    Photos
                  </p>

                  <h2 className="mt-1 text-2xl font-bold text-gray-900 sm:text-3xl">
                    Photo Gallery
                  </h2>
                </div>

                <span className="rounded-full bg-gray-100 px-3 py-1 text-sm font-semibold text-gray-600">
                  {allNearbyImages.length}{" "}
                  {allNearbyImages.length === 1 ? "Photo" : "Photos"}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {nearbyPreviewImages.map((image, index) => (
                  <button
                    type="button"
                    key={`${image}-${index}`}
                    onClick={() => {
                      setSelectedImage(image);
                      setSelectedImageIndex(index);
                    }}
                    className={`group relative overflow-hidden rounded-2xl ${
                      index === 0
                        ? "col-span-2 row-span-2 h-[360px] sm:h-[420px] lg:col-span-2 lg:h-[500px]"
                        : "h-44 sm:h-52"
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${selectedNearbyPlace.name} ${index + 1}`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 bg-black/0 transition group-hover:bg-black/20" />
                  </button>
                ))}

                {hasMoreNearbyImages && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(allNearbyImages[3]);
                      setSelectedImageIndex(3);
                    }}
                    className="group relative h-44 overflow-hidden rounded-2xl sm:h-52"
                  >
                    <img
                      src={allNearbyImages[3]}
                      alt={`${selectedNearbyPlace.name} more photos`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />

                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white transition group-hover:bg-black/70">
                      <Image size={30} />

                      <span className="mt-1 text-2xl font-bold">
                        +{allNearbyImages.length - 3}
                      </span>

                      <span className="text-sm font-semibold">More Photos</span>
                    </div>
                  </button>
                )}
              </div>
            </section>
          )}

          {/* No gallery */}
          {allNearbyImages.length === 0 && (
            <section className="mt-8 rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
              <Image size={42} className="mx-auto text-gray-300" />

              <h3 className="mt-3 text-lg font-bold text-gray-800">
                More photos coming soon
              </h3>

              <p className="mt-1 text-gray-500">
                Additional photos for this place are not available yet.
              </p>
            </section>
          )}

          {/* Back button */}
          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={() => setSelectedNearbyPlace(null)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              <ArrowLeft size={18} />
              Back to {destination.name}
            </button>
          </div>
        </main>

        {/* Nearby image viewer */}
        {selectedImage && (
          <div
            {...handlers}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
            onClick={() => setSelectedImage(null)}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImage(null);
              }}
              className="absolute right-5 top-5 z-[110] flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30"
              aria-label="Close image viewer"
            >
              <X size={28} />
            </button>

            {viewerImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prevImage();
                }}
                className="absolute left-4 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:left-8"
                aria-label="Previous image"
              >
                <ChevronLeft size={30} />
              </button>
            )}

            <img
              src={selectedImage}
              alt={`${selectedNearbyPlace.name} gallery`}
              className="max-h-[88vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />

            {viewerImages.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  nextImage();
                }}
                className="absolute right-4 top-1/2 z-[110] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition hover:bg-white/30 sm:right-8"
                aria-label="Next image"
              >
                <ChevronRight size={30} />
              </button>
            )}

            {viewerImages.length > 0 && (
              <div className="absolute bottom-6 left-1/2 z-[110] -translate-x-1/2 rounded-full bg-black/60 px-4 py-2 text-sm font-semibold text-white backdrop-blur">
                {selectedImageIndex + 1} / {viewerImages.length}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Normal destination page
  return (
    <div className="mx-auto max-w-6xl p-5">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed right-5 top-5 z-50 rounded-lg bg-black px-5 py-3 text-white shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Main destination image */}
      <div className="relative">
        <img
          src={destination.image}
          alt={destination.name}
          className="h-96 w-full rounded-xl object-cover"
          onError={(e) => {
            e.currentTarget.style.display = "none";
          }}
        />

        {/* Floating buttons */}
        <div className="absolute bottom-5 right-5 flex items-center gap-3">
          {/* Wishlist */}
          <button
            onClick={handleWishlist}
            title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
          >
            <Heart
              size={26}
              className={`transition-all duration-300 ${
                isWishlisted ? "fill-red-500 text-red-500" : "text-red-500"
              }`}
            />
          </button>

          {/* WhatsApp */}
          <button
            onClick={handleShare}
            title="Share on WhatsApp"
            className="flex h-14 w-14 items-center justify-center rounded-full bg-white shadow-xl transition-all duration-300 hover:scale-110 hover:shadow-2xl active:scale-95"
          >
            <FaWhatsapp size={26} className="text-[#25D366]" />
          </button>
        </div>
      </div>

      {/* Destination name */}
      <h1 className="mt-5 text-4xl font-bold">{destination.name}</h1>

      {/* Category */}
      <p className="mt-2 font-semibold text-blue-600">{destination.category}</p>

      {/* Description */}
      <p className="mt-3 leading-relaxed text-gray-700">
        {destination.description}
      </p>

      {/* Destination information */}
      <div className="mt-6 space-y-4">
        {/* Location */}
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="flex items-center gap-1.5">
              <b>Location:</b>

              <MapPin size={16} className="text-red-500" />

              {destination.location || "Not available"}
            </p>
          </div>

          {/* Google Maps button */}
          {destination.location && (
            <button
              type="button"
              onClick={handleGetDirections}
              className="mt-3 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95"
            >
              <Navigation size={17} />
              Get Directions
            </button>
          )}
        </div>

        <p>
          <b>Famous For:</b> {destination.famousFor}
        </p>

        <p>
          <b>Best Time:</b> {destination.bestTime}
        </p>

        <p>
          <b>Rating:</b> ⭐ {destination.rating}
        </p>

        <p>
          <b>Travel Tips:</b> {destination.travelTips || "Not available"}
        </p>
      </div>

      {/* Destination gallery */}
      {galleryImages.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">Gallery</h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
            {visibleImages.map((image, index) => {
              return (
                <div
                  key={`${image}-${index}`}
                  onClick={() => {
                    setSelectedImage(image);
                    setSelectedImageIndex(index);
                  }}
                  className="h-64 cursor-pointer overflow-hidden rounded-xl"
                >
                  <img
                    src={image}
                    alt={`${destination.name} gallery ${index + 1}`}
                    className="h-full w-full object-cover transition hover:scale-105"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              );
            })}

            {/* More photos */}
            {!showAllImages && galleryImages.length > 3 && (
              <div
                onClick={() => {
                  setShowAllImages(true);
                  setSelectedImage(galleryImages[3]);
                  setSelectedImageIndex(3);
                }}
                className="relative h-64 cursor-pointer overflow-hidden rounded-xl"
              >
                <img
                  src={galleryImages[3]}
                  alt={`${destination.name} more photos`}
                  className="h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />

                <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 text-white">
                  <Image size={35} />

                  <h3 className="text-3xl font-bold">
                    +{galleryImages.length - 3}
                  </h3>

                  <p>More Photos</p>
                </div>
              </div>
            )}
          </div>

          {/* Show less */}
          {showAllImages && (
            <button
              onClick={() => setShowAllImages(false)}
              className="mt-4 font-semibold text-blue-600"
            >
              Show Less
            </button>
          )}
        </div>
      )}

      {/* Destination videos */}
      {videos.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-5 text-2xl font-bold">Short Videos</h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
            {visibleVideos.map((video, index) => {
              if (isDirectVideo(video.url, video.type)) {
                return (
                  <div
                    key={`${video.url}-${index}`}
                    className="overflow-hidden rounded-xl bg-black"
                  >
                    <video
                      src={video.url}
                      controls
                      playsInline
                      preload="metadata"
                      className="h-64 w-full object-cover"
                    >
                      Your browser does not support video playback.
                    </video>
                  </div>
                );
              }

              const externalVideoUrl = isInstagramUrl(video.url)
                ? getInstagramEmbedUrl(video.url)
                : getYouTubeEmbedUrl(video.url);

              return (
                <iframe
                  key={`${video.url}-${index}`}
                  src={externalVideoUrl}
                  title={`video-${index + 1}`}
                  className="h-64 w-full rounded-xl"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              );
            })}
          </div>

          {/* More videos */}
          {videos.length > 3 && (
            <button
              onClick={() => setShowAllVideos(!showAllVideos)}
              className="mt-5 rounded-lg bg-blue-600 px-5 py-2 text-white"
            >
              {showAllVideos ? "Show Less" : "More Videos"}
            </button>
          )}
        </div>
      )}

      {/* Things to do */}
      {thingsToDo.length > 0 && (
        <div className="mt-12">
          {/* Heading */}
          <div className="mb-5">
            <h2 className="text-3xl font-bold">Things To Do</h2>

            <p className="mt-1 text-gray-500">
              Explore activities and experiences at this destination.
            </p>
          </div>

          {/* Activity cards */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {thingsToDo.map((activity, index) => {
              const activityImage = getImageUrl(activity?.image);

              return (
                <div
                  key={activity?._id || index}
                  onClick={() => setSelectedActivity(activity)}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Activity image */}
                  {activityImage ? (
                    <div className="relative overflow-hidden">
                      <img
                        src={activityImage}
                        alt={activity?.name || "Activity"}
                        className="h-48 w-full object-cover transition duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-gray-100 text-gray-400">
                      No Image
                    </div>
                  )}

                  {/* Activity content */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold">
                      {activity?.name || "Activity"}
                    </h3>

                    {activity?.description && (
                      <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">
                        {activity.description}
                      </p>
                    )}

                    <div className="mt-4 space-y-2 text-sm">
                      {activity?.price && (
                        <p>
                          <span className="font-semibold">Price:</span>{" "}
                          {activity.price}
                        </p>
                      )}

                      {activity?.timing && (
                        <p>
                          <span className="font-semibold">Timing:</span>{" "}
                          {activity.timing}
                        </p>
                      )}

                      {activity?.bestTime && (
                        <p>
                          <span className="font-semibold">Best Time:</span>{" "}
                          {activity.bestTime}
                        </p>
                      )}

                      {activity?.rating !== undefined &&
                        activity?.rating !== null && (
                          <p>
                            <span className="font-semibold">Rating:</span> ⭐{" "}
                            {activity.rating}
                          </p>
                        )}
                    </div>

                    {/* Bottom link */}
                    <div className="mt-4 border-t pt-3 text-center">
                      <span className="text-sm font-semibold text-blue-600">
                        View Activity Details →
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nearby places */}
      {nearbyPlaces.length > 0 && (
        <div className="mt-12">
          <h2 className="mb-5 text-2xl font-bold">Nearby Places</h2>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {nearbyPlaces.map((place, index) => {
              const placeImage = getImageUrl(place?.image);

              return (
                <div
                  key={place?._id || index}
                  onClick={() => {
                    setSelectedNearbyPlace(place);
                    setSelectedImage(null);
                    setSelectedImageIndex(0);
                  }}
                  className="group cursor-pointer overflow-hidden rounded-xl border border-gray-200 bg-white shadow transition hover:-translate-y-1 hover:shadow-xl"
                >
                  {/* Image */}
                  {placeImage && (
                    <img
                      src={placeImage}
                      alt={place.name}
                      className="h-48 w-full object-cover"
                    />
                  )}

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="text-xl font-bold">{place.name}</h3>

                    {place.description && (
                      <p className="mt-1 line-clamp-2 text-sm text-gray-600">
                        {place.description}
                      </p>
                    )}

                    <p className="mt-2">
                      <b>Distance:</b> {place.distance || "Not available"}
                    </p>

                    <p>
                      <b>Famous For:</b> {place.famousFor || "Not available"}
                    </p>

                    <p>
                      <b>Best Time:</b> {place.bestTime || "Not available"}
                    </p>

                    <p>
                      <b>Rating:</b> ⭐ {place.rating || 0}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Destination image viewer */}
      {selectedImage && (
        <div
          {...handlers}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close */}
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute right-5 top-5 z-50 rounded-full bg-white/20 p-3 text-white transition hover:bg-white/40"
            aria-label="Close image viewer"
          >
            <X size={30} />
          </button>

          {/* Previous */}
          {viewerImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              className="absolute left-5 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition hover:bg-white/40"
              aria-label="Previous image"
            >
              <ChevronLeft size={35} />
            </button>
          )}

          {/* Next */}
          {viewerImages.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              className="absolute right-5 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/20 p-3 text-white transition hover:bg-white/40"
              aria-label="Next image"
            >
              <ChevronRight size={35} />
            </button>
          )}

          {/* Full image */}
          <img
            src={selectedImage}
            alt={destination.name}
            className="max-h-[85%] max-w-[90%] rounded-xl object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-8 rounded-full bg-black/60 px-5 py-2 text-white">
            {selectedImageIndex + 1}/{viewerImages.length}
          </div>
        </div>
      )}
    </div>
  );
}

export default DestinationDetails;
