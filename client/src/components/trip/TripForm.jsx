import toast from "react-hot-toast";
import { useState, useRef } from "react";
import { FiMic } from "react-icons/fi";
import { generateTripPlan, askTripQuestion } from "../../services/tripService";

function TripForm() {
  const [tripData, setTripData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    budget: "",
    travelers: "",
    tripType: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [tripPlan, setTripPlan] = useState("");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);

  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);

  // Same functionality, only updated styling
  const inputStyle =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const handleChange = (e) => {
    setTripData({
      ...tripData,
      [e.target.name]: e.target.value,
    });

    setErrors({
      ...errors,
      [e.target.name]: "",
    });
  };

  const speakText = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = "en-US";

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(speech);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};

    if (!tripData.destination.trim())
      newErrors.destination = "Destination is required";

    if (!tripData.startDate) newErrors.startDate = "Start date is required";

    if (!tripData.endDate) newErrors.endDate = "End date is required";

    if (
      tripData.startDate &&
      tripData.endDate &&
      tripData.endDate < tripData.startDate
    ) {
      newErrors.endDate = "End date cannot be before start date";
    }

    if (!tripData.budget) newErrors.budget = "Budget is required";

    if (!tripData.travelers) newErrors.travelers = "Travelers are required";

    if (!tripData.tripType) newErrors.tripType = "Trip type is required";

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      setTripPlan("");
      setChatInput("");
      setChatMessages([]);

      const response = await generateTripPlan(tripData);

      setTripPlan(response.data.tripPlan);
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error("Failed to generate trip plan");
    } finally {
      setLoading(false);
    }
  };

  const sendQuestionToAI = async (question, shouldSpeak = false) => {
    try {
      setChatLoading(true);

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: question,
        },
      ]);

      setChatInput("");

      const response = await askTripQuestion({
        tripPlan,
        question,
      });

      const aiReply = response.data.answer;

      setChatMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: aiReply,
        },
      ]);

      if (shouldSpeak) {
        speakText(aiReply);
      }
    } catch (error) {
      console.log(error.response?.data || error.message);

      toast.error("Failed to get AI response");
    } finally {
      setChatLoading(false);
    }
  };

  const handleMic = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast.error("Speech recognition not supported");
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognitionRef.current = recognition;

    let finalTranscript = "";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      let transcript = "";

      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }

      finalTranscript = transcript;
      setChatInput(transcript);
    };

    recognition.onerror = (event) => {
      console.log("Mic Error:", event.error);
      setIsListening(false);
    };

    recognition.onend = async () => {
      setIsListening(false);

      if (finalTranscript.trim()) {
        await sendQuestionToAI(finalTranscript, true);
      }
    };

    recognition.start();
  };

  const handleAskQuestion = async () => {
    if (!chatInput.trim()) return;

    await sendQuestionToAI(chatInput, false);
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pb-10">
      {/* Main Form Card */}

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        {/* Card Heading */}

        <div className="mb-7">
          <h2 className="text-2xl font-bold text-slate-900">Trip Details</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Destination */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Where do you want to go?
            </label>

            <input
              type="text"
              name="destination"
              placeholder="e.g. Goa, Manali, Rajasthan..."
              value={tripData.destination}
              onChange={handleChange}
              className={inputStyle}
            />

            {errors.destination && (
              <p className="mt-2 text-sm text-red-500">{errors.destination}</p>
            )}
          </div>

          {/* Dates */}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Start Date */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Trip Start Date
              </label>

              <input
                type="date"
                name="startDate"
                value={tripData.startDate}
                onChange={handleChange}
                className={inputStyle}
              />

              {errors.startDate && (
                <p className="mt-2 text-sm text-red-500">{errors.startDate}</p>
              )}
            </div>

            {/* End Date */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Trip End Date
              </label>

              <input
                type="date"
                name="endDate"
                value={tripData.endDate}
                onChange={handleChange}
                className={inputStyle}
              />

              {errors.endDate && (
                <p className="mt-2 text-sm text-red-500">{errors.endDate}</p>
              )}
            </div>
          </div>

          {/* Budget and Travelers */}

          <div className="grid gap-6 md:grid-cols-2">
            {/* Budget */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Total Budget (INR)
              </label>

              <input
                type="number"
                name="budget"
                placeholder="e.g. 10000"
                value={tripData.budget}
                onChange={handleChange}
                className={inputStyle}
              />

              {errors.budget && (
                <p className="mt-2 text-sm text-red-500">{errors.budget}</p>
              )}
            </div>

            {/* Travelers */}

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Number of Travelers
              </label>

              <input
                type="number"
                name="travelers"
                placeholder="e.g. 2"
                value={tripData.travelers}
                onChange={handleChange}
                className={inputStyle}
              />

              {errors.travelers && (
                <p className="mt-2 text-sm text-red-500">{errors.travelers}</p>
              )}
            </div>
          </div>

          {/* Trip Type */}

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Trip Type
            </label>

            <select
              name="tripType"
              value={tripData.tripType}
              onChange={handleChange}
              className={inputStyle}
            >
              <option value="">Select trip type</option>
              <option value="Adventure">Adventure</option>
              <option value="Family">Family</option>
              <option value="Solo">Solo</option>
              <option value="Romantic">Romantic</option>
            </select>

            {errors.tripType && (
              <p className="mt-2 text-sm text-red-500">{errors.tripType}</p>
            )}
          </div>

          {/* Generate Button */}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-base font-semibold text-white shadow-sm transition hover:from-blue-700 hover:to-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading
              ? "TripPilot AI is planning..."
              : "✨ Generate AI Itinerary"}
          </button>
        </form>
      </div>

      {/* Generated Trip */}

      {tripPlan && (
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="mb-2 text-sm font-medium text-blue-600">
            Powered by TripPilot AI
          </p>

          <h2 className="mb-6 text-2xl font-bold text-slate-900">
            ✨ AI Generated Itinerary
          </h2>

          <pre className="whitespace-pre-wrap rounded-xl bg-slate-50 p-5 leading-relaxed text-slate-700">
            {tripPlan}
          </pre>

          {/* AI Chat */}

          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="mb-5 text-xl font-bold text-slate-900">
              Ask TripPilot AI about this plan
            </h3>

            {chatMessages.length > 0 && (
              <div className="mb-6 max-h-[400px] space-y-4 overflow-y-auto pr-2">
                {chatMessages.map((message, index) => (
                  <div
                    key={index}
                    className={`rounded-xl p-4 ${
                      message.sender === "user"
                        ? "ml-auto max-w-[80%] bg-blue-600 text-white"
                        : "mr-auto max-w-[80%] border border-slate-200 bg-slate-50 text-slate-800"
                    }`}
                  >
                    <p className="mb-1 text-xs font-semibold opacity-70">
                      {message.sender === "user" ? "You" : "TripPilot AI"}
                    </p>

                    <p className="whitespace-pre-wrap text-sm">
                      {message.text}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Chat Input */}

            <div className="flex items-center gap-3">
              <textarea
                placeholder="Ask anything about your trip..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey && !chatLoading) {
                    e.preventDefault();
                    handleAskQuestion();
                  }
                }}
                rows={1}
                className="min-h-[52px] max-h-[150px] flex-1 resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {/* Mic Button */}

              <button
                type="button"
                onClick={handleMic}
                className={`rounded-xl p-3.5 shadow-sm transition ${
                  isListening
                    ? "animate-pulse bg-red-500 text-white"
                    : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                <FiMic size={21} />
              </button>

              {/* Ask AI Button */}

              <button
                type="button"
                onClick={handleAskQuestion}
                disabled={chatLoading}
                className="flex min-w-[120px] items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:from-blue-700 hover:to-indigo-700 disabled:opacity-60"
              >
                {chatLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />

                    <span>AI</span>
                  </div>
                ) : (
                  "Ask AI"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripForm;
