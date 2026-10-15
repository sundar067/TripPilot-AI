import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import SearchBar from "../components/search/SearchBar";
import { getAllStates } from "../services/stateService";
import { sendChatMessage } from "../services/chatService";

// =========================================================
// ROUTES  (change these if your App.jsx routes are different)
// =========================================================
const STATES_PAGE = "/states";
const getStatePath = (state) => `/states/${state._id}`;

const GREETING = {
  id: "greeting",
  role: "assistant",
  isGreeting: true,
  content:
    "Hi! I'm **TripPilot AI.**\nI can help you with destinations, itineraries, best time to visit, travel tips and more.\n\nWhere would you like to go?",
};

const FEATURES = [
  {
    icon: "🤖",
    bg: "bg-blue-100 text-blue-600",
    title: "AI-Powered Suggestions",
    desc: "Get personalized travel plans",
  },
  {
    icon: "🗺️",
    bg: "bg-green-100 text-green-600",
    title: "Explore Destinations",
    desc: "Find top tourist attractions",
  },
  {
    icon: "📍",
    bg: "bg-orange-100 text-orange-600",
    title: "Plan Your Trip",
    desc: "Create custom itineraries",
  },
  {
    icon: "🧭",
    bg: "bg-purple-100 text-purple-600",
    title: "Discover Hidden Gems",
    desc: "Explore offbeat destinations",
  },
];

// How many dots to show at the bottom of the hero
const MAX_DOTS = 5;

// Chatbox resize limits (px)
// Max height 500 so chat (bottom-6 = 24px) always fits inside the 560px hero
const CHAT_MIN = { w: 280, h: 300 };
const CHAT_MAX = { w: 520, h: 500 };
const CHAT_DEFAULT = { w: 315, h: 430 };

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const arrowClass =
  "absolute z-30 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/45 hover:bg-black/70 backdrop-blur-md border border-white/30 text-white text-2xl flex items-center justify-center transition hover:scale-110 shadow-lg";

// =========================================================
// SEARCH AREA STYLES
// - typed text in search input = black
// - "Trending" label = white, clearly visible
// - suggestion dropdown text = black (easy to read)
// =========================================================
const searchStyles = `
  .hero-search input {
    color: #000000 !important;
    -webkit-text-fill-color: #000000 !important;
    caret-color: #000000 !important;
  }
  .hero-search input::placeholder {
    color: #6b7280 !important;
    -webkit-text-fill-color: #6b7280 !important;
  }
  .hero-search :is(span, p, small, label):not(ul *):not(li *):not(button *) {
    color: #ffffff !important;
    font-weight: 600;
    text-shadow: 0 1px 6px rgba(0, 0, 0, 0.9);
  }
  .hero-search svg:not(button svg) {
    filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.9));
  }

  /* ---------- SUGGESTION DROPDOWN: everything black ---------- */
  .hero-search [class*="absolute"] *,
  .hero-search ul *,
  .hero-search [role="listbox"] *,
  .hero-search [role="option"] * {
    color: #111827 !important;
    -webkit-text-fill-color: #111827 !important;
    text-shadow: none !important;
    filter: none !important;
  }
  .hero-search [class*="absolute"] :is(p, span, small):not(:first-child),
  .hero-search ul :is(p, span, small):not(:first-child) {
    color: #4b5563 !important;
    -webkit-text-fill-color: #4b5563 !important;
    font-weight: 500 !important;
  }
`;

// =========================================================
// CHAT TEXT RENDERER
// Supports: ### headings, "- " / "* " bullets, **bold**, blank lines
// =========================================================
function renderInline(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("**") && part.endsWith("**") && part.length > 4 ? (
        <b key={i}>{part.slice(2, -2)}</b>
      ) : (
        <span key={i}>{part}</span>
      ),
    );
}

function renderChatText(text) {
  return text.split("\n").map((line, i) => {
    const trimmed = line.trim();

    // blank line -> small spacer
    if (!trimmed) return <div key={i} className="h-1.5" />;

    // heading: ### Title
    const heading = trimmed.match(/^#{1,6}\s+(.*)$/);
    if (heading) {
      return (
        <div key={i} className="font-bold text-gray-900 mt-1">
          {renderInline(heading[1])}
        </div>
      );
    }

    // bullet: - item / * item / • item
    const bullet = trimmed.match(/^[-*•]\s+(.*)$/);
    if (bullet) {
      return (
        <div key={i} className="flex gap-1.5 pl-1">
          <span>•</span>
          <span className="flex-1">{renderInline(bullet[1])}</span>
        </div>
      );
    }

    return <div key={i}>{renderInline(trimmed)}</div>;
  });
}

// =========================================================
// LOCATION PIN ICON (white pin + dark center + soft shadow)
// =========================================================
function LocationPin({ className = "" }) {
  return (
    <svg
      viewBox="0 0 32 40"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="pinGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F3F4F6" />
          <stop offset="100%" stopColor="#B8BDC6" />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx="16"
        cy="35.5"
        rx="10"
        ry="3.2"
        fill="rgba(255,255,255,0.35)"
      />
      <ellipse cx="16" cy="35.5" rx="6" ry="1.8" fill="rgba(0,0,0,0.35)" />

      {/* Pin body */}
      <path
        d="M16 2C9.4 2 4.2 7.2 4.2 13.6c0 8.6 11.8 21 11.8 21s11.8-12.4 11.8-21C27.8 7.2 22.6 2 16 2z"
        fill="url(#pinGradient)"
      />

      {/* Center hole */}
      <circle cx="16" cy="13.5" r="4.6" fill="#2F343D" />
    </svg>
  );
}

function Home() {
  const navigate = useNavigate();

  const [states, setStates] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // ---------- chat state ----------
  const [chatOpen, setChatOpen] = useState(false); // closed on page load/refresh
  const [chatMinimized, setChatMinimized] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [message, setMessage] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [chatSize, setChatSize] = useState(CHAT_DEFAULT);

  const chatBottomRef = useRef(null);
  const chatInputRef = useRef(null);

  // =========================================================
  // FETCH STATES
  // =========================================================
  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await getAllStates();
        const fetchedStates = response.data || [];

        // Only states having an image
        setStates(fetchedStates.filter((state) => state?.image));
      } catch (error) {
        console.log("Error fetching states:", error.message);
      }
    };

    fetchStates();
  }, []);

  // =========================================================
  // AUTO SLIDER
  // =========================================================
  useEffect(() => {
    if (states.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % states.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [states]);

  // =========================================================
  // CHAT: auto scroll to latest message
  // =========================================================
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, chatLoading, chatMinimized, chatOpen]);

  // =========================================================
  // CHAT: resize
  // Chat is anchored to the right/bottom, so dragging LEFT makes it
  // wider and dragging UP makes it taller.
  // mode: "w" (left edge), "h" (top edge), "both" (top-left corner)
  // =========================================================
  const startResize = (mode) => (e) => {
    e.preventDefault();
    e.stopPropagation();

    const startX = e.clientX;
    const startY = e.clientY;
    const startW = chatSize.w;
    const startH = chatSize.h;

    // no text selection while dragging
    const prevUserSelect = document.body.style.userSelect;
    document.body.style.userSelect = "none";

    const onMove = (ev) => {
      setChatSize({
        w:
          mode === "h"
            ? startW
            : clamp(startW + (startX - ev.clientX), CHAT_MIN.w, CHAT_MAX.w),
        h:
          mode === "w"
            ? startH
            : clamp(startH + (startY - ev.clientY), CHAT_MIN.h, CHAT_MAX.h),
      });
    };

    const onUp = () => {
      document.body.style.userSelect = prevUserSelect;
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  // header button: toggle between default size and max size
  const isChatExpanded = chatSize.w >= CHAT_MAX.w - 5;
  const toggleChatSize = () => {
    setChatSize(isChatExpanded ? CHAT_DEFAULT : CHAT_MAX);
  };

  // =========================================================
  // SLIDER CONTROLS
  // =========================================================
  const handlePrevious = () => {
    if (states.length === 0) return;
    setCurrentSlide((prev) => (prev === 0 ? states.length - 1 : prev - 1));
  };

  const handleNext = () => {
    if (states.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % states.length);
  };

  const currentState = states[currentSlide];

  // =========================================================
  // VISIBLE DOTS (only MAX_DOTS shown, window follows active slide)
  // =========================================================
  const getVisibleDotIndexes = () => {
    if (states.length <= MAX_DOTS) {
      return states.map((_, index) => index);
    }

    let start = currentSlide - Math.floor(MAX_DOTS / 2);
    start = Math.max(0, Math.min(start, states.length - MAX_DOTS));

    return Array.from({ length: MAX_DOTS }, (_, i) => start + i);
  };

  const visibleDotIndexes = getVisibleDotIndexes();

  // =========================================================
  // NAVIGATION
  // =========================================================
  const handleOpenState = (state) => {
    navigate(getStatePath(state));
  };

  const handleViewAllStates = () => {
    navigate(STATES_PAGE);
  };

  // =========================================================
  // CHAT: send message to AI (chatService -> /api/chat -> Groq)
  // =========================================================
  const sendMessage = async (text) => {
    const trimmed = text.trim();
    if (!trimmed || chatLoading) return;

    const userMessage = {
      id: `u-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setMessage("");
    setChatLoading(true);

    try {
      // greeting and error bubbles are display-only, don't send them to AI
      const history = nextMessages
        .filter((m) => !m.isGreeting && !m.isError)
        .map((m) => ({ role: m.role, content: m.content }));

      // chatService returns the axios response -> reply is in response.data.reply
      const response = await sendChatMessage(history);
      const reply = response?.data?.reply;

      if (!reply) throw new Error("Empty reply from chat API");

      setMessages((prev) => [
        ...prev,
        { id: `a-${Date.now()}`, role: "assistant", content: reply },
      ]);
    } catch (error) {
      console.log(
        "Chat error:",
        error?.response?.data?.message || error.message,
      );

      setMessages((prev) => [
        ...prev,
        {
          id: `e-${Date.now()}`,
          role: "assistant",
          isError: true,
          content: "Sorry, I couldn't reply right now. Please try again.",
        },
      ]);
    } finally {
      setChatLoading(false);
      chatInputRef.current?.focus();
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(message);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-white flex flex-col">
      <style>{searchStyles}</style>

      {/* =====================================================
          HERO SECTION (fixed height, image always fills it)
          "isolate" keeps hero z-indexes inside the hero, so it
          never overlaps the navbar when scrolling.
      ====================================================== */}
      <section className="relative isolate w-full max-w-full h-[610px] min-[400px]:h-[620px] sm:h-[560px] md:h-[540px] lg:h-[560px] overflow-hidden bg-slate-900">
        {/* BACKGROUND SLIDES */}
        {states.length > 0 &&
          states.map((state, index) => (
            <div
              key={state._id}
              className={`absolute inset-0 transition-opacity duration-1000 ${
                index === currentSlide
                  ? "opacity-100"
                  : "opacity-0 pointer-events-none"
              }`}
            >
              <img
                src={state.image}
                alt={state.name}
                loading={index === 0 ? "eager" : "lazy"}
                fetchPriority={index === 0 ? "high" : "auto"}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center select-none"
              />

              {/* Left readability overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent pointer-events-none" />

              {/* Light bottom overlay */}
              <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/35 via-black/10 to-transparent pointer-events-none" />
            </div>
          ))}

        {/* FALLBACK */}
        {states.length === 0 && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-800 to-indigo-950 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-5xl mb-3">🌏</div>
              <p className="text-xl font-semibold">Discovering India...</p>
            </div>
          </div>
        )}

        {/* HERO CONTENT
            z-50 so the search dropdown is above dots / label / chat.
            pointer-events-none on wrapper so arrows, dots, chat stay clickable. */}
        <div className="relative z-50 h-full w-full max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-14 pt-8 sm:pt-0 pb-16 sm:pb-10 flex items-center pointer-events-none">
          <div className="relative w-full lg:w-[62%] text-white pointer-events-auto">
            {/* Tag pill */}
            <div className="inline-flex items-center gap-2 mb-4 px-3 py-1.5 rounded-full bg-black/45 backdrop-blur-md border border-white/25 text-xs font-medium text-white shadow-md">
              <span className="text-yellow-300">✦</span>
              Incredible India Awaits
            </div>

            {/* HEADING */}
            <h1 className="text-3xl min-[380px]:text-4xl sm:text-5xl md:text-6xl lg:text-[64px] font-extrabold leading-[1.05] tracking-tight mb-4 text-white drop-shadow-[0_5px_12px_rgba(0,0,0,0.85)]">
              Discover India
              <br />
              <span className="text-blue-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.9)]">
                with AI
              </span>
            </h1>

            {/* DESCRIPTION */}
            <p className="text-base md:text-lg text-white max-w-md leading-relaxed mb-6 font-medium drop-shadow-[0_3px_8px_rgba(0,0,0,0.95)]">
              Explore destinations, tourist attractions and personalized travel
              plans crafted by AI.
            </p>

            {/* SEARCH BAR + its own Trending row */}
            <div className="hero-search relative z-20">
              {/* Uniform dark backdrop so Trending is clearly visible */}
              <div className="absolute -inset-x-4 -inset-y-3 -z-10 rounded-[28px] bg-black/65 backdrop-blur-sm border border-white/10 pointer-events-none" />

              <div className="relative">
                <SearchBar />
              </div>
            </div>
          </div>
        </div>

        {/* CURRENT STATE LABEL (bottom-left) */}
        {currentState && (
          <div className="flex absolute z-30 left-3 sm:left-6 md:left-10 lg:left-14 bottom-14 sm:bottom-3 items-center gap-2 text-white max-w-[65%] sm:max-w-none">
            <LocationPin className="w-8 h-10 drop-shadow-lg flex-shrink-0" />
            <div>
              <p className="text-base font-bold leading-tight drop-shadow-lg">
                {currentState.name}
              </p>
              <p className="text-xs text-white/90 mt-0.5 drop-shadow-md">
                Explore the beauty of India
              </p>
            </div>
          </div>
        )}

        {/* ARROWS */}
        {states.length > 1 && (
          <>
            <button
              type="button"
              onClick={handlePrevious}
              aria-label="Previous slide"
              className={`${arrowClass} left-5`}
            >
              ‹
            </button>

            <button
              type="button"
              onClick={handleNext}
              aria-label="Next slide"
              className={`${arrowClass} right-5`}
            >
              ›
            </button>
          </>
        )}

        {/* SLIDER DOTS (only 5 visible) */}
        {states.length > 1 && (
          <div className="absolute z-30 bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/45 backdrop-blur-md border border-white/15">
            {visibleDotIndexes.map((index) => (
              <button
                key={states[index]._id}
                type="button"
                onClick={() => setCurrentSlide(index)}
                aria-label={`Show ${states[index].name}`}
                className={`h-2 rounded-full transition-all duration-300 flex-shrink-0 ${
                  index === currentSlide
                    ? "w-7 bg-blue-500"
                    : "w-2 bg-white/70 hover:bg-white"
                }`}
              />
            ))}
          </div>
        )}

        {/* =====================================================
            AI CHAT BOX (working chat + resizable)
            Anchored bottom-right. Drag top edge / left edge /
            top-left corner to resize.
        ====================================================== */}
        {chatOpen && (
          <div
            className="fixed z-[120] left-auto right-3 bottom-20 w-auto max-w-[520px] mx-0 bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:absolute lg:left-auto lg:mx-0 lg:right-20 lg:bottom-6 lg:w-auto"
            style={{
              width:
                window.innerWidth < 1024
                  ? "min(360px, calc(100vw - 24px))"
                  : chatSize.w,
              height: chatMinimized
                ? "auto"
                : window.innerWidth < 1024
                  ? "min(55dvh, 420px)"
                  : chatSize.h,
            }}
          >
            {/* Header */}
            <div className="px-4 py-3 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-xl">
                  🤖
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-sm">
                    TripPilot <span className="text-blue-600">AI</span>{" "}
                    Assistant
                  </h3>
                  <p className="text-[11px] text-gray-500">
                    Your personal travel guide for India
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!chatMinimized && (
                  <button
                    type="button"
                    onClick={toggleChatSize}
                    className="text-gray-500 hover:text-gray-900 text-base leading-none"
                    aria-label={isChatExpanded ? "Shrink chat" : "Expand chat"}
                    title={isChatExpanded ? "Shrink chat" : "Expand chat"}
                  >
                    {isChatExpanded ? "⤡" : "⤢"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setChatMinimized((v) => !v)}
                  className="text-gray-500 hover:text-gray-900 text-lg"
                  aria-label={chatMinimized ? "Expand chat" : "Minimize chat"}
                >
                  {chatMinimized ? "+" : "−"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setChatOpen(false);
                    setChatMinimized(false);
                  }}
                  className="text-gray-500 hover:text-gray-900 text-lg"
                  aria-label="Close chat"
                >
                  ×
                </button>
              </div>
            </div>

            {!chatMinimized && (
              <>
                {/* Messages (fills the available height) */}
                <div className="px-4 py-4 bg-gray-50 flex-1 min-h-0 overflow-y-auto">
                  {messages.map((m) =>
                    m.role === "assistant" ? (
                      <div key={m.id} className="flex gap-2 mb-3">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">
                          🤖
                        </div>
                        <div
                          className={`rounded-xl rounded-tl-sm px-3 py-2.5 shadow-sm max-w-[85%] text-xs leading-relaxed break-words ${
                            m.isError
                              ? "bg-red-50 text-red-600"
                              : "bg-white text-gray-700"
                          }`}
                        >
                          {renderChatText(m.content)}
                        </div>
                      </div>
                    ) : (
                      <div key={m.id} className="flex justify-end mb-3">
                        <div className="bg-blue-600 text-white rounded-xl rounded-tr-sm px-3 py-2.5 shadow-sm max-w-[85%] text-xs leading-relaxed whitespace-pre-wrap break-words">
                          {m.content}
                        </div>
                      </div>
                    ),
                  )}

                  {/* Typing indicator */}
                  {chatLoading && (
                    <div className="flex gap-2 mb-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-sm flex-shrink-0">
                        🤖
                      </div>
                      <div className="bg-white rounded-xl rounded-tl-sm px-3 py-3 shadow-sm flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]" />
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" />
                      </div>
                    </div>
                  )}

                  <div ref={chatBottomRef} />
                </div>

                {/* Input */}
                <form
                  onSubmit={handleSendMessage}
                  className="px-4 pt-3 pb-4 bg-white border-t border-gray-100 flex-shrink-0"
                >
                  <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-3 py-1">
                    <input
                      ref={chatInputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ask me anything about travel in India..."
                      disabled={chatLoading}
                      maxLength={500}
                      className="flex-1 bg-transparent outline-none text-xs text-gray-900 placeholder:text-gray-500 py-2 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={chatLoading || !message.trim()}
                      className="w-9 h-9 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Send message"
                    >
                      ➤
                    </button>
                  </div>
                </form>

                {/* Resize: left edge (width) */}
                <div
                  onPointerDown={startResize("w")}
                  className="absolute top-5 bottom-0 left-0 w-1.5 cursor-ew-resize z-10 touch-none hover:bg-blue-400/40"
                  aria-label="Resize chat width"
                />

                {/* Resize: top edge (height) */}
                <div
                  onPointerDown={startResize("h")}
                  className="absolute top-0 left-5 right-0 h-1.5 cursor-ns-resize z-10 touch-none hover:bg-blue-400/40"
                  aria-label="Resize chat height"
                />

                {/* Resize: top-left corner (width + height) */}
                <div
                  onPointerDown={startResize("both")}
                  className="absolute top-0 left-0 w-4 h-4 cursor-nwse-resize z-20 touch-none"
                  role="separator"
                  aria-label="Resize chat"
                  title="Drag to resize"
                >
                  <div className="m-1 w-2.5 h-2.5 border-l-[3px] border-t-[3px] border-blue-500 rounded-tl-md" />
                </div>
              </>
            )}
          </div>
        )}

        {/* =====================================================
            OPEN CHAT BUTTON (bottom-right + "Chat with AI" label)
        ====================================================== */}
        {!chatOpen && (
          <div className="flex fixed z-[100] right-4 bottom-5 lg:absolute lg:right-16 lg:bottom-6 flex-col items-center gap-2">
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="relative group"
              aria-label="Chat with AI"
            >
              {/* pulse ring */}
              <span className="absolute inset-0 rounded-full bg-blue-500/60 animate-ping" />

              {/* main button */}
              <span className="relative flex w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-700 ring-4 ring-white/50 shadow-[0_8px_30px_rgba(37,99,235,0.7)] items-center justify-center text-3xl transition group-hover:scale-110">
                🤖
              </span>

              {/* online dot */}
              <span className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-green-400 border-2 border-white" />
            </button>

            {/* label */}
            <button
              type="button"
              onClick={() => setChatOpen(true)}
              className="px-3.5 py-1.5 rounded-full bg-white text-blue-700 text-xs font-bold shadow-lg hover:bg-blue-50 transition"
            >
              Chat with AI
            </button>
          </div>
        )}
      </section>

      {/* =====================================================
          EXPLORE INDIA
      ====================================================== */}
      <section className="bg-white px-6 md:px-10 lg:px-16 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col min-[420px]:flex-row min-[420px]:items-end min-[420px]:justify-between mb-5 gap-3">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900">
                Explore India
              </h2>
              <p className="text-sm md:text-base text-gray-500 mt-1">
                Discover the beauty of India's diverse states
              </p>
            </div>

            {/* VIEW ALL STATES -> opens all states page */}
            <button
              type="button"
              onClick={handleViewAllStates}
              className="flex items-center gap-1 px-4 py-2 rounded-full border border-blue-200 text-blue-600 text-sm font-semibold hover:bg-blue-50 transition whitespace-nowrap flex-shrink-0"
            >
              View All States
              <span>→</span>
            </button>
          </div>

          {/* State cards: click -> opens that state */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {states.slice(0, 6).map((state) => (
              <div
                key={state._id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${state.name}`}
                onClick={() => handleOpenState(state)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleOpenState(state);
                  }
                }}
                className="relative h-[145px] rounded-xl overflow-hidden group cursor-pointer shadow-sm hover:shadow-lg transition bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <img
                  src={state.image}
                  alt={state.name}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover object-center transition duration-500 group-hover:scale-105 select-none"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <h3 className="font-bold text-sm drop-shadow-md">
                    {state.name}
                  </h3>
                  <p className="text-[11px] text-white/90 mt-0.5 drop-shadow">
                    Explore places
                  </p>
                </div>

                <div className="absolute bottom-3 right-3 w-7 h-7 rounded-full bg-black/30 backdrop-blur-sm border border-white/30 flex items-center justify-center text-white group-hover:bg-blue-600 transition">
                  →
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          FEATURE STRIP
      ====================================================== */}
      <section className="border-t border-gray-100 bg-white px-6 md:px-10 py-5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-200">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="flex items-center gap-3 px-4 md:px-6 py-2"
            >
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center text-xl ${f.bg}`}
              >
                {f.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{f.title}</h3>
                <p className="text-xs text-gray-500">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

export default Home;
