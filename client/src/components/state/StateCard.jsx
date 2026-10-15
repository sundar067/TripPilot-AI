
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
    <Link
      to={`/states/${state._id}`}
      className="block h-full min-w-0 w-full"
    >
      <div
        className={`flex h-full min-w-0 flex-col overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 hover:shadow-xl ${
          expanded ? "" : "min-h-[380px] sm:min-h-[430px] lg:min-h-[470px]"
        }`}
      >
        {/* State Image */}
        <img
          src={state.image}
          alt={state.name}
          loading="lazy"
          className="h-52 w-full shrink-0 object-cover sm:h-60 lg:h-72"
        />

        {/* Content */}
        <div className="flex min-w-0 flex-1 flex-col px-4 pb-5 pt-4 sm:px-5 sm:pt-5 lg:px-6">
          {/* State Name */}
          <h2 className="mb-3 break-words text-xl font-bold leading-snug text-gray-900 sm:mb-4 sm:text-2xl">
            {state.name}
          </h2>

          {/* Description */}
          <p className="break-words text-sm leading-7 text-gray-600 sm:text-base sm:leading-8">
            {expanded ? (
              <>
                {description}

                {description.length > MAX_LENGTH && (
                  <>
                    {" "}
                    <button
                      type="button"
                      onClick={handleToggle}
                      className="font-semibold text-blue-600 hover:underline"
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
                      className="font-semibold text-blue-600 hover:underline"
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
