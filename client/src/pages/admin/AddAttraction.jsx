import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import toast from "react-hot-toast";

import {
  Plus,
  Map,
  MapPin,
  Image,
  Star,
  Clock,
  IndianRupee,
  FileText,
  ArrowLeft,
} from "lucide-react";

import { getAllStates } from "../../services/stateService";
import { getDestinationsByState } from "../../services/destinationService";
import { createAttraction } from "../../services/attractionService";

import Loader from "../../components/common/Loader";

function AddAttraction() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [destinations, setDestinations] = useState([]);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    stateId: "",
    destinationId: "",
    name: "",
    description: "",
    price: "",
    timing: "",
    image: "",
    rating: "",
  });


  useEffect(() => {
    fetchStates();
  }, []);

  const fetchStates = async () => {
    try {
      setLoading(true);

      const response = await getAllStates();

      setStates(response.data);
    } catch (error) {
      console.log(error);

      toast.error("Failed to load states");
    } finally {
      setLoading(false);
    }
  };

  
  // STATE CHANGE
 
  const handleStateChange = async (e) => {
    const stateId = e.target.value;

    setFormData((prev) => ({
      ...prev,
      stateId,
      destinationId: "",
    }));

    if (!stateId) {
      setDestinations([]);
      return;
    }

    try {
      setLoading(true);

      const response = await getDestinationsByState(stateId);

      setDestinations(response.data);
    } catch (error) {
      console.log(error);

      setDestinations([]);

      toast.error("Failed to load destinations");
    } finally {
      setLoading(false);
    }
  };

  

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

 
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.stateId) {
      toast.error("Please select a state");
      return;
    }

    if (!formData.destinationId) {
      toast.error("Please select a destination");
      return;
    }

    if (!formData.name.trim()) {
      toast.error("Please enter attraction name");
      return;
    }

    try {
      setSaving(true);

      await createAttraction({
        destinationId: formData.destinationId,
        name: formData.name,
        description: formData.description,
        price: formData.price,
        timing: formData.timing,
        image: formData.image,
        rating: Number(formData.rating),
      });

      toast.success("Attraction Added Successfully");

      navigate("/admin/attractions");
    } catch (error) {
      console.log(error);

      toast.error(error.response?.data?.message || "Failed to add attraction");
    } finally {
      setSaving(false);
    }
  };

  
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

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Plus size={21} />
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">
                Add Attraction
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Add a new tourist attraction to a destination.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate("/admin/attractions")}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
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
            Enter the details of the tourist attraction below.
          </p>
        </div>

        {/* Form Body */}

        <div className="space-y-7 p-6 sm:p-8">
          {/* =====================================
              LOCATION
          ====================================== */}

          <div>
            <div className="mb-4 flex items-center gap-2">
              <MapPin size={19} className="text-blue-600" />

              <h3 className="font-bold text-slate-900">Location</h3>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* State */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  State
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <Map
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    value={formData.stateId}
                    onChange={handleStateChange}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  >
                    <option value="">Select State</option>

                    {states.map((state) => (
                      <option key={state._id} value={state._id}>
                        {state.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Destination */}

              <div>
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Destination
                  <span className="ml-1 text-red-500">*</span>
                </label>

                <div className="relative">
                  <MapPin
                    size={18}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <select
                    name="destinationId"
                    value={formData.destinationId}
                    onChange={handleChange}
                    disabled={!formData.stateId || destinations.length === 0}
                    required
                    className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-3.5 pl-11 pr-4 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    <option value="">
                      {!formData.stateId
                        ? "Select state first"
                        : destinations.length === 0
                          ? "No destinations found"
                          : "Select Destination"}
                    </option>

                    {destinations.map((destination) => (
                      <option key={destination._id} value={destination._id}>
                        {destination.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}

          <div className="border-t border-slate-100" />

         
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
              <Star size={19} className="text-amber-500" />

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
                  alt="Attraction preview"
                  className="h-52 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        

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
            className="inline-flex min-w-[170px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <Loader />
            ) : (
              <>
                <Plus size={18} />
                Add Attraction
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AddAttraction;
