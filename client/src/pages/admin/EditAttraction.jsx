import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import toast from "react-hot-toast";

import {
  Save,
  MapPin,
  Image,
  Star,
  Clock,
  IndianRupee,
  FileText,
  ArrowLeft,
} from "lucide-react";

import Loader from "../../components/common/Loader";

import {
  getAttractionById,
  updateAttraction,
} from "../../services/attractionService";

function EditAttraction() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    timing: "",
    image: "",
    rating: "",
  });

  // FETCH ATTRACTION
  useEffect(() => {
    fetchAttraction();
  }, [id]);

  const fetchAttraction = async () => {
    try {
      setLoading(true);

      const response = await getAttractionById(id);

      const attraction = response.data;

      setFormData({
        name: attraction.name || "",
        description: attraction.description || "",
        price: attraction.price || "",
        timing: attraction.timing || "",
        image: attraction.image || "",
        rating: attraction.rating ?? "",
      });
    } catch (error) {
      console.log(error);

      toast.error("Failed to load attraction");

      navigate("/admin/attractions");
    } finally {
      setLoading(false);
    }
  };

 
  // INPUT CHANGE
  
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  
  // UPDATE ATTRACTION
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter attraction name");
      return;
    }

    try {
      setSaving(true);

      await updateAttraction(id, {
        ...formData,
        rating: formData.rating === "" ? 0 : Number(formData.rating),
      });

      toast.success("Attraction Updated Successfully");

      navigate("/admin/attractions");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Update Failed");
    } finally {
      setSaving(false);
    }
  };

  
  // LOADING

   if (loading) {
     return (
       <div className="flex min-h-[500px] items-center justify-center">
         <div className="flex flex-col items-center">
           {/* Simple Admin Loader */}
           <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-cyan-500" />

           {/* Loading Text */}
           <p className="mt-4 text-lg font-medium text-slate-800">Loading...</p>
         </div>
       </div>
     );
   }


  // UI
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      
         {/*HEADER*/}
    
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Save size={21} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Edit Attraction
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Update the information of this tourist attraction.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/attractions")}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <ArrowLeft size={17} />
          Back to Attractions
        </button>
      </div>

      
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
      >
        {/* Form Header */}

        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5 sm:px-8">
          <h2 className="text-lg font-bold text-slate-900">
            Attraction Information
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Modify the attraction details and save your changes.
          </p>
        </div>

        {/* Form Body */}

        <div className="space-y-7 p-6 sm:p-8">
         
          <div>
            <div className="mb-4 flex items-center gap-2">
              <FileText size={19} className="text-blue-600" />

              <h3 className="font-bold text-slate-900">Basic Information</h3>
            </div>

            <div className="space-y-5">
              {/* Name */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Attraction Name
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dudhsagar Waterfalls"
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              {/* Description */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the attraction..."
                  rows={5}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>
            </div>
          </div>

          {/* Divider */}

          <div className="border-t border-slate-100" />

       
          <div>
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={19} className="text-blue-600" />

              <h3 className="font-bold text-slate-900">Attraction Details</h3>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              {/* Price */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Price
                </label>

                <div className="relative">
                  <IndianRupee
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="₹2000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>
              </div>

              {/* Timing */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Timing
                </label>

                <div className="relative">
                  <Clock
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="text"
                    name="timing"
                    value={formData.timing}
                    onChange={handleChange}
                    placeholder="10 AM - 5 PM"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-amber-400"
                  />

                  <input
                    type="number"
                    name="rating"
                    value={formData.rating}
                    onChange={handleChange}
                    placeholder="4.8"
                    min="0"
                    max="5"
                    step="0.1"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <p className="mt-1.5 text-xs text-slate-400">
                  Rating should be between 0 and 5.
                </p>
              </div>
            </div>
          </div>

          {/* Divider */}

          <div className="border-t border-slate-100" />

         
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Image size={19} className="text-purple-600" />

              <h3 className="font-bold text-slate-900">Attraction Image</h3>
            </div>

            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Image URL
            </label>

            <input
              type="url"
              name="image"
              value={formData.image}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
            />

            {/* Image Preview */}

            {formData.image && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                <img
                  src={formData.image}
                  alt={formData.name || "Attraction"}
                  className="h-52 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/*
            FOOTER */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-5 sm:flex-row sm:justify-end sm:px-8">
          <button
            type="button"
            onClick={() => navigate("/admin/attractions")}
            disabled={saving}
            className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-w-[180px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader />
            ) : (
              <>
                <Save size={18} />
                Update Attraction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditAttraction;
