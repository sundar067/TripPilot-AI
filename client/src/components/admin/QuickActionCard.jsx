import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const QuickActionCard = ({ title, description, icon, link, color }) => {
  return (
    <Link
      to={link}
      className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-slate-300 hover:shadow-lg"
    >
      {/* Main Content */}

      <div className="relative">
        {/* Icon */}

        <div
          className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${color} text-white shadow-md transition-all duration-300 group-hover:scale-105 group-hover:rotate-3`}
        >
          {icon}
        </div>

        {/* Title */}

        <h3 className="text-xl font-bold text-slate-900">{title}</h3>

        {/* Description */}

        <p className="mt-3 leading-6 text-slate-500">{description}</p>
      </div>

      {/* Bottom Action */}

      <div className="relative mt-7 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-cyan-600">
          Open Module
        </span>

        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-cyan-500 text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-cyan-600">
          <ArrowRight size={18} />
        </div>
      </div>

      {/* Subtle Bottom Border */}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-slate-100" />
    </Link>
  );
};

export default QuickActionCard;
