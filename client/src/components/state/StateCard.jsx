import { useState } from "react";
import { Link } from "react-router-dom";

function StateCard({ state }) {
  const [expanded, setExpanded] = useState(false);

  const MAX_LENGTH = 130;

  const description = state?.description || "";

  const shortDescription =
    description.length > MAX_LENGTH
      ? description.substring(0, MAX_LENGTH)
      : description;

  const handleToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => !prev);
  };

  return (
    <Link to={`/states/${state._id}`} className="block">
      <div
        className={`bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col ${
          expanded ? "" : "min-h-[470px]"
        }`}
      >
        {/* State Image */}
        <img
          src={state.image}
          alt={state.name}
          className="w-full h-72 object-cover"
        />

        {/* Content */}
        <div className="px-6 pt-5 pb-5 flex flex-col flex-1">
          {/* State Name */}
          <h2 className="text-2xl font-bold mb-4">{state.name}</h2>

          {/* Description */}
          <p className="text-gray-600 text-[16px] leading-8">
            {expanded ? (
              <>
                {description}

                {description.length > MAX_LENGTH && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      Show Less
                    </button>
                  </>
                )}
              </>
            ) : (
              <>
                {shortDescription}

                {description.length > MAX_LENGTH && (
                  <>
                    ...{" "}
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="text-blue-600 font-semibold hover:underline"
                    >
                      View More
                    </button>
                  </>
                )}
              </>
            )}
          </p>
        </div>
      </div>
    </Link>
  );
}

export default StateCard;
