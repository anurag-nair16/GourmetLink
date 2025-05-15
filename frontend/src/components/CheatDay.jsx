import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaMapMarkerAlt, FaSpinner, FaArrowRight } from 'react-icons/fa';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import debounce from 'lodash/debounce';

const CheatDay = ({ recipe }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(() => {
    const cached = localStorage.getItem('cheatDayLocation');
    return cached ? JSON.parse(cached) : null;
  });
  const [showConsent, setShowConsent] = useState(false);
  const [searchQuery, setSearchQuery] = useState(recipe ? recipe.cuisine || recipe.name : '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingText, setLoadingText] = useState('Finding tasty spots...');
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Zomato-inspired loading messages
  const loadingMessages = [
    'Finding tasty spots...',
    'Hangry? We’re on it!',
    'Searching for deliciousness...',
    'Chasing the best eats...',
    'Your cheat day awaits!',
  ];

  // Rotate loading messages
  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingText(prev => {
        const currentIndex = loadingMessages.indexOf(prev);
        return loadingMessages[(currentIndex + 1) % loadingMessages.length];
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  // Generate OAuth 1.0a signature for FatSecret API
  const generateOAuthSignature = (method, url, params) => {
    const consumerKey = process.env.REACT_APP_FATSECRET_CLIENT_ID;
    const consumerSecret = process.env.REACT_APP_FATSECRET_CLIENT_SECRET;
    const nonce = Math.random().toString(36).substring(2);
    const timestamp = Math.floor(Date.now() / 1000);

    const baseParams = {
      ...params,
      oauth_consumer_key: consumerKey,
      oauth_nonce: nonce,
      oauth_signature_method: 'HMAC-SHA1',
      oauth_timestamp: timestamp,
      oauth_version: '1.0',
    };

    const sortedParams = Object.keys(baseParams)
      .sort()
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(baseParams[key])}`)
      .join('&');

    const baseString = `${method}&${encodeURIComponent(url)}&${encodeURIComponent(sortedParams)}`;
    const signingKey = `${encodeURIComponent(consumerSecret)}&`;
    const signature = CryptoJS.HmacSHA1(baseString, signingKey).toString(CryptoJS.enc.Base64);

    return {
      ...baseParams,
      oauth_signature: signature,
    };
  };

  // Fetch autocomplete suggestions from FatSecret API
  const fetchSuggestions = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }

      try {
        const url = 'https://platform.fatsecret.com/rest/server.api';
        const params = {
          method: 'foods.search',
          search_expression: query,
          format: 'json',
          max_results: 10,
        };

        const oauthParams = generateOAuthSignature('GET', url, params);
        const response = await axios.get(url, { params: oauthParams });

        const foods = response.data.foods?.food || [];
        const suggestionNames = foods.map(food => food.food_name);
        setSuggestions(suggestionNames);
        setShowSuggestions(suggestionNames.length > 0);
      } catch (err) {
        console.error('FatSecret autocomplete error:', err);
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300),
    []
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
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleGetRestaurants = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a cuisine or dish.');
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
          localStorage.setItem('cheatDayLocation', JSON.stringify(newLocation));
          fetchRestaurants(latitude, longitude);
        },
        (err) => {
          setError('Location access denied. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser.');
      setLoading(false);
    }
  };

  const fetchRestaurants = async (latitude, longitude) => {
    setLoading(true);
    setRestaurants([]);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/features/cheat-day/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cuisine: '',
          dish: searchQuery.trim(),
          latitude,
          longitude,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch restaurants');
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
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
    setShowSuggestions(true);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
    hover: { y: -5, boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)', transition: { duration: 0.2 } },
  };

  const suggestionVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
  };

  const loadingVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.3 } },
  };

  return (
    <div className="py-12 bg-gradient-to-b from-gray-50 to-white font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4 tracking-tight">
            Your Cheat Day Adventure Awaits
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6 font-medium">
            Discover top-rated restaurants serving your favorite cuisine or dish, anywhere.
          </p>
          <div className="relative max-w-lg mx-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={handleInputChange}
              placeholder="Craving something? (e.g., Sushi, Spicy Noodles)"
              className="w-full px-5 py-3 bg-white border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-400 text-gray-900 text-base shadow-sm hover:shadow-md transition-shadow duration-300"
              ref={inputRef}
              onFocus={() => searchQuery.trim() && setShowSuggestions(suggestions.length > 0)}
            />
            <AnimatePresence>
              {showSuggestions && suggestions.length > 0 && (
                <motion.ul
                  initial="hidden"
                  animate="visible"
                  exit="hidden"
                  variants={containerVariants}
                  className="absolute z-20 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-xl max-h-64 overflow-y-auto"
                  ref={dropdownRef}
                >
                  {suggestions.map((suggestion, index) => (
                    <motion.li
                      key={index}
                      variants={suggestionVariants}
                      className="px-5 py-3 text-gray-700 hover:bg-orange-50 hover:text-orange-600 cursor-pointer text-base transition-colors duration-200"
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion}
                    </motion.li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
          <button
            onClick={handleGetRestaurants}
            className="mt-6 px-8 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 focus:ring-4 focus:ring-orange-200 text-base shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Find Restaurants <FaMapMarkerAlt className="ml-2 inline" />
          </button>
        </motion.div>

        <AnimatePresence>
          {showConsent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
              key="consent-popup"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                className="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full mx-4"
              >
                <h3 className="text-2xl font-semibold text-gray-900 mb-4">
                  We Need Your Location
                </h3>
                <p className="text-gray-600 mb-6 text-base">
                  To find the best restaurants near you, please allow location access. We’ll only use it for this search and won’t store it.
                </p>
                <div className="flex justify-end gap-4">
                  <button
                    onClick={() => setShowConsent(false)}
                    className="px-4 py-2 text-gray-600 font-medium hover:text-gray-800 text-base"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={requestLocation}
                    className="px-6 py-2 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 text-base"
                  >
                    Allow
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {loading && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={loadingVariants}
              className="fixed inset-0 bg-white/90 flex flex-col items-center justify-center z-40"
              key="loading-screen"
            >
              <FaSpinner className="text-5xl text-orange-500 animate-spin mb-4" />
              <motion.p
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-xl font-medium text-gray-800"
              >
                {loadingText}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 text-center mb-6 text-base font-medium"
          >
            {error}
          </motion.p>
        )}

        {restaurants.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {restaurants.map((restaurant, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                whileHover="hover"
                className="bg-white p-6 rounded-xl shadow-md border border-orange-100 relative overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 to-orange-300" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
                  {restaurant.name}
                </h3>
                <p className="text-gray-600 text-sm mb-1">
                  Rating: {restaurant.rating} / 5 ({restaurant.user_ratings_total} reviews)
                </p>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {restaurant.vicinity}
                </p>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name + ' ' + restaurant.vicinity)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-orange-500 font-medium hover:text-orange-600 text-sm"
                >
                  View on Map <FaArrowRight className="ml-2" />
                </a>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CheatDay;