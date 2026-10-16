import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Image, Video } from "lucide-react";

import Loader from "../components/common/Loader";
import { getDestinationById } from "../services/destinationService";

function NearbyPlaceDetails() {
  const { id, placeIndex } = useParams();

  const [loading, setLoading] = useState(true);
  const [destination, setDestination] = useState(null);
  const [nearbyPlace, setNearbyPlace] = useState(null);

  const [showAllImages, setShowAllImages] = useState(false);
  const [showAllVideos, setShowAllVideos] = useState(false);

  useEffect(() => {
    fetchNearbyPlace();
  }, [id, placeIndex]);

  const fetchNearbyPlace = async () => {
    try {
      setLoading(true);

      const response = await getDestinationById(id);
      const destinationData = response.data;

      setDestination(destinationData);

      const place = destinationData?.nearbyPlaces?.[Number(placeIndex)];

      if (place) {
        setNearbyPlace(place);
      } else {
        setNearbyPlace(null);
      }
    } catch (error) {
      console.log(error);
      setNearbyPlace(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loader />;
  }

  if (!nearbyPlace) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center px-4 py-10 text-center">
        <p className="text-xl font-semibold text-gray-700 sm:text-2xl">
          Nearby Place Not Found
        </p>
      </div>
    );
  }

  const galleryImages = nearbyPlace.galleryImages || [];
  const videos = nearbyPlace.shortVideos || [];

  const visibleImages = showAllImages
    ? galleryImages
    : galleryImages.slice(0, 3);

  const visibleVideos = showAllVideos
    ? videos
    : videos.slice(0, 3);

  return (
    <div className="w-full min-w-0 overflow-x-hidden px-3 py-5 sm:px-6 sm:py-8 lg:px-8">
      <div className="mx-auto w-full max-w-6xl min-w-0">
        {/* Main Image */}
        <div className="w-full overflow-hidden rounded-xl sm:rounded-2xl">
          <img
            src={nearbyPlace.image}
            alt={nearbyPlace.name}
            className="h-56 w-full object-cover sm:h-80 md:h-96"
          />
        </div>

        {/* Title */}
        <h1 className="mt-5 break-words text-2xl font-bold leading-tight text-gray-900 sm:mt-6 sm:text-3xl lg:text-4xl">
          {nearbyPlace.name}
        </h1>

        {/* Description */}
        <p className="mt-3 break-words text-sm leading-7 text-gray-700 sm:mt-4 sm:text-base sm:leading-8">
          {nearbyPlace.description}
        </p>

        {/* Details */}
        <div className="mt-5 grid grid-cols-1 gap-3 sm:mt-6 sm:grid-cols-2 sm:gap-4 lg:grid-cols-2">
          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              <b>Distance:</b> {nearbyPlace.distance || "Not available"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              <b>Location:</b> {nearbyPlace.location || "Not available"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              <b>Famous For:</b> {nearbyPlace.famousFor || "Not available"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              <b>Best Time:</b> {nearbyPlace.bestTime || "Not available"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              <b>Budget:</b> {nearbyPlace.budget || "Not available"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5">
            <p className="break-words text-sm leading-6 text-gray-700 sm:text-base">
              <b>Rating:</b> ⭐ {nearbyPlace.rating ?? "Not available"}
            </p>
          </div>

          <div className="min-w-0 rounded-xl border border-gray-200 bg-white p-4 sm:p-5 sm:col-span-2">
            <p className="break-words text-sm leading-7 text-gray-700 sm:text-base">
              <b>Travel Tips:</b>{" "}
              {nearbyPlace.travelTips || "No travel tips available"}
            </p>
          </div>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 sm:mb-5 sm:text-2xl">
              <Image size={23} className="shrink-0 sm:h-[25px] sm:w-[25px]" />
              Gallery
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-4">
              {visibleImages.map((image, index) => (
                <div
                  key={`${image}-${index}`}
                  className="min-w-0 overflow-hidden rounded-xl"
                >
                  <img
                    src={image}
                    alt={`${nearbyPlace.name} gallery ${index + 1}`}
                    loading="lazy"
                    className="h-56 w-full rounded-xl object-cover transition duration-300 hover:scale-105 sm:h-60 md:h-64"
                  />
                </div>
              ))}

              {!showAllImages && galleryImages.length > 3 && (
                <button
                  type="button"
                  onClick={() => setShowAllImages(true)}
                  aria-label={`Show ${galleryImages.length - 3} more photos`}
                  className="group relative h-56 w-full min-w-0 overflow-hidden rounded-xl text-left sm:h-60 md:h-64"
                >
                  <img
                    src={galleryImages[3]}
                    alt="More gallery photos"
                    loading="lazy"
                    className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 px-3 text-center text-white transition group-hover:bg-black/70">
                    <Image size={32} />

                    <h3 className="mt-2 text-2xl font-bold sm:text-3xl">
                      +{galleryImages.length - 3}
                    </h3>

                    <p className="text-sm sm:text-base">More Photos</p>
                  </div>
                </button>
              )}
            </div>

            {showAllImages && (
              <button
                type="button"
                onClick={() => setShowAllImages(false)}
                className="mt-4 rounded-lg py-2 font-semibold text-blue-600 hover:text-blue-700 sm:mt-5"
              >
                Show Less
              </button>
            )}
          </section>
        )}

        {/* Videos */}
        {videos.length > 0 && (
          <section className="mt-8 sm:mt-10">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-gray-900 sm:mb-5 sm:text-2xl">
              <Video size={23} className="shrink-0 sm:h-[25px] sm:w-[25px]" />
              Short Videos
            </h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:grid-cols-3">
              {visibleVideos.map((video, index) => (
                <div
                  key={`${video}-${index}`}
                  className="relative w-full min-w-0 overflow-hidden rounded-xl border bg-white"
                >
                  <iframe
                    src={video}
                    title={`video-${index + 1}`}
                    className="aspect-video w-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ))}
            </div>

            {videos.length > 3 && (
              <button
                type="button"
                onClick={() => setShowAllVideos(!showAllVideos)}
                className="mt-4 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 sm:mt-5 sm:text-base"
              >
                {showAllVideos ? "Show Less" : "More Videos"}
              </button>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

export default NearbyPlaceDetails;
