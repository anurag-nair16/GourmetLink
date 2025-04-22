import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaShoppingCart, FaFilePdf, FaTimes, FaSpinner, FaLink } from "react-icons/fa";

// Cache TTL: 5 minutes
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds

// Helper functions for localStorage cache
const getCachedIngredients = (planId) => {
  const cached = localStorage.getItem(`ingredients_${planId}`);
  if (cached) {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp < CACHE_TTL) {
      console.log(`Using cached ingredients from localStorage for plan ${planId}`);
      return data;
    } else {
      console.log(`Cache expired for plan ${planId}`);
      localStorage.removeItem(`ingredients_${planId}`);
    }
  }
  return null;
};

const setCachedIngredients = (planId, data) => {
  const cacheEntry = { data, timestamp: Date.now() };
  localStorage.setItem(`ingredients_${planId}`, JSON.stringify(cacheEntry));
  console.log(`Cached ingredients for plan ${planId} in localStorage`);
};

const MealPlannerViewer = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [loadingMealPlans, setLoadingMealPlans] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState({});
  const [jiomartLinks, setJiomartLinks] = useState([]);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    const token = localStorage.getItem("token");
    setLoadingMealPlans(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/features/mealplans/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMealPlans(response.data);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
    } finally {
      setLoadingMealPlans(false);
    }
  };

  const fetchIngredients = async (planId) => {
    const token = localStorage.getItem("token");
    const cachedData = getCachedIngredients(planId);
    if (cachedData) {
      setIngredients(cachedData);
      setShowIngredients(true);
      return;
    }

    console.log("Fetching ingredients for plan:", planId);
    setLoadingIngredients(true);
    setShowIngredients(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/features/mealplans/${planId}/ingredients/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ingredientsData = response.data.items;
      console.log("Ingredients fetched:", ingredientsData);
      setCachedIngredients(planId, ingredientsData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      setIngredients([]);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const generateJioMartLinks = () => {
    if (ingredients.length === 0) {
      alert("No ingredients to send to JioMart.");
      return;
    }

    // Generate a separate search link for each ingredient
    const links = ingredients.map((item) => {
      const searchQuery = `${item.quantity} ${item.unit} ${item.name}`;
      const encodedQuery = encodeURIComponent(searchQuery);
      return `https://www.jiomart.com/search/${encodedQuery}`;
    });
    setJiomartLinks(links); // Set the array of links
  };

  const downloadPdf = async (planId) => {
    const token = localStorage.getItem("token");
    setLoadingPdf((prev) => ({ ...prev, [planId]: true }));
    try {
      const response = await axios({
        url: `${process.env.REACT_APP_API_URL}/features/mealplans/${planId}/pdf/`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `shopping_list_${planId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setLoadingPdf((prev) => ({ ...prev, [planId]: false }));
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const loadingVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6">
      {/* Header */}
      <motion.h2
        className="text-4xl font-extrabold text-emerald-400 mb-8 text-center tracking-tight"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Your Meal Plans
      </motion.h2>

      {/* Loading Meal Plans */}
      {loadingMealPlans ? (
        <motion.div
          className="flex flex-col items-center justify-center min-h-[50vh]"
          variants={loadingVariants}
          initial="hidden"
          animate="visible"
        >
          <FaSpinner className="text-emerald-400 text-5xl animate-spin" />
          <p className="text-gray-300 mt-4 text-lg">Loading your meal plans...</p>
        </motion.div>
      ) : (
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {mealPlans.length === 0 ? (
            <p className="text-gray-400 text-center col-span-full text-lg">
              No meal plans yet. Create one to get started!
            </p>
          ) : (
            mealPlans.map((plan) => (
              <motion.div
                key={plan.id}
                className="bg-gray-800/80 backdrop-blur-md rounded-xl p-6 shadow-lg border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300"
                variants={itemVariants}
                whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.3)" }}
                whileTap={{ scale: 0.98 }}
              >
                <h3 className="text-xl font-semibold text-white mb-2">{plan.name}</h3>
                <p className="text-gray-400 text-sm mb-4">
                  {new Date(plan.start_date).toLocaleDateString()} -{" "}
                  {new Date(plan.end_date).toLocaleDateString()}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    onClick={() => setSelectedPlan(plan)}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    View Plan
                  </motion.button>
                  <motion.button
                    onClick={() => fetchIngredients(plan.id)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FaShoppingCart /> List
                  </motion.button>
                  <motion.button
                    onClick={() => downloadPdf(plan.id)}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-colors relative"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={loadingPdf[plan.id]}
                  >
                    {loadingPdf[plan.id] ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      <>
                        <FaFilePdf /> PDF
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            ))
          )}
        </motion.div>
      )}

      {/* Meal Plan Details Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gray-850/90 backdrop-blur-lg rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-emerald-500/30"
              variants={modalVariants}
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-3xl font-bold text-emerald-400 tracking-wide">{selectedPlan.name}</h3>
                <motion.button
                  onClick={() => setSelectedPlan(null)}
                  className="text-gray-300 hover:text-emerald-400 transition-colors"
                  whileHover={{ rotate: 90 }}
                >
                  <FaTimes size={28} />
                </motion.button>
              </div>
              <motion.div className="space-y-8" variants={containerVariants} initial="hidden" animate="visible">
                {Array.from(
                  {
                    length:
                      Math.ceil(
                        (new Date(selectedPlan.end_date) - new Date(selectedPlan.start_date)) /
                          (1000 * 60 * 60 * 24)
                      ) + 1,
                  },
                  (_, i) => i + 1
                ).map((day) => (
                  <motion.div
                    key={day}
                    className="bg-gray-800/50 p-6 rounded-xl border border-gray-700/50 shadow-md"
                    variants={itemVariants}
                  >
                    <h4 className="text-xl font-semibold text-emerald-300 mb-4">
                      Day {day} -{" "}
                      {new Date(
                        new Date(selectedPlan.start_date).getTime() + (day - 1) * 86400000
                      ).toLocaleDateString()}
                    </h4>
                    <div className="space-y-4">
                      {selectedPlan.entries.filter((e) => e.day === day).map((entry) => (
                        <motion.div
                          key={entry.meal_type}
                          className="flex items-center bg-gray-900/50 p-4 rounded-lg shadow-sm border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.4 }}
                          whileHover={{ scale: 1.02 }}
                        >
                          <img
                            src={entry.recipe?.image || "https://via.placeholder.com/100?text=No+Image"}
                            alt={entry.recipe?.name || "Recipe"}
                            className="w-20 h-20 object-cover rounded-lg mr-4 shadow-md"
                            onError={(e) => (e.target.src = "https://via.placeholder.com/100?text=No+Image")}
                          />
                          <div className="flex-1">
                            <p className="text-gray-200 text-lg">
                              <span className="capitalize font-medium text-emerald-400">{entry.meal_type}:</span>{" "}
                              <span className="text-gray-100">{entry.recipe?.name || "No recipe selected"}</span>
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ingredients Modal */}
      <AnimatePresence>
          {showIngredients && (
            <motion.div
              className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-gray-850 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-8 shadow-2xl border border-emerald-500/30"
                variants={modalVariants}
              >
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-3xl font-bold text-emerald-400 flex items-center gap-3 tracking-wide">
                    <FaShoppingCart /> Shopping List
                  </h3>
                  <motion.button
                    onClick={() => {
                      setShowIngredients(false);
                      setJiomartLinks([]); // Reset links when closing modal
                    }}
                    className="text-gray-300 hover:text-emerald-400 transition-colors"
                    whileHover={{ rotate: 90 }}
                  >
                    <FaTimes size={28} />
                  </motion.button>
                </div>
                {loadingIngredients ? (
                  <motion.div
                    className="flex flex-col items-center justify-center py-10"
                    variants={loadingVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    <FaSpinner className="text-emerald-400 text-4xl animate-spin" />
                    <p className="text-gray-300 mt-4 text-lg">Fetching your shopping list...</p>
                  </motion.div>
                ) : ingredients.length === 0 ? (
                  <p className="text-gray-300 text-center py-6 text-lg">No ingredients available.</p>
                ) : (
                  <>
                    <motion.ul
                      className="space-y-4"
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                    >
                      {ingredients.map((item, index) => (
                        <motion.li
                          key={index}
                          className="text-gray-200 bg-gray-900 p-4 rounded-lg flex justify-between items-center shadow-sm border border-gray-700/50"
                          variants={itemVariants}
                        >
                          <span className="font-medium text-emerald-300">{item.name}</span>
                          <span className="text-gray-300">
                            {item.quantity} {item.unit}
                          </span>
                        </motion.li>
                      ))}
                    </motion.ul>
                    <motion.button
                      onClick={generateJioMartLinks}
                      className="mt-6 w-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Generate JioMart Links
                    </motion.button>
                    {jiomartLinks.length > 0 && (
                      <motion.div
                        className="mt-4 space-y-2"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-gray-300 text-sm">Click each link to shop on JioMart:</p>
                        {jiomartLinks.map((link, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <FaLink className="text-emerald-400" />
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-emerald-400 underline text-sm break-all"
                            >
                              {ingredients[index].quantity} {ingredients[index].unit} {ingredients[index].name}
                            </a>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
};

export default MealPlannerViewer;