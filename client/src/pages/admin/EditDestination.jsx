import { useEffect, useState, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import {
  ArrowLeft,
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
  Link,
  Upload,
} from "lucide-react";

import {
  getDestinationById,
  updateDestination,
} from "../../services/destinationService";

import { getAllStates } from "../../services/stateService";

import { uploadImage, uploadVideo } from "../../services/uploadService";

function EditDestination() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [states, setStates] = useState([]);

  // main image
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  // gallery
  const [existingGalleryImages, setExistingGalleryImages] = useState([]);
  const [galleryFiles, setGalleryFiles] = useState([]);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [galleryUrl, setGalleryUrl] = useState("");

  // videos
  const [existingVideos, setExistingVideos] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const [videoUrl, setVideoUrl] = useState("");

  const inputRef = useRef(null);

  // form data
  const [formData, setFormData] = useState({
    stateId: "",
    name: "",
    description: "",
    location: "",
    category: "",
    famousFor: "",
    image: "",
    imagePublicId: "",
    thingsToDo: [],
    nearbyPlaces: [],
    bestTime: "",
    travelTips: "",
    rating: "",
  });

  // load destination
  const fetchData = async () => {
    try {
      const [stateResponse, destinationResponse] = await Promise.all([
        getAllStates(),
        getDestinationById(id),
      ]);

      setStates(stateResponse.data || []);

      const destination = destinationResponse.data;

      setFormData({
        stateId: destination.stateId?._id || "",
        name: destination.name || "",
        description: destination.description || "",
        location: destination.location || "",
        category: destination.category || "",
        famousFor: destination.famousFor || "",
        image: destination.image || "",
        imagePublicId: destination.imagePublicId || "",

        thingsToDo: (destination.thingsToDo || []).map((item) => ({
          name: item.name || "",
          description: item.description || "",

          image: item.image || "",
          imagePublicId: item.imagePublicId || "",
          imageFile: null,
          imagePreview: item.image || "",
          imageUrl: "",

          galleryImages: Array.isArray(item.galleryImages)
            ? item.galleryImages
                .map((image) =>
                  typeof image === "string"
                    ? {
                        url: image,
                        publicId: "",
                      }
                    : {
                        url: image?.url || "",
                        publicId: image?.publicId || "",
                      },
                )
                .filter((image) => image.url)
            : [],

          galleryFiles: [],
          galleryPreviews: [],
          galleryUrl: "",

          shortVideos: Array.isArray(item.shortVideos)
            ? item.shortVideos
                .map((video) =>
                  typeof video === "string"
                    ? {
                        type: "url",
                        url: video,
                        publicId: "",
                      }
                    : {
                        type: video?.type || "url",
                        url: video?.url || "",
                        publicId: video?.publicId || "",
                      },
                )
                .filter((video) => video.url)
            : [],

          shortVideoFiles: [],
          shortVideoPreviews: [],
          videoUrlInput: "",

          price: item.price || "",
          bestTime: item.bestTime || "",
          safetyTips: item.safetyTips || "",
          rating: item.rating ?? 0,
        })),

        nearbyPlaces: (destination.nearbyPlaces || []).map((place) => ({
          name: place.name || "",
          description: place.description || "",
          distance: place.distance || "",
          location: place.location || "",
          famousFor: place.famousFor || "",

          image: place.image || "",
          imagePublicId: place.imagePublicId || "",
          imageFile: null,
          imagePreview: place.image || "",
          imageUrl: "",

          galleryImages: Array.isArray(place.galleryImages)
            ? place.galleryImages
                .map((image) =>
                  typeof image === "string" ? image : image?.url || "",
                )
                .filter(Boolean)
            : [],

          galleryFiles: [],
          galleryPreviews: [],
          galleryUrl: "",

          bestTime: place.bestTime || "",
          travelTips: place.travelTips || "",
          rating: place.rating ?? 0,
        })),

        bestTime: destination.bestTime || "",
        travelTips: destination.travelTips || "",
        rating: destination.rating ?? "",
      });

      setImagePreview(destination.image || "");
      setImageUrl(destination.image || "");

      setExistingGalleryImages(
        Array.isArray(destination.galleryImages)
          ? destination.galleryImages
          : [],
      );

      const videos = Array.isArray(destination.shortVideos)
        ? destination.shortVideos
            .map((video) =>
              typeof video === "string"
                ? {
                    type: "url",
                    url: video,
                    publicId: "",
                  }
                : {
                    type: video?.type || "url",
                    url: video?.url || "",
                    publicId: video?.publicId || "",
                  },
            )
            .filter((video) => video.url)
        : [];

      setExistingVideos(videos);
    } catch (error) {
      console.error("Load error:", error.response?.data || error.message);

      toast.error("Failed to load destination");

      navigate("/admin/destinations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // cleanup previews
  useEffect(() => {
    return () => {
      galleryPreviews.forEach((preview) => {
        if (preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
      });

      videoPreviews.forEach((preview) => {
        if (preview?.url) {
          URL.revokeObjectURL(preview.url);
        }
      });

      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, []);

  // normal input
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // main image file
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10 MB");
      e.target.value = "";
      return;
    }

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const preview = URL.createObjectURL(file);

    setImageFile(file);
    setImagePreview(preview);
    setImageUrl("");

    e.target.value = "";
  };

  // main image URL
  const handleImageUrl = (value) => {
    setImageUrl(value);
    setImageFile(null);

    if (value.trim()) {
      setImagePreview(value.trim());
    }
  };

  // add gallery URL
  const addGalleryUrl = () => {
    const url = galleryUrl.trim();

    if (!url) {
      toast.error("Please enter image URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid image URL");
      return;
    }

    setExistingGalleryImages((prev) => [
      ...prev,
      {
        url,
        publicId: "",
      },
    ]);

    setGalleryUrl("");

    toast.success("Gallery image URL added");
  };

  // gallery files
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image`);
        continue;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 10 MB`);
        continue;
      }

      validFiles.push(file);
    }

    setGalleryFiles((prev) => [...prev, ...validFiles]);

    setGalleryPreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    ]);

    e.target.value = "";
  };

  // remove gallery file
  const removeGalleryFile = (index) => {
    const preview = galleryPreviews[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setGalleryFiles((prev) => prev.filter((_, i) => i !== index));

    setGalleryPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // remove gallery URL
  const removeExistingGalleryImage = (index) => {
    setExistingGalleryImages((prev) => prev.filter((_, i) => i !== index));
  };

  // add destination video URL
  const addVideoUrl = () => {
    const url = videoUrl.trim();

    if (!url) {
      toast.error("Please enter video URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid video URL");
      return;
    }

    setExistingVideos((prev) => [
      ...prev,
      {
        type: "url",
        url,
        publicId: "",
      },
    ]);

    setVideoUrl("");

    toast.success("Video URL added");
  };

  // video files
  const handleVideoChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = [];

    for (const file of files) {
      if (!file.type.startsWith("video/")) {
        toast.error(`${file.name} is not a video`);
        continue;
      }

      if (file.size > 50 * 1024 * 1024) {
        toast.error(`${file.name} is larger than 50 MB`);
        continue;
      }

      validFiles.push(file);
    }

    setVideoFiles((prev) => [...prev, ...validFiles]);

    setVideoPreviews((prev) => [
      ...prev,
      ...validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      })),
    ]);

    e.target.value = "";
  };

  // remove video file
  const removeVideoFile = (index) => {
    const preview = videoPreviews[index];

    if (preview?.url) {
      URL.revokeObjectURL(preview.url);
    }

    setVideoFiles((prev) => prev.filter((_, i) => i !== index));

    setVideoPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // remove existing video
  const removeExistingVideo = (index) => {
    setExistingVideos((prev) => prev.filter((_, i) => i !== index));
  };

  // add activity
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
          imageFile: null,
          imagePreview: "",
          imageUrl: "",

          galleryImages: [],
          galleryFiles: [],
          galleryPreviews: [],
          galleryUrl: "",

          shortVideos: [],
          shortVideoFiles: [],
          shortVideoPreviews: [],
          videoUrlInput: "",

          price: "",
          bestTime: "",
          safetyTips: "",
          rating: 0,
        },
      ],
    }));
  };

  // remove activity
  const removeThing = (index) => {
    setFormData((prev) => ({
      ...prev,

      thingsToDo: prev.thingsToDo.filter((_, i) => i !== index),
    }));
  };

  // activity input
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

  // activity image file
  const handleThingImageChange = (index, e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10 MB");
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);

    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[index] = {
        ...updated[index],
        imageFile: file,
        imagePreview: preview,
        imageUrl: "",
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });

    e.target.value = "";
  };

  // activity image URL
  const handleThingImageUrl = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[index] = {
        ...updated[index],
        imageUrl: value,
        imageFile: null,
        imagePreview: value,
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });
  };

  // activity gallery URL
  const addThingGalleryUrl = (index) => {
    const item = formData.thingsToDo[index];
    const url = item.galleryUrl?.trim();

    if (!url) {
      toast.error("Please enter image URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid image URL");
      return;
    }

    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[index] = {
        ...updated[index],

        galleryImages: [
          ...(updated[index].galleryImages || []),
          {
            url,
            publicId: "",
          },
        ],

        galleryUrl: "",
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });

    toast.success("Gallery image URL added");
  };

  // activity gallery files
  const handleThingGalleryChange = (index, e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[index] = {
        ...updated[index],

        galleryFiles: [...(updated[index].galleryFiles || []), ...validFiles],

        galleryPreviews: [
          ...(updated[index].galleryPreviews || []),
          ...validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
          })),
        ],
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });

    e.target.value = "";
  };

  // remove activity gallery URL
  const removeThingGallery = (thingIndex, imageIndex) => {
    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[thingIndex] = {
        ...updated[thingIndex],

        galleryImages: (updated[thingIndex].galleryImages || []).filter(
          (_, i) => i !== imageIndex,
        ),
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });
  };

  // remove activity gallery file
  const removeThingGalleryFile = (thingIndex, fileIndex) => {
    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      const item = updated[thingIndex];

      const preview = item.galleryPreviews?.[fileIndex];

      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }

      updated[thingIndex] = {
        ...item,

        galleryFiles: (item.galleryFiles || []).filter(
          (_, i) => i !== fileIndex,
        ),

        galleryPreviews: (item.galleryPreviews || []).filter(
          (_, i) => i !== fileIndex,
        ),
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });
  };

  // activity video URL
  const addThingVideoUrl = (index) => {
    const item = formData.thingsToDo[index];
    const url = item.videoUrlInput?.trim();

    if (!url) {
      toast.error("Please enter video URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid video URL");
      return;
    }

    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[index] = {
        ...updated[index],

        shortVideos: [
          ...(updated[index].shortVideos || []),
          {
            type: "url",
            url,
            publicId: "",
          },
        ],

        videoUrlInput: "",
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });

    toast.success("Video URL added");
  };

  // activity video file
  const handleThingVideoChange = (index, e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("video/"));

    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[index] = {
        ...updated[index],

        shortVideoFiles: [
          ...(updated[index].shortVideoFiles || []),
          ...validFiles,
        ],

        shortVideoPreviews: [
          ...(updated[index].shortVideoPreviews || []),
          ...validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
          })),
        ],
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });

    e.target.value = "";
  };

  // remove activity video
  const removeThingVideo = (thingIndex, videoIndex) => {
    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      updated[thingIndex] = {
        ...updated[thingIndex],

        shortVideos: (updated[thingIndex].shortVideos || []).filter(
          (_, i) => i !== videoIndex,
        ),
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });
  };

  // remove activity video file
  const removeThingVideoFile = (thingIndex, fileIndex) => {
    setFormData((prev) => {
      const updated = [...prev.thingsToDo];

      const item = updated[thingIndex];

      const preview = item.shortVideoPreviews?.[fileIndex];

      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }

      updated[thingIndex] = {
        ...item,

        shortVideoFiles: (item.shortVideoFiles || []).filter(
          (_, i) => i !== fileIndex,
        ),

        shortVideoPreviews: (item.shortVideoPreviews || []).filter(
          (_, i) => i !== fileIndex,
        ),
      };

      return {
        ...prev,
        thingsToDo: updated,
      };
    });
  };

  // nearby place
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
          imagePublicId: "",
          imageFile: null,
          imagePreview: "",
          imageUrl: "",

          galleryImages: [],
          galleryFiles: [],
          galleryPreviews: [],
          galleryUrl: "",

          bestTime: "",
          travelTips: "",
          rating: 0,
        },
      ],
    }));
  };

  // remove nearby place
  const removeNearbyPlace = (index) => {
    setFormData((prev) => ({
      ...prev,

      nearbyPlaces: prev.nearbyPlaces.filter((_, i) => i !== index),
    }));
  };

  // nearby input
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

  // nearby image file
  const handleNearbyImageChange = (index, e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be less than 10 MB");
      e.target.value = "";
      return;
    }

    const preview = URL.createObjectURL(file);

    setFormData((prev) => {
      const updated = [...prev.nearbyPlaces];

      updated[index] = {
        ...updated[index],
        imageFile: file,
        imagePreview: preview,
        imageUrl: "",
      };

      return {
        ...prev,
        nearbyPlaces: updated,
      };
    });

    e.target.value = "";
  };

  // nearby image URL
  const handleNearbyImageUrl = (index, value) => {
    setFormData((prev) => {
      const updated = [...prev.nearbyPlaces];

      updated[index] = {
        ...updated[index],
        imageUrl: value,
        imageFile: null,
        imagePreview: value,
      };

      return {
        ...prev,
        nearbyPlaces: updated,
      };
    });
  };

  // nearby gallery URL
  const addNearbyGalleryUrl = (index) => {
    const place = formData.nearbyPlaces[index];
    const url = place.galleryUrl?.trim();

    if (!url) {
      toast.error("Please enter image URL");
      return;
    }

    try {
      new URL(url);
    } catch {
      toast.error("Please enter a valid image URL");
      return;
    }

    setFormData((prev) => {
      const updated = [...prev.nearbyPlaces];

      updated[index] = {
        ...updated[index],

        galleryImages: [...(updated[index].galleryImages || []), url],

        galleryUrl: "",
      };

      return {
        ...prev,
        nearbyPlaces: updated,
      };
    });

    toast.success("Gallery image URL added");
  };

  // nearby gallery files
  const handleNearbyGalleryChange = (index, e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const validFiles = files.filter((file) => file.type.startsWith("image/"));

    setFormData((prev) => {
      const updated = [...prev.nearbyPlaces];

      updated[index] = {
        ...updated[index],

        galleryFiles: [...(updated[index].galleryFiles || []), ...validFiles],

        galleryPreviews: [
          ...(updated[index].galleryPreviews || []),
          ...validFiles.map((file) => ({
            file,
            url: URL.createObjectURL(file),
          })),
        ],
      };

      return {
        ...prev,
        nearbyPlaces: updated,
      };
    });

    e.target.value = "";
  };

  // remove nearby gallery URL
  const removeNearbyGallery = (placeIndex, imageIndex) => {
    setFormData((prev) => {
      const updated = [...prev.nearbyPlaces];

      updated[placeIndex] = {
        ...updated[placeIndex],

        galleryImages: (updated[placeIndex].galleryImages || []).filter(
          (_, i) => i !== imageIndex,
        ),
      };

      return {
        ...prev,
        nearbyPlaces: updated,
      };
    });
  };

  // remove nearby gallery file
  const removeNearbyGalleryFile = (placeIndex, fileIndex) => {
    setFormData((prev) => {
      const updated = [...prev.nearbyPlaces];

      const place = updated[placeIndex];

      const preview = place.galleryPreviews?.[fileIndex];

      if (preview?.url) {
        URL.revokeObjectURL(preview.url);
      }

      updated[placeIndex] = {
        ...place,

        galleryFiles: (place.galleryFiles || []).filter(
          (_, i) => i !== fileIndex,
        ),

        galleryPreviews: (place.galleryPreviews || []).filter(
          (_, i) => i !== fileIndex,
        ),
      };

      return {
        ...prev,
        nearbyPlaces: updated,
      };
    });
  };

  // save destination
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
      toast.error("Please enter description");
      return;
    }

    if (!formData.category.trim()) {
      toast.error("Please enter category");
      return;
    }

    if (!formData.famousFor.trim()) {
      toast.error("Please enter famous for");
      return;
    }

    if (!formData.bestTime.trim()) {
      toast.error("Please enter best time");
      return;
    }

    try {
      setSaving(true);

      // destination main image
      let finalImage = formData.image;
      let finalImagePublicId = formData.imagePublicId || "";

      if (imageFile) {
        const response = await uploadImage(imageFile, "destinations");

        finalImage = response.url;
        finalImagePublicId = response.publicId || "";
      } else if (imageUrl.trim()) {
        finalImage = imageUrl.trim();
        finalImagePublicId = "";
      }

      if (!finalImage) {
        toast.error("Please add destination image");
        setSaving(false);
        return;
      }

      // destination gallery
      const finalGallery = existingGalleryImages
        .map((image) =>
          typeof image === "string"
            ? {
                url: image,
                publicId: "",
              }
            : {
                url: image?.url || "",
                publicId: image?.publicId || "",
              },
        )
        .filter((image) => image.url);

      for (const file of galleryFiles) {
        const response = await uploadImage(file, "destinationGallery");

        if (response.url) {
          finalGallery.push({
            url: response.url,
            publicId: response.publicId || "",
          });
        }
      }

      // destination videos
      const finalVideos = [...existingVideos];

      for (const file of videoFiles) {
        const response = await uploadVideo(file, "destinationVideos");

        if (response.url) {
          finalVideos.push({
            type: "cloudinary",
            url: response.url,
            publicId: response.publicId || "",
          });
        }
      }

      // things to do
      const finalThings = [];

      for (let i = 0; i < formData.thingsToDo.length; i++) {
        const item = formData.thingsToDo[i];

        let activityImage = item.image || "";

        let activityPublicId = item.imagePublicId || "";

        if (item.imageFile) {
          const response = await uploadImage(item.imageFile, "thingsToDo");

          activityImage = response.url;

          activityPublicId = response.publicId || "";
        } else if (item.imageUrl?.trim()) {
          activityImage = item.imageUrl.trim();

          activityPublicId = "";
        }

        // activity gallery
        const activityGallery = (item.galleryImages || [])
          .map((image) =>
            typeof image === "string"
              ? {
                  url: image,
                  publicId: "",
                }
              : {
                  url: image?.url || "",
                  publicId: image?.publicId || "",
                },
          )
          .filter((image) => image.url);

        for (const file of item.galleryFiles || []) {
          const response = await uploadImage(file, "thingsToDoGallery");

          if (response.url) {
            activityGallery.push({
              url: response.url,
              publicId: response.publicId || "",
            });
          }
        }

        // activity videos
        const activityVideos = (item.shortVideos || [])
          .map((video) =>
            typeof video === "string"
              ? {
                  type: "url",
                  url: video,
                  publicId: "",
                }
              : {
                  type: video?.type || "url",
                  url: video?.url || "",
                  publicId: video?.publicId || "",
                },
          )
          .filter((video) => video.url);

        for (const file of item.shortVideoFiles || []) {
          const response = await uploadVideo(file, "thingsToDoVideos");

          if (response.url) {
            activityVideos.push({
              type: "cloudinary",
              url: response.url,
              publicId: response.publicId || "",
            });
          }
        }

        finalThings.push({
          name: item.name?.trim() || "",

          description: item.description?.trim() || "",

          image: activityImage,

          imagePublicId: activityPublicId,

          galleryImages: activityGallery,

          shortVideos: activityVideos,

          price: item.price?.trim() || "",

          bestTime: item.bestTime?.trim() || "",

          safetyTips: item.safetyTips?.trim() || "",

          rating: item.rating ? Number(item.rating) : 0,
        });
      }

      // nearby places
      const finalNearby = [];

      for (let i = 0; i < formData.nearbyPlaces.length; i++) {
        const place = formData.nearbyPlaces[i];

        let nearbyImage = place.image || "";

        let nearbyPublicId = place.imagePublicId || "";

        if (place.imageFile) {
          const response = await uploadImage(place.imageFile, "nearbyPlaces");

          nearbyImage = response.url;

          nearbyPublicId = response.publicId || "";
        } else if (place.imageUrl?.trim()) {
          nearbyImage = place.imageUrl.trim();

          nearbyPublicId = "";
        }

        // nearby gallery
        const nearbyGallery = (place.galleryImages || [])
          .map((image) =>
            typeof image === "string" ? image : image?.url || "",
          )
          .filter(Boolean);

        for (const file of place.galleryFiles || []) {
          const response = await uploadImage(file, "nearbyPlacesGallery");

          if (response.url) {
            nearbyGallery.push(response.url);
          }
        }

        finalNearby.push({
          name: place.name?.trim() || "",

          description: place.description?.trim() || "",

          distance: place.distance?.trim() || "",

          location: place.location?.trim() || "",

          famousFor: place.famousFor?.trim() || "",

          image: nearbyImage,

          imagePublicId: nearbyPublicId,

          galleryImages: nearbyGallery,

          bestTime: place.bestTime?.trim() || "",

          travelTips: place.travelTips?.trim() || "",

          rating: place.rating ? Number(place.rating) : 0,
        });
      }

      // final payload
      const payload = {
        stateId: formData.stateId,

        name: formData.name.trim(),

        description: formData.description.trim(),

        location: formData.location.trim(),

        category: formData.category.trim(),

        famousFor: formData.famousFor.trim(),

        image: finalImage,

        imagePublicId: finalImagePublicId,

        galleryImages: finalGallery,

        shortVideos: finalVideos,

        thingsToDo: finalThings,

        nearbyPlaces: finalNearby,

        bestTime: formData.bestTime.trim(),

        travelTips: formData.travelTips.trim(),

        rating: formData.rating ? Number(formData.rating) : 0,
      };

      await updateDestination(id, payload);

      toast.success("Destination updated successfully");

      navigate("/admin/destinations");
    } catch (error) {
      console.error("Update error:", error.response?.data || error.message);

      toast.error(
        error.response?.data?.message || "Failed to update destination",
      );
    } finally {
      setSaving(false);
    }
  };

  // loading
  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

          <p className="mt-4 font-medium text-slate-700">
            Loading destination...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {/* header */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/admin/destinations")}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
          >
            <ArrowLeft size={18} />
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Edit Destination
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Update destination information, images and videos.
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* basic information */}

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

                <p className="text-sm text-slate-500">
                  Main destination details
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-6 md:grid-cols-2">
            {/* state */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                State *
              </label>

              <select
                name="stateId"
                value={formData.stateId}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">Select State</option>

                {states.map((state) => (
                  <option key={state._id} value={state._id}>
                    {state.name}
                  </option>
                ))}
              </select>
            </div>

            {/* name */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Destination Name *
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* location */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Location
              </label>

              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* category */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Category *
              </label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* famous for */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Famous For *
              </label>

              <input
                type="text"
                name="famousFor"
                value={formData.famousFor}
                onChange={handleChange}
                disabled={saving}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* best time */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Best Time *
              </label>

              <input
                type="text"
                name="bestTime"
                value={formData.bestTime}
                onChange={handleChange}
                disabled={saving}
                placeholder="October - March"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            {/* rating */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Rating
              </label>

              <div className="relative">
                <Star
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-500"
                />

                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  disabled={saving}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>

            {/* description */}

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Description *
              </label>

              <textarea
                rows="5"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </section>

        {/* destination media */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <ImageIcon size={20} />
              </div>

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Destination Media
                </h2>

                <p className="text-sm text-slate-500">
                  Upload from computer or use external URLs
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8 p-6">
            {/* main image */}

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Main Destination Image
              </label>

              {imagePreview && (
                <div className="mb-4 overflow-hidden rounded-xl border border-slate-200">
                  <img
                    src={imagePreview}
                    alt="Destination"
                    className="h-56 w-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              )}

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Upload size={17} className="text-blue-600" />

                    <p className="font-semibold text-blue-900">
                      Upload from Computer
                    </p>
                  </div>

                  <input
                    id="destinationImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={saving}
                    className="block w-full cursor-pointer rounded-lg bg-white text-sm text-slate-600 file:mr-3 file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-white"
                  />

                  <p className="mt-2 text-xs text-slate-500">Maximum 10 MB</p>
                </div>

                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Link size={17} className="text-purple-600" />

                    <p className="font-semibold text-purple-900">
                      Use Image URL
                    </p>
                  </div>

                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => handleImageUrl(e.target.value)}
                    disabled={saving}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Direct public image URL
                  </p>
                </div>
              </div>
            </div>

            {/* gallery */}

            <div>
              <label className="mb-3 block text-sm font-semibold text-slate-700">
                Gallery Images
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Upload size={17} className="text-blue-600" />

                    <p className="font-semibold text-blue-900">Upload Images</p>
                  </div>

                  <input
                    id="galleryImages"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryChange}
                    disabled={saving}
                    className="block w-full cursor-pointer rounded-lg bg-white text-sm file:mr-3 file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-white"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Multiple images allowed. Maximum 10 MB each.
                  </p>
                </div>

                <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Link size={17} className="text-purple-600" />

                    <p className="font-semibold text-purple-900">
                      Add Image URL
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={galleryUrl}
                      onChange={(e) => setGalleryUrl(e.target.value)}
                      placeholder="https://example.com/image.jpg"
                      disabled={saving}
                      className="min-w-0 flex-1 rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={addGalleryUrl}
                      disabled={saving || !galleryUrl.trim()}
                      className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {existingGalleryImages.map((image, index) => {
                  const url =
                    typeof image === "string" ? image : image?.url || "";

                  return (
                    <div
                      key={`${url}-${index}`}
                      className="relative overflow-hidden rounded-xl border border-slate-200"
                    >
                      <img
                        src={url}
                        alt={`Gallery ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => removeExistingGalleryImage(index)}
                        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  );
                })}

                {galleryPreviews.map((preview, index) => (
                  <div
                    key={preview.url}
                    className="relative overflow-hidden rounded-xl border border-green-300"
                  >
                    <img
                      src={preview.url}
                      alt="New gallery"
                      className="h-32 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => removeGalleryFile(index)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white hover:bg-red-600"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* videos */}

            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Video size={17} className="text-pink-500" />
                Destination Videos
              </label>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Upload size={17} className="text-blue-600" />

                    <p className="font-semibold text-blue-900">Upload Video</p>
                  </div>

                  <input
                    id="destinationVideos"
                    type="file"
                    accept="video/*"
                    multiple
                    onChange={handleVideoChange}
                    disabled={saving}
                    className="block w-full cursor-pointer rounded-lg bg-white text-sm file:mr-3 file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:text-white"
                  />

                  <p className="mt-2 text-xs text-slate-500">
                    Maximum 50 MB each.
                  </p>
                </div>

                <div className="rounded-xl border border-pink-200 bg-pink-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <Link size={17} className="text-pink-600" />

                    <p className="font-semibold text-pink-900">Add Video URL</p>
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      disabled={saving}
                      placeholder="https://youtube.com/..."
                      className="min-w-0 flex-1 rounded-lg border border-pink-200 bg-white px-3 py-2.5 text-sm outline-none"
                    />

                    <button
                      type="button"
                      onClick={addVideoUrl}
                      disabled={saving || !videoUrl.trim()}
                      className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {existingVideos.map((video, index) => (
                  <div
                    key={`${video.url}-${index}`}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <Video size={20} className="shrink-0 text-pink-500" />

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-slate-500">
                          {video.type === "cloudinary"
                            ? "Uploaded Video"
                            : "Video URL"}
                        </p>

                        <p className="truncate text-sm text-slate-700">
                          {video.url}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeExistingVideo(index)}
                      className="shrink-0 rounded-lg p-2 text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={17} />
                    </button>
                  </div>
                ))}

                {videoPreviews.map((preview, index) => (
                  <div
                    key={preview.url}
                    className="rounded-xl border border-blue-200 bg-white p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="truncate text-sm font-medium text-slate-700">
                        {preview.file.name}
                      </p>

                      <button
                        type="button"
                        onClick={() => removeVideoFile(index)}
                        className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 size={17} />
                      </button>
                    </div>

                    <video
                      src={preview.url}
                      controls
                      className="mt-3 h-48 w-full rounded-lg bg-black object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* travel information */}

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <Lightbulb size={20} className="text-amber-500" />

            <h2 className="text-xl font-bold text-slate-900">
              Travel Information
            </h2>
          </div>

          <textarea
            rows="5"
            name="travelTips"
            value={formData.travelTips}
            onChange={handleChange}
            disabled={saving}
            placeholder="Travel tips..."
            className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-100"
          />
        </section>

        {/* things to do */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Things To Do</h2>

              <p className="text-sm text-slate-500">
                Add activities with images and videos.
              </p>
            </div>

            <button
              type="button"
              onClick={addThing}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              <Plus size={17} />
              Add Activity
            </button>
          </div>

          <div className="space-y-6 p-6">
            {formData.thingsToDo.map((item, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    Activity #{index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeThing(index)}
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* activity name */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Activity Name
                    </label>

                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) =>
                        handleThingChange(index, "name", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* price */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Price
                    </label>

                    <input
                      type="text"
                      value={item.price}
                      onChange={(e) =>
                        handleThingChange(index, "price", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* description */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      rows="4"
                      value={item.description}
                      onChange={(e) =>
                        handleThingChange(index, "description", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* activity image */}

                  <div>
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Activity Image
                    </label>

                    {item.imagePreview && (
                      <img
                        src={item.imagePreview}
                        alt="Activity"
                        className="mb-3 h-40 w-full rounded-xl object-cover"
                      />
                    )}

                    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
                      <input
                        id={`thing-image-${index}`}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleThingImageChange(index, e)}
                        className="block w-full text-sm"
                      />

                      <div className="flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs text-slate-400">OR</span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <input
                        type="url"
                        value={item.imageUrl || ""}
                        onChange={(e) =>
                          handleThingImageUrl(index, e.target.value)
                        }
                        placeholder="Paste image URL"
                        className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-purple-500"
                      />
                    </div>
                  </div>

                  {/* activity gallery */}

                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Activity Gallery
                    </label>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleThingGalleryChange(index, e)}
                        className="block w-full text-sm"
                      />

                      <div className="my-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs text-slate-400">
                          OR ADD URL
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={item.galleryUrl || ""}
                          onChange={(e) =>
                            handleThingChange(
                              index,
                              "galleryUrl",
                              e.target.value,
                            )
                          }
                          placeholder="Paste image URL"
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => addThingGalleryUrl(index)}
                          className="rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {item.galleryImages?.map((image, imageIndex) => {
                        const url =
                          typeof image === "string" ? image : image?.url || "";

                        return (
                          <div
                            key={`${url}-${imageIndex}`}
                            className="relative"
                          >
                            <img
                              src={url}
                              alt="Gallery"
                              className="h-28 w-full rounded-lg object-cover"
                            />

                            <button
                              type="button"
                              onClick={() =>
                                removeThingGallery(index, imageIndex)
                              }
                              className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        );
                      })}

                      {item.galleryPreviews?.map((preview, previewIndex) => (
                        <div key={preview.url} className="relative">
                          <img
                            src={preview.url}
                            alt="New"
                            className="h-28 w-full rounded-lg object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeThingGalleryFile(index, previewIndex)
                            }
                            className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* activity videos */}

                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Activity Videos
                    </label>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <input
                        type="file"
                        accept="video/*"
                        multiple
                        onChange={(e) => handleThingVideoChange(index, e)}
                        className="block w-full text-sm"
                      />

                      <div className="my-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs text-slate-400">
                          OR ADD URL
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={item.videoUrlInput || ""}
                          onChange={(e) =>
                            handleThingChange(
                              index,
                              "videoUrlInput",
                              e.target.value,
                            )
                          }
                          placeholder="https://youtube.com/..."
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => addThingVideoUrl(index)}
                          className="rounded-lg bg-pink-600 px-4 text-sm font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {item.shortVideos?.map((video, videoIndex) => (
                        <div
                          key={`${video.url}-${videoIndex}`}
                          className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <Video size={18} className="text-pink-500" />

                            <p className="truncate text-sm text-slate-600">
                              {video.url}
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeThingVideo(index, videoIndex)}
                            className="text-red-500"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}

                      {item.shortVideoPreviews?.map((preview, previewIndex) => (
                        <div
                          key={preview.url}
                          className="rounded-xl border border-blue-200 bg-white p-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="truncate text-sm font-medium">
                              {preview.file.name}
                            </p>

                            <button
                              type="button"
                              onClick={() =>
                                removeThingVideoFile(index, previewIndex)
                              }
                              className="text-red-500"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <video
                            src={preview.url}
                            controls
                            className="mt-3 h-44 w-full rounded-lg bg-black"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* best time */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Best Time
                    </label>

                    <input
                      type="text"
                      value={item.bestTime}
                      onChange={(e) =>
                        handleThingChange(index, "bestTime", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* safety */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Safety Tips
                    </label>

                    <textarea
                      rows="3"
                      value={item.safetyTips}
                      onChange={(e) =>
                        handleThingChange(index, "safetyTips", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* rating */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Rating
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={item.rating}
                      onChange={(e) =>
                        handleThingChange(index, "rating", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* nearby places */}

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Navigation size={20} className="text-green-600" />

              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Nearby Places
                </h2>

                <p className="text-sm text-slate-500">
                  Nearby places with image upload or URL.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={addNearbyPlace}
              className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
            >
              <Plus size={17} />
              Add Nearby Place
            </button>
          </div>

          <div className="space-y-6 p-6">
            {formData.nearbyPlaces.map((place, index) => (
              <div
                key={index}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
              >
                <div className="mb-5 flex items-center justify-between">
                  <h3 className="text-lg font-bold text-slate-800">
                    Nearby Place #{index + 1}
                  </h3>

                  <button
                    type="button"
                    onClick={() => removeNearbyPlace(index)}
                    className="text-red-500"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  {/* name */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Name
                    </label>

                    <input
                      type="text"
                      value={place.name}
                      onChange={(e) =>
                        handleNearbyChange(index, "name", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* distance */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Distance
                    </label>

                    <input
                      type="text"
                      value={place.distance}
                      onChange={(e) =>
                        handleNearbyChange(index, "distance", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* location */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Location
                    </label>

                    <input
                      type="text"
                      value={place.location}
                      onChange={(e) =>
                        handleNearbyChange(index, "location", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* famous for */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Famous For
                    </label>

                    <input
                      type="text"
                      value={place.famousFor}
                      onChange={(e) =>
                        handleNearbyChange(index, "famousFor", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* description */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Description
                    </label>

                    <textarea
                      rows="4"
                      value={place.description}
                      onChange={(e) =>
                        handleNearbyChange(index, "description", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* nearby main image */}

                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Main Image
                    </label>

                    {place.imagePreview && (
                      <img
                        src={place.imagePreview}
                        alt={place.name}
                        className="mb-4 h-52 w-full rounded-xl object-cover"
                      />
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
                        <p className="mb-3 font-semibold text-blue-900">
                          Upload from Computer
                        </p>

                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleNearbyImageChange(index, e)}
                          className="w-full text-sm"
                        />
                      </div>

                      <div className="rounded-xl border border-purple-200 bg-purple-50 p-4">
                        <p className="mb-3 font-semibold text-purple-900">
                          Use Image URL
                        </p>

                        <input
                          type="url"
                          value={place.imageUrl || ""}
                          onChange={(e) =>
                            handleNearbyImageUrl(index, e.target.value)
                          }
                          placeholder="https://example.com/image.jpg"
                          className="w-full rounded-lg border border-purple-200 bg-white px-3 py-2.5 text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* nearby gallery */}

                  <div className="md:col-span-2">
                    <label className="mb-3 block text-sm font-semibold text-slate-700">
                      Gallery Images
                    </label>

                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={(e) => handleNearbyGalleryChange(index, e)}
                        className="w-full text-sm"
                      />

                      <div className="my-3 flex items-center gap-2">
                        <div className="h-px flex-1 bg-slate-200" />
                        <span className="text-xs text-slate-400">
                          OR ADD URL
                        </span>
                        <div className="h-px flex-1 bg-slate-200" />
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={place.galleryUrl || ""}
                          onChange={(e) =>
                            handleNearbyChange(
                              index,
                              "galleryUrl",
                              e.target.value,
                            )
                          }
                          placeholder="Paste image URL"
                          className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
                        />

                        <button
                          type="button"
                          onClick={() => addNearbyGalleryUrl(index)}
                          className="rounded-lg bg-purple-600 px-4 text-sm font-semibold text-white"
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {place.galleryImages?.map((image, imageIndex) => (
                        <div
                          key={`${image}-${imageIndex}`}
                          className="relative"
                        >
                          <img
                            src={
                              typeof image === "string"
                                ? image
                                : image?.url || ""
                            }
                            alt="Nearby"
                            className="h-28 w-full rounded-lg object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeNearbyGallery(index, imageIndex)
                            }
                            className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}

                      {place.galleryPreviews?.map((preview, previewIndex) => (
                        <div key={preview.url} className="relative">
                          <img
                            src={preview.url}
                            alt="New"
                            className="h-28 w-full rounded-lg object-cover"
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removeNearbyGalleryFile(index, previewIndex)
                            }
                            className="absolute right-1 top-1 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-600"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* best time */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Best Time
                    </label>

                    <input
                      type="text"
                      value={place.bestTime}
                      onChange={(e) =>
                        handleNearbyChange(index, "bestTime", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* rating */}

                  <div>
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Rating
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={place.rating}
                      onChange={(e) =>
                        handleNearbyChange(index, "rating", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>

                  {/* travel tips */}

                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-semibold text-slate-700">
                      Travel Tips
                    </label>

                    <textarea
                      rows="3"
                      value={place.travelTips || ""}
                      onChange={(e) =>
                        handleNearbyChange(index, "travelTips", e.target.value)
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* buttons */}

        <div className="flex flex-col-reverse justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row">
          <button
            type="button"
            onClick={() => navigate("/admin/destinations")}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            <X size={17} />
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[210px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Updating...
              </>
            ) : (
              <>
                <Save size={18} />
                Update Destination
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditDestination;
