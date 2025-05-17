import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import debounce from "lodash/debounce";

const CheatDay = ({ recipe }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(() => {
    const cached = localStorage.getItem("cheatDayLocation");
    return cached ? JSON.parse(cached) : null;
  });
  const [showConsent, setShowConsent] = useState(false);
  const [searchQuery, setSearchQuery] = useState(
    recipe ? recipe.cuisine || recipe.name : ""
  );
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Fetch autocomplete suggestions
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const response = await axios.get(
          "https://trackapi.nutritionix.com/v2/search/instant",
          {
            params: { query, common: true },
            headers: {
              "x-app-id": process.env.REACT_APP_NUTRITIONIX_APP_ID,
              "x-app-key": process.env.REACT_APP_NUTRITIONIX_API_KEY,
            },
          }
        );
        const suggestionNames = (response.data.common || []).map(
          (item) => item.food_name
        );
        setSuggestions(suggestionNames);
        setShowSuggestions(isInputFocused && suggestionNames.length > 0);
      } catch (err) {
        console.error("Nutritionix autocomplete error:", err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    [isInputFocused]
  );

  // Update suggestions when query changes
  useEffect(() => {
    fetchSuggestions(searchQuery);
  }, [searchQuery, fetchSuggestions]);

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        inputRef.current &&
        dropdownRef.current &&
        !inputRef.current.contains(event.target) &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setIsInputFocused(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleGetRestaurants = async () => {
    if (!searchQuery.trim()) {
      setError("Please enter a cuisine or dish.");
      return;
    }
    if (location) {
      fetchRestaurants(location.latitude, location.longitude);
    } else {
      setShowConsent(true);
    }
  };

  const requestLocation = () => {
    setShowConsent(false);
    setLoading(true);
    setError(null);
    setRestaurants([]);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { latitude, longitude };
          setLocation(newLocation);
          localStorage.setItem("cheatDayLocation", JSON.stringify(newLocation));
          fetchRestaurants(latitude, longitude);
        },
        (err) => {
          setError("Location access denied. Please enable location services.");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
    }
  };

  const fetchRestaurants = async (latitude, longitude) => {
    setLoading(true);
    setRestaurants([]);
    setError(null);
    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL}/features/cheat-day/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            cuisine: "",
            dish: searchQuery.trim(),
            latitude,
            longitude,
          }),
        }
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch restaurants");
      }
      const data = await response.json();
      setRestaurants(data.restaurants || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setIsInputFocused(false);
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(isInputFocused && e.target.value.trim().length > 0);
  };

  const handleInputFocus = () => {
    setIsInputFocused(true);
    if (searchQuery.trim() && suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleInputBlur = () => {
    // Delay hiding suggestions to allow clicking a suggestion
    setTimeout(() => {
      if (!dropdownRef.current?.contains(document.activeElement)) {
        setShowSuggestions(false);
        setIsInputFocused(false);
      }
    }, 200);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 font-sans">
      {/* Hero Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Discover Your Perfect Cheat Meal
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-6 sm:mb-8">
            Find the best restaurants near you for your favorite cuisine or dish.
          </p>
          <div className="relative w-full max-w-xl mx-auto">
            <div className="flex flex-wrap items-center bg-white rounded-full shadow-lg p-2">
              <input
                type="text"
                value={searchQuery}
                onChange={handleInputChange}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
                placeholder="What are you craving? (e.g., Pizza, Sushi)"
                className="flex-1 min-w-0 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 focus:outline-none rounded-l-full text-sm sm:text-base"
                ref={inputRef}
              />
              <button
                onClick={handleGetRestaurants}
                className="bg-orange-500 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-full hover:bg-orange-600 transition flex items-center shrink-0 text-sm sm:text-base"
              >
                {loading ? (
                  <svg
                    className="animate-spin h-4 w-4 sm:h-5 sm:w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    ></path>
                  </svg>
                ) : (
                  <svg
                    className="h-4 w-4 sm:h-5 sm:w-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    ></path>
                  </svg>
                )}
                Search
              </button>
            </div>
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto"
                  ref={dropdownRef}
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      className="px-4 py-2 sm:py-3 text-gray-700 hover:bg-orange-50 cursor-pointer transition text-sm sm:text-base"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}
          {showConsent && (
            <div className="mt-6 p-4 bg-white rounded-lg shadow-lg">
              <p className="text-gray-700 mb-4 text-sm sm:text-base">
                We need your location to find nearby restaurants.
              </p>
              <button
                onClick={requestLocation}
                className="bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition text-sm sm:text-base"
              >
                Allow Location Access
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Restaurants Section */}
      {restaurants.length > 0 && (
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8">
            Nearby Restaurants
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition"
              >
                <div className="p-4 sm:p-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                    {restaurant.name}
                  </h3>
                  <div className="flex items-center mt-2">
                    <svg
                      className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <p className="ml-1 text-xs sm:text-sm text-gray-600">
                      {restaurant.rating} / 5 ({restaurant.user_ratings_total} reviews)
                    </p>
                  </div>
                  <p className="mt-2 text-xs sm:text-sm text-gray-500 truncate">
                    {restaurant.vicinity}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      restaurant.name + " " + restaurant.vicinity
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 sm:mt-4 inline-flex items-center text-orange-500 hover:text-orange-600 text-xs sm:text-sm font-medium"
                  >
                    View on Map
                    <svg
                      className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M9 5l7 7-7 7"
                      ></path>
                    </svg>
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CheatDay;  