import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getStateById, updateState } from "../../services/stateService";
import { uploadImage } from "../../services/uploadService";

function EditState() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    imagePublicId: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [previewImage, setPreviewImage] = useState("");

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Fetch State
  useEffect(() => {
    fetchState();
  }, [id]);

  const fetchState = async () => {
    try {
      const response = await getStateById(id);

      setFormData({
        name: response.data.name || "",
        description: response.data.description || "",
        image: response.data.image || "",
        imagePublicId: response.data.imagePublicId || "",
      });

      setPreviewImage(response.data.image || "");
    } catch (error) {
      console.log(error);

      toast.error("Failed to load state");
    } finally {
      setLoading(false);
    }
  };

  // Input Change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    // Check file size
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setSelectedImage(file);

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setUpdating(true);

      let imageUrl = formData.image;
      let imagePublicId = formData.imagePublicId;

      // Upload new image only if selected
      if (selectedImage) {
        const uploadResponse = await uploadImage(selectedImage, "states");

        imageUrl = uploadResponse.url;
        imagePublicId = uploadResponse.publicId;
      }

      // Update state
      await updateState(id, {
        name: formData.name,
        description: formData.description,
        image: imageUrl,
        imagePublicId: imagePublicId,
      });

      toast.success("State Updated Successfully");

      navigate("/admin/states");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to update state");
    } finally {
      setUpdating(false);
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
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit State</h1>

        <p className="mt-1 text-sm text-slate-500">
          Update the state information and details.
        </p>
      </div>

      {/* Form */}

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm"
      >
        {/* State Name */}

        <div>
          <label
            htmlFor="name"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            State Name
          </label>

          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            placeholder="State name"
            required
          />
        </div>

        {/* Description */}

        <div>
          <label
            htmlFor="description"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            Description
          </label>

          <textarea
            id="description"
            rows="6"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 leading-6 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            placeholder="State description"
            required
          />
        </div>

        {/* Image */}

        <div>
          <label
            htmlFor="image"
            className="mb-2 block text-sm font-semibold text-slate-700"
          >
            State Image
          </label>

          {/* Current / Selected Image */}

          {previewImage && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Image Preview
              </p>

              <img
                src={previewImage}
                alt="State preview"
                className="h-48 w-full max-w-md rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
              />
            </div>
          )}

          {/* File Input */}

          <label
            htmlFor="image"
            className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-blue-400 hover:bg-blue-50"
          >
            Choose New Image
            <input
              id="image"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              disabled={updating}
              className="hidden"
            />
          </label>

          {/* Selected File Name */}

          {selectedImage && (
            <p className="mt-2 text-sm text-slate-500">
              Selected:{" "}
              <span className="font-medium text-slate-700">
                {selectedImage.name}
              </span>
            </p>
          )}

          <p className="mt-2 text-xs text-slate-400">
            JPG, JPEG, PNG or WEBP. Maximum size: 5MB.
          </p>
        </div>

        {/* Buttons */}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
          {/* Update */}

          <button
            type="submit"
            disabled={updating}
            className="flex min-w-[170px] items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {updating ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              "Update State"
            )}
          </button>

          {/* Cancel */}

          <button
            type="button"
            onClick={() => navigate("/admin/states")}
            disabled={updating}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditState;
