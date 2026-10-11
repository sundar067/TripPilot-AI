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
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader />;

  if (!nearbyPlace) {
    return (
      <div className="p-10 text-center text-2xl font-semibold">
        Nearby Place Not Found
      </div>
    );
  }

  const galleryImages = nearbyPlace.galleryImages || [];
  const videos = nearbyPlace.shortVideos || [];

  const visibleImages = showAllImages
    ? galleryImages
    : galleryImages.slice(0, 3);

  const visibleVideos = showAllVideos ? videos : videos.slice(0, 3);

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Main Image */}
      <img
        src={nearbyPlace.image}
        alt={nearbyPlace.name}
        className="w-full h-96 object-cover rounded-xl"
      />

      {/* Title */}
      <h1 className="text-4xl font-bold mt-6">{nearbyPlace.name}</h1>

      <p className="text-gray-700 mt-4">{nearbyPlace.description}</p>

      {/* Details */}
      <div className="mt-6 space-y-2">
        <p>
          <b>Distance:</b> {nearbyPlace.distance}
        </p>

        <p>
          <b>Location:</b> {nearbyPlace.location}
        </p>

        <p>
          <b>Famous For:</b> {nearbyPlace.famousFor}
        </p>

        <p>
          <b>Best Time:</b> {nearbyPlace.bestTime}
        </p>

        <p>
          <b>Budget:</b> {nearbyPlace.budget}
        </p>

        <p>
          <b>Rating:</b> ⭐ {nearbyPlace.rating}
        </p>

        <p>
          <b>Travel Tips:</b> {nearbyPlace.travelTips}
        </p>
      </div>

      {/* Gallery */}
      {galleryImages.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Image size={25} />
            Gallery
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
            {visibleImages.map((image, index) => (
              <img
                key={index}
                src={image}
                alt={`gallery-${index}`}
                className="w-full h-64 object-cover rounded-xl hover:scale-105 transition"
              />
            ))}

            {!showAllImages && galleryImages.length > 3 && (
              <div
                onClick={() => setShowAllImages(true)}
                className="relative h-64 rounded-xl overflow-hidden cursor-pointer"
              >
                <img
                  src={galleryImages[3]}
                  alt="More"
                  className="w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-black/60 flex flex-col justify-center items-center text-white">
                  <Image size={35} />

                  <h3 className="text-3xl font-bold">
                    +{galleryImages.length - 3}
                  </h3>

                  <p>More Photos</p>
                </div>
              </div>
            )}
          </div>

          {showAllImages && (
            <button
              onClick={() => setShowAllImages(false)}
              className="mt-5 text-blue-600 font-semibold"
            >
              Show Less
            </button>
          )}
        </div>
      )}

      {/* Videos */}
      {videos.length > 0 && (
        <div className="mt-10">
          <h2 className="text-2xl font-bold mb-5 flex items-center gap-2">
            <Video size={25} />
            Short Videos
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {visibleVideos.map((video, index) => (
              <iframe
                key={index}
                src={video}
                title={`video-${index}`}
                className="w-full h-64 rounded-xl border"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ))}
          </div>

          {videos.length > 3 && (
            <button
              onClick={() => setShowAllVideos(!showAllVideos)}
              className="mt-5 px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              {showAllVideos ? "Show Less" : "More Videos"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default NearbyPlaceDetails;
