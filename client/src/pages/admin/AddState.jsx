import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createState } from "../../services/stateService";
import { uploadImage } from "../../services/uploadService";

import Loader from "../../components/common/Loader";

function AddState() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [loading, setLoading] = useState(false);

  // Input change
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // Image change
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) {
      return;
    }

    // Check image type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image");
      return;
    }

    // Check image size
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10 MB");
      return;
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!imageFile) {
      toast.error("Please select a state image");
      return;
    }

    try {
      setLoading(true);

      // Upload image to states folder
      const uploadResponse = await uploadImage(imageFile, "states");

      const imageUrl = uploadResponse.url;
      const imagePublicId = uploadResponse.publicId;

      // Create state
      await createState({
        ...formData,
        image: imageUrl,
        imagePublicId: imagePublicId,
      });

      toast.success("State Added Successfully");

      setTimeout(() => {
        navigate("/admin/states");
      }, 1200);
    } catch (error) {
      console.error(error);

      toast.error(error.response?.data?.message || "Failed to add state");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Add New State</h1>

        <p className="mt-1 text-sm text-slate-500">
          Add a new Indian state to your database.
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
            name="description"
            rows="5"
            value={formData.description}
            onChange={handleChange}
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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

          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
            className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 outline-none transition file:mr-4 file:cursor-pointer file:border-0 file:bg-blue-600 file:px-5 file:py-3 file:text-sm file:font-semibold file:text-white hover:border-slate-300 hover:file:bg-blue-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
          />

          <p className="mt-2 text-xs text-slate-400">
            JPG, PNG or WEBP. Maximum size 10 MB.
          </p>

          {/* Image Preview */}

          {imagePreview && (
            <div className="mt-5">
              <p className="mb-2 text-xs font-medium text-slate-500">
                Image Preview
              </p>

              <img
                src={imagePreview}
                alt="State preview"
                className="h-44 w-72 rounded-xl object-cover shadow-sm ring-1 ring-slate-200"
              />
            </div>
          )}
        </div>

        {/* Buttons */}

        <div className="flex flex-wrap items-center gap-3 border-t border-slate-200 pt-6">
          {/* Cancel */}

          <button
            type="button"
            onClick={() => navigate("/admin/states")}
            disabled={loading}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          {/* Add State */}

          <button
            type="submit"
            disabled={loading}
            className="flex min-w-[170px] items-center justify-center rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:bg-blue-400"
          >
            {loading ? <Loader /> : "Add State"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddState;
