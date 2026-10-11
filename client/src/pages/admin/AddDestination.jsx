import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  MapPin,
  Image as ImageIcon,
  Video,
  Star,
  Lightbulb,
  Plus,
  Trash2,
  X,
  Navigation,
  Clock,
  Save,
  ArrowLeft,
} from "lucide-react";

import { getAllStates } from "../../services/stateService";
import { createDestination } from "../../services/destinationService";
import { uploadImage } from "../../services/uploadService";

function AddDestination() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Main image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Gallery images
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);

  const [formData, setFormData] = useState({
    stateId: "",
    name: "",
    description: "",
    location: "",
    category: "",
    famousFor: "",
    image: "",
    imagePublicId: "",
    shortVideos: "",
    bestTime: "",
    travelTips: "",
    rating: "",
    thingsToDo: [],
    nearbyPlaces: [],
  });

  // Fetch states
  const fetchStates = async () => {
    try {
      const response = await getAllStates();

      setStates(response.data || []);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load states");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStates();
  }, []);

  // Input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Main image change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10 MB");
      return;
    }

    setImageFile(file);

    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(URL.createObjectURL(file));
  };

  // Gallery image change
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) {
      return;
    }

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not a valid image`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10 MB`);
        continue;
      }

      validFiles.push(file);
    }

    if (!validFiles.length) {
      return;
    }

    setGalleryFiles((prev) => [...prev, ...validFiles]);

    const newPreviews = validFiles.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setGalleryPreviews((prev) => [...prev, ...newPreviews]);

    // Reset input
    e.target.value = "";
  };

  // Remove gallery image
  const removeGalleryImage = (index) => {
    const preview = galleryPreviews[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));

    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ============================================================
  // THINGS TO DO
  // ============================================================

  // Add activity
  const addThing = () => {
    setFormData((prev) => ({
      ...prev,
      thingsToDo: [
        ...prev.thingsToDo,
        {
          name: "",
          description: "",
          image: "",
          imagePublicId: "",
          galleryImages: "",
          shortVideos: "",
          price: "",
          bestTime: "",
          safetyTips: "",
          rating: "",
        },
      ],
    }));
  };

  // Remove activity
  const removeThing = (index) => {
    setFormData((prev) => ({
      ...prev,
      thingsToDo: prev.thingsToDo.filter((_, i) => i !== index),
    }));
  };

  // Activity change
  const handleThingChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });
  };

  // ============================================================
  // NEARBY PLACES
  // ============================================================

  // Add nearby place
  const addNearbyPlace = () => {
    setFormData((prev) => ({
      ...prev,
      nearbyPlaces: [
        ...prev.nearbyPlaces,
        {
          name: "",
          description: "",
          distance: "",
          location: "",
          famousFor: "",
          image: "",
          galleryImages: "",
          shortVideos: "",
          bestTime: "",
          travelTips: "",
          rating: "",
        },
      ],
    }));
  };

  // Remove nearby place
  const removeNearbyPlace = (index) => {
    setFormData((prev) => ({
      ...prev,
      nearbyPlaces: prev.nearbyPlaces.filter((_, i) => i !== index),
    }));
  };

  // Nearby place change
  const handleNearbyChange = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.nearbyPlaces];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return {
        ...prev,
        nearbyPlaces: updated,
      };
    });
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.stateId) {
      toast.error("Please select a state");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter destination name");
      return;
    }

    if (!formData.description.trim()) {
      toast.error("Please enter destination description");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Please enter destination category");
      return;
    }

    if (!formData.famousFor.trim()) {
      toast.error("Please enter what the destination is famous for");
      return;
    }

    if (!formData.bestTime.trim()) {
      toast.error("Please enter the best time to visit");
      return;
    }

    if (!imageFile) {
      toast.error("Please select a destination image");
      return;
    }

    try {
      setSaving(true);

      // Upload main image
      const mainImageResponse = await uploadImage(imageFile, "destinations");

      // Upload gallery images
      const uploadedGalleryImages = [];

      for (const file of galleryFiles) {
        const galleryResponse = await uploadImage(file, "destinations");

        uploadedGalleryImages.push(galleryResponse.url);
      }

      // ========================================================
      // CREATE DESTINATION DATA
      // ========================================================

      const payload = {
        stateId: formData.stateId,
        name: formData.name.trim(),
        description: formData.description.trim(),
        location: formData.location.trim(),
        category: formData.category.trim(),
        famousFor: formData.famousFor.trim(),

        image: mainImageResponse.url,
        imagePublicId: mainImageResponse.publicId,

        galleryImages: uploadedGalleryImages,

        shortVideos: formData.shortVideos
          ? formData.shortVideos
              .split("\n")
              .map((video) => video.trim())
              .filter(Boolean)
          : [],

        bestTime: formData.bestTime.trim(),
        travelTips: formData.travelTips.trim(),

        rating: formData.rating ? Number(formData.rating) : 0,

        // ======================================================
        // THINGS TO DO
        // ======================================================

        thingsToDo: formData.thingsToDo.map((item) => ({
          name: item.name.trim(),

          description: item.description.trim(),

          image: item.image.trim(),

          imagePublicId: item.imagePublicId.trim(),

          galleryImages: item.galleryImages
            ? item.galleryImages
                .split("\n")
                .map((image) => image.trim())
                .filter(Boolean)
                .map((image) => ({
                  url: image,
                }))
            : [],

          shortVideos: item.shortVideos
            ? item.shortVideos
                .split("\n")
                .map((video) => video.trim())
                .filter(Boolean)
                .map((video) => ({
                  type: video.includes("res.cloudinary.com")
                    ? "cloudinary"
                    : "url",
                  url: video,
                }))
            : [],

          price: item.price.trim(),

          bestTime: item.bestTime.trim(),

          safetyTips: item.safetyTips.trim(),

          rating: item.rating ? Number(item.rating) : 0,
        })),

        // ======================================================
        // NEARBY PLACES
        // Exact schema structure:
        //
        // {
        //   name,
        //   description,
        //   distance,
        //   location,
        //   famousFor,
        //   image,
        //   galleryImages: [String],
        //   shortVideos: [
        //     {
        //       type,
        //       url,
        //       publicId
        //     }
        //   ],
        //   bestTime,
        //   travelTips,
        //   rating
        // }
        // ======================================================

        nearbyPlaces: formData.nearbyPlaces.map((place) => ({
          name: place.name.trim(),

          description: place.description.trim(),

          distance: place.distance.trim(),

          location: place.location.trim(),

          famousFor: place.famousFor.trim(),

          image: place.image.trim(),

          // Schema: galleryImages: [{ type: String }]
          galleryImages: place.galleryImages
            ? place.galleryImages
                .split("\n")
                .map((image) => image.trim())
                .filter(Boolean)
            : [],

          // Schema:
          // shortVideos: [
          //   {
          //     type: "url" | "cloudinary",
          //     url: String,
          //     publicId: String
          //   }
          // ]
          shortVideos: place.shortVideos
            ? place.shortVideos
                .split("\n")
                .map((video) => video.trim())
                .filter(Boolean)
                .map((video) => ({
                  type: video.includes("res.cloudinary.com")
                    ? "cloudinary"
                    : "url",
                  url: video,
                  publicId: "",
                }))
            : [],

          bestTime: place.bestTime.trim(),

          travelTips: place.travelTips.trim(),

          rating: place.rating ? Number(place.rating) : 0,
        })),
      };

      // Save destination
      await createDestination(payload);

      toast.success("Destination Added Successfully");

      navigate("/admin/destinations");
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to add destination");
    } finally {
      setSaving(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

          <p className="mt-4 text-lg font-medium text-slate-800">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* Header */}

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/destinations")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-600"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Add Destination
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Add a new tourist destination to TripPilot AI.
            </p>
          </div>
        </div>
      </div>

      {/* Form */}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <MapPin size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Basic Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add the main information about the destination.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* State */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                State
                <span className="ml-1 text-red-500">*</span>
              </label>

              <select
                name="stateId"
                value={formData.stateId}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select State</option>

                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Destination Name */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Destination Name
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Dudhsagar Waterfalls"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Location */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. South Goa"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Category */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="e.g. Waterfall, Beach, Temple"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Famous For */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Famous For
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                type="text"
                name="famousFor"
                value={formData.famousFor}
                onChange={handleChange}
                placeholder="e.g. Natural beauty"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Best Time */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Best Time
                <span className="ml-1 text-red-500">*</span>
              </label>

              <div className="relative">
                <Clock
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="text"
                  name="bestTime"
                  value={formData.bestTime}
                  onChange={handleChange}
                  placeholder="e.g. October - March"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Rating */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rating
              </label>

              <div className="relative">
                <Star
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                />

                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="0 - 5"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* Description */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description
                <span className="ml-1 text-red-500">*</span>
              </label>

              <textarea
                name="description"
                rows="5"
                value={formData.description}
                onChange={handleChange}
                placeholder="Write a detailed description about this destination..."
                required
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* Main Image */}

            <div className="md:col-span-2">
              <label
                htmlFor="destinationImage"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Destination Image
                <span className="ml-1 text-red-500">*</span>
              </label>

              <input
                id="destinationImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                disabled={saving}
                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 outline-none transition file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-5 file:py-3 file:text-sm file:font-semibold file:text-white hover:border-slate-300 hover:file:bg-blue-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-slate-400">
                JPG, PNG or WEBP. Maximum size 10 MB.
              </p>

              {imagePreview && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-medium text-slate-500">
                    Image Preview
                  </p>

                  <img
                    src={imagePreview}
                    alt="Destination preview"
                    className="h-48 w-80 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Media */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <ImageIcon size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">Media</h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add gallery images and short videos.
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* Gallery Images */}

            <div className="md:col-span-2">
              <label
                htmlFor="galleryImages"
                className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700"
              >
                <ImageIcon size={16} className="text-purple-500" />
                Gallery Images
              </label>

              <input
                id="galleryImages"
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryChange}
                disabled={saving}
                className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 outline-none transition file:mr-4 file:cursor-pointer file:border-0 file:bg-purple-600 file:px-5 file:py-3 file:text-sm file:font-semibold file:text-white hover:border-slate-300 hover:file:bg-purple-700 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
              />

              <p className="mt-2 text-xs text-slate-400">
                Select multiple images. Maximum size 10 MB per image.
              </p>

              {galleryPreviews.length > 0 && (
                <div className="mt-5">
                  <p className="mb-3 text-xs font-medium text-slate-500">
                    Selected Gallery Images ({galleryPreviews.length})
                  </p>

                  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {galleryPreviews.map((preview, index) => (
                      <div
                        key={`${preview.url}-${index}`}
                        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                      >
                        <img
                          src={preview.url}
                          alt={`Gallery ${index + 1}`}
                          className="h-36 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => removeGalleryImage(index)}
                          disabled={saving}
                          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-red-600 disabled:opacity-50"
                        >
                          <Trash2 size={15} />
                        </button>

                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
                          <p className="truncate text-xs text-white">
                            {preview.file.name}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Short Videos */}

            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Video size={16} className="text-pink-500" />
                Short Videos
              </label>

              <textarea
                name="shortVideos"
                rows="7"
                value={formData.shortVideos}
                onChange={handleChange}
                placeholder={"One video URL per line\nhttps://...\nhttps://..."}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-100"
              />

              <p className="mt-2 text-xs text-slate-400">
                Add one video URL on each line.
              </p>
            </div>
          </div>
        </section>

        {/* Travel Information */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Lightbulb size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Travel Information
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Add useful tips for travelers.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Travel Tips
            </label>

            <textarea
              name="travelTips"
              rows="5"
              value={formData.travelTips}
              onChange={handleChange}
              placeholder="Add useful travel tips, safety information, local advice..."
              className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-100"
            />
          </div>
        </section>

        {/* ======================================================
            THINGS TO DO
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Things To Do</h2>

              <p className="mt-1 text-sm text-slate-500">
                Add activities visitors can enjoy.
              </p>
            </div>

            <button
              type="button"
              onClick={addThing}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              <Plus size={17} />
              Add Activity
            </button>
          </div>

          <div className="space-y-5 p-6">
            {formData.thingsToDo.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                <p className="font-medium text-slate-600">
                  No activities added yet.
                </p>
              </div>
            ) : (
              formData.thingsToDo.map((item, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        Activity #{index + 1}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Add complete activity information
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeThing(index)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Name */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Activity Name
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. River Rafting"
                        value={item.name}
                        onChange={(e) =>
                          handleThingChange(index, "name", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Price */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Price
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. ₹500 - ₹1000"
                        value={item.price}
                        onChange={(e) =>
                          handleThingChange(index, "price", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Description */}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Description
                      </label>

                      <textarea
                        placeholder="Describe this activity..."
                        value={item.description}
                        onChange={(e) =>
                          handleThingChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Main Image */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <ImageIcon size={16} className="text-purple-500" />
                        Main Image URL
                      </label>

                      <input
                        type="text"
                        placeholder="https://..."
                        value={item.image}
                        onChange={(e) =>
                          handleThingChange(index, "image", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Image Public ID */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Image Public ID
                      </label>

                      <input
                        type="text"
                        placeholder="Cloudinary public ID"
                        value={item.imagePublicId}
                        onChange={(e) =>
                          handleThingChange(
                            index,
                            "imagePublicId",
                            e.target.value,
                          )
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Gallery Images */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <ImageIcon size={16} className="text-purple-500" />
                        Gallery Images
                      </label>

                      <textarea
                        placeholder={
                          "One image URL per line\nhttps://...\nhttps://..."
                        }
                        value={item.galleryImages}
                        onChange={(e) =>
                          handleThingChange(
                            index,
                            "galleryImages",
                            e.target.value,
                          )
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <p className="mt-1 text-xs text-slate-400">
                        Each URL will be stored as a gallery image object.
                      </p>
                    </div>

                    {/* Short Videos */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Video size={16} className="text-pink-500" />
                        Short Videos
                      </label>

                      <textarea
                        placeholder={
                          "One video URL per line\nhttps://...\nhttps://..."
                        }
                        value={item.shortVideos}
                        onChange={(e) =>
                          handleThingChange(
                            index,
                            "shortVideos",
                            e.target.value,
                          )
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                      />

                      <p className="mt-1 text-xs text-slate-400">
                        Cloudinary videos are automatically detected.
                      </p>
                    </div>

                    {/* Best Time */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Clock size={16} className="text-blue-500" />
                        Best Time
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. October - March"
                        value={item.bestTime}
                        onChange={(e) =>
                          handleThingChange(index, "bestTime", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Rating */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Star size={16} className="text-amber-500" />
                        Rating
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="0 - 5"
                        value={item.rating}
                        onChange={(e) =>
                          handleThingChange(index, "rating", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Safety Tips */}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Safety Tips
                      </label>

                      <textarea
                        placeholder="Add safety instructions and precautions..."
                        value={item.safetyTips}
                        onChange={(e) =>
                          handleThingChange(index, "safetyTips", e.target.value)
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* ======================================================
            NEARBY PLACES
        ====================================================== */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                  <Navigation size={20} />
                </div>

                <div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Nearby Places
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Add attractions and destinations nearby.
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={addNearbyPlace}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700"
            >
              <Plus size={17} />
              Add Nearby Place
            </button>
          </div>

          <div className="space-y-5 p-6">
            {formData.nearbyPlaces.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                <p className="font-medium text-slate-600">
                  No nearby places added yet.
                </p>
              </div>
            ) : (
              formData.nearbyPlaces.map((place, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-5 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800">
                        Nearby Place #{index + 1}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        Add complete nearby place information
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeNearbyPlace(index)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-500 transition hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    {/* Name */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Place Name
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Fatehpur Sikri"
                        value={place.name}
                        onChange={(e) =>
                          handleNearbyChange(index, "name", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Distance */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Distance
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. 40 km"
                        value={place.distance}
                        onChange={(e) =>
                          handleNearbyChange(index, "distance", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Location */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Location
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Agra, Uttar Pradesh"
                        value={place.location}
                        onChange={(e) =>
                          handleNearbyChange(index, "location", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Famous For */}

                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Famous For
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. Mughal architecture"
                        value={place.famousFor}
                        onChange={(e) =>
                          handleNearbyChange(index, "famousFor", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Main Image */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <ImageIcon size={16} className="text-purple-500" />
                        Main Image URL
                      </label>

                      <input
                        type="text"
                        placeholder="https://..."
                        value={place.image}
                        onChange={(e) =>
                          handleNearbyChange(index, "image", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Best Time */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Clock size={16} className="text-blue-500" />
                        Best Time
                      </label>

                      <input
                        type="text"
                        placeholder="e.g. October - March"
                        value={place.bestTime}
                        onChange={(e) =>
                          handleNearbyChange(index, "bestTime", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Rating */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Star size={16} className="text-amber-500" />
                        Rating
                      </label>

                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        placeholder="0 - 5"
                        value={place.rating}
                        onChange={(e) =>
                          handleNearbyChange(index, "rating", e.target.value)
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Description */}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Description
                      </label>

                      <textarea
                        placeholder="Describe this nearby place..."
                        value={place.description}
                        onChange={(e) =>
                          handleNearbyChange(
                            index,
                            "description",
                            e.target.value,
                          )
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>

                    {/* Gallery Images */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <ImageIcon size={16} className="text-purple-500" />
                        Gallery Images
                      </label>

                      <textarea
                        placeholder={
                          "One image URL per line\nhttps://...\nhttps://..."
                        }
                        value={place.galleryImages}
                        onChange={(e) =>
                          handleNearbyChange(
                            index,
                            "galleryImages",
                            e.target.value,
                          )
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />

                      <p className="mt-1 text-xs text-slate-400">
                        Stored as an array of image URLs.
                      </p>
                    </div>

                    {/* Short Videos */}

                    <div>
                      <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                        <Video size={16} className="text-pink-500" />
                        Short Videos
                      </label>

                      <textarea
                        placeholder={
                          "One video URL per line\nhttps://...\nhttps://..."
                        }
                        value={place.shortVideos}
                        onChange={(e) =>
                          handleNearbyChange(
                            index,
                            "shortVideos",
                            e.target.value,
                          )
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-100"
                      />

                      <p className="mt-1 text-xs text-slate-400">
                        Each URL is converted to the required video object
                        format.
                      </p>
                    </div>

                    {/* Travel Tips */}

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-semibold text-slate-700">
                        Travel Tips
                      </label>

                      <textarea
                        placeholder="Add travel tips for this nearby place..."
                        value={place.travelTips}
                        onChange={(e) =>
                          handleNearbyChange(
                            index,
                            "travelTips",
                            e.target.value,
                          )
                        }
                        rows="4"
                        className="w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Buttons */}

        <div className="flex flex-col-reverse justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/admin/destinations")}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Save size={18} />
                Add Destination
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddDestination;
