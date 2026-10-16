import { Link } from "react-router-dom";
import { Phone, MapPin, Mail } from "lucide-react";

const EXPLORE_LINKS = [
  { label: "States", to: "/states" },
  { label: "Destinations", to: "/destinations" },
  { label: "Attractions", to: "/attractions" },
];

const QUICK_LINKS = [
  { label: "Home", to: "/" },
  { label: "States", to: "/states" },
  { label: "Plan My Trip", to: "/plan-trip" },
];

const SOCIAL_LINKS = [
  {
    name: "Facebook",
    url: "https://www.facebook.com/",
    hover: "hover:bg-blue-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M13.5 21v-8.2h2.8l.4-3.2h-3.2V7.5c0-.9.3-1.6 1.6-1.6h1.7V3.1c-.8-.1-1.7-.2-2.6-.2-2.6 0-4.4 1.6-4.4 4.5v2.2H7v3.2h2.8V21h3.7z" />
      </svg>
    ),
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/",
    hover: "hover:bg-pink-600",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="h-5 w-5"
      >
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle
          cx="17.5"
          cy="6.5"
          r="1"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    ),
  },
  {
    name: "YouTube",
    url: "https://www.youtube.com/",
    hover: "hover:bg-red-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.6V8.4l6.3 3.6-6.3 3.6Z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/",
    hover: "hover:bg-sky-600",
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M5.2 3a2.2 2.2 0 1 0 0 4.4 2.2 2.2 0 0 0 0-4.4ZM3.3 9h3.8v12H3.3V9Zm6.1 0H13v1.6h.1A4 4 0 0 1 16.7 8.7c3.9 0 4.6 2.5 4.6 5.7V21h-3.8v-5.9c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V21H9.4V9Z" />
      </svg>
    ),
  },
];

function MountainIcon({ className = "" }) {
  return (
    <svg
      viewBox="0 0 48 28"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id="footerMountainGradient"
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor="#60A5FA" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
      </defs>

      <path
        d="M0 28 L14 8 L22 18 L30 4 L48 28 Z"
        fill="url(#footerMountainGradient)"
      />

      <path d="M24 28 L34 14 L48 28 Z" fill="#2563EB" opacity="0.7" />
    </svg>
  );
}

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="relative isolate w-full overflow-hidden bg-gradient-to-br from-[#10131d] via-[#211719] to-[#38211f] text-white">
      {/* Decorative background waves */}

      <div
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden="true"
      >
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 1440 600"
          preserveAspectRatio="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 90 C220 10 320 180 560 130 S980 40 1200 110 S1370 160 1440 125 V600 H0 Z"
            fill="#080d18"
            opacity="0.38"
          />

          <path
            d="M0 300 C230 220 350 390 590 340 S990 250 1190 320 S1370 360 1440 325 V600 H0 Z"
            fill="#7c3f32"
            opacity="0.12"
          />

          <path
            d="M0 420 C200 350 380 480 600 435 S1010 365 1210 425 S1380 460 1440 435 V600 H0 Z"
            fill="#0b1020"
            opacity="0.25"
          />
        </svg>
      </div>

      {/* Main footer content */}

      <div className="mx-auto w-full max-w-7xl px-4 pb-8 pt-9 sm:px-6 sm:pb-10 sm:pt-12 md:px-10 lg:px-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-[1.5fr_0.9fr_0.9fr_1fr] lg:gap-8">
          {/* Brand */}

          <div className="min-w-0 lg:pr-8">
            <Link
              to="/"
              className="inline-block w-fit max-w-full"
              aria-label="TripPilot AI Home"
            >
              <span className="text-2xl font-extrabold tracking-tight sm:text-3xl">
                TripPilot <span className="text-blue-500">AI</span>
              </span>
            </Link>

            <p className="mt-3 max-w-sm text-sm leading-6 text-gray-300 sm:mt-4 sm:text-base sm:leading-7">
              Explore India, discover destinations and plan your trips with AI.
            </p>
          </div>

          {/* Explore */}

          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
              Explore
            </h3>

            <ul className="mt-4 space-y-3 sm:mt-5">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-block text-sm text-gray-300 transition-colors hover:text-blue-400 sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}

          <div className="min-w-0">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
              Quick Links
            </h3>

            <ul className="mt-4 space-y-3 sm:mt-5">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="inline-block text-sm text-gray-300 transition-colors hover:text-blue-400 sm:text-base"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}

          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
              Contact Us
            </h3>

            <div className="mt-4 space-y-4 sm:mt-5">
              {/* Phone */}

              <a
                href="tel:+919389697337"
                className="flex min-w-0 items-center gap-3 text-sm text-gray-300 transition-colors hover:text-white sm:text-base"
              >
                <Phone size={18} className="shrink-0 text-blue-400" />

                <span>+91 9389697337</span>
              </a>

              {/* Email */}

              <a
                href="mailto:singhsundar9167@gmail.com"
                className="flex min-w-0 items-start gap-3 text-sm text-gray-300 transition-colors hover:text-white sm:text-base"
              >
                <Mail size={18} className="mt-0.5 shrink-0 text-blue-400" />

                <span className="min-w-0 break-all">
                  singhsundar9167@gmail.com
                </span>
              </a>

              {/* Location */}

              <div className="flex items-center gap-3 text-sm text-gray-300 sm:text-base">
                <MapPin size={18} className="shrink-0 text-blue-400" />

                <span>India</span>
              </div>
            </div>

            {/* Social links */}

            <div className="mt-6 sm:mt-7">
              <h3 className="text-xs font-bold uppercase tracking-[0.18em] sm:text-sm">
                Follow Us
              </h3>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                {SOCIAL_LINKS.map((social) => (
                  <a
                    key={social.name}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.name}
                    title={social.name}
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/10 p-2 text-white transition-all duration-200 hover:-translate-y-1 ${social.hover}`}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright bar */}

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-10 lg:px-14">
        <div className="border-t border-white/15" />

        <div className="flex flex-col items-center justify-between gap-4 py-5 text-xs text-gray-400 sm:flex-row sm:py-6 sm:text-sm">
          <p className="text-center leading-6 sm:text-left">
            © {year} TripPilot AI. All rights reserved.
          </p>

          <div className="flex items-center gap-3 text-gray-300">
            <MountainIcon className="h-6 w-11 shrink-0" />

            <span>Made for travellers</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
