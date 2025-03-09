import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Avatar from "react-avatar";
import { FaClock, FaEdit, FaUtensils, FaStar, FaPlus, FaHeart, FaThumbsUp, FaShoppingCart, FaFilePdf, FaTimes, FaSpinner } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

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

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [userRecipes, setUserRecipes] = useState([]);
  const [favouriteRecipes, setFavouriteRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMealPlans, setLoadingMealPlans] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState({});
  const [activeSection, setActiveSection] = useState("recipes");
  const navigate = useNavigate();
  const sectionRefs = useRef([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const token = localStorage.getItem("token");
        const [profileResponse, recipesResponse, favouritesResponse, mealPlansResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/recipes/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/favourites/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/features/mealplans/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);

        setProfileData(profileResponse.data);
        setUserRecipes(recipesResponse.data);
        setFavouriteRecipes(favouritesResponse.data);
        setMealPlans(mealPlansResponse.data);
        setLoading(false);
        setLoadingMealPlans(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
        setLoadingMealPlans(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  const fetchIngredients = async (planId) => {
    const token = localStorage.getItem("token");
    const cachedData = getCachedIngredients(planId);
    if (cachedData) {
      setIngredients(cachedData);
      setShowIngredients(true);
      return;
    }

    setLoadingIngredients(true);
    setShowIngredients(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/features/mealplans/${planId}/ingredients/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ingredientsData = response.data.items;
      setCachedIngredients(planId, ingredientsData);
      setIngredients(ingredientsData);
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      setIngredients([]);
    } finally {
      setLoadingIngredients(false);
    }
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

  const sections = [
    { id: "recipes", label: "Your Recipes", icon: <FaUtensils /> },
    { id: "favourites", label: "Favourites", icon: <FaHeart /> },
    { id: "mealplans", label: "Meal Plans", icon: <FaShoppingCart /> },
  ];

  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };
  const loadingVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.3 } } };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-emerald-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-teal-900 text-white overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-12 relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-850 rounded-3xl shadow-2xl p-8 mb-12 border border-emerald-500/20 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
            <div className="relative">
              <Avatar
                name={profileData.username}
                src={profileData.profile_image}
                size="140"
                round={true}
                className="border-4 border-emerald-400 shadow-lg transform hover:scale-105 transition-all duration-300"
              />
              <motion.div
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-2"
                whileHover={{ scale: 1.1 }}
              >
                <FaEdit size={16} />
              </motion.div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{profileData.username}</h2>
              <p className="text-gray-400 mb-4">{profileData.email}</p>
              <div className="flex justify-center md:justify-start gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <FaUtensils className="text-emerald-400" />
                  <span>{userRecipes.length} Recipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeart className="text-red-400" />
                  <span>{favouriteRecipes.length} Favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaShoppingCart className="text-teal-400" />
                  <span>{mealPlans.length} Plans</span>
                </div>
              </div>
              <Link
                to="/submit-recipe"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-all duration-300"
              >
                <FaPlus /> Add New Recipe
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Adjusted Section Navigation for Mobile */}
        <div className="relative flex justify-center gap-4 mb-12 max-w-2xl mx-auto">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              ref={(el) => (sectionRefs.current[index] = el)}
              onClick={() => setActiveSection(section.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {section.icon}
              {section.label}
            </motion.button>
          ))}
        </div>

        <section className="max-w-7xl mx-auto">
          {activeSection === "recipes" && (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-3xl font-bold text-emerald-400 mb-8 text-center"
              >
                Your Recipes
              </motion.h2>
              {userRecipes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-gray-800 rounded-2xl p-12 text-gray-400 shadow-inner"
                >
                  <FaUtensils className="text-emerald-400 text-4xl mx-auto mb-4" />
                  <p className="text-lg">You haven’t shared any recipes yet. Start cooking!</p>
                  <Link
                    to="/submit-recipe"
                    className="mt-4 inline-block px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300"
                  >
                    Create Your First Recipe
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleRecipeClick(recipe.id)}
                      className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-emerald-500/20 transition-all duration-300"
                    >
                      <div className="relative aspect-video">
                        {recipe.image && (
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        <span className="absolute bottom-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{recipe.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{recipe.description}</p>
                        <div className="flex justify-between items-center text-gray-300">
                          <span className="flex items-center gap-2">
                            <FaThumbsUp className="text-emerald-400" />
                            {recipe.post?.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            {recipe.post?.average_rating || "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "favourites" && (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-3xl font-bold text-emerald-400 mb-8 text-center"
              >
                Your Favourites
              </motion.h2>
              {favouriteRecipes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-gray-800 rounded-2xl p-12 text-gray-400 shadow-inner"
                >
                  <FaHeart className="text-red-400 text-4xl mx-auto mb-4" />
                  <p className="text-lg">No favorite recipes yet. Explore and save some!</p>
                  <Link
                    to="/posts"
                    className="mt-4 inline-block px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300"
                  >
                    Discover Recipes
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favouriteRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleRecipeClick(recipe.id)}
                      className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-emerald-500/20 transition-all duration-300"
                    >
                      <div className="relative aspect-video">
                        {recipe.image && (
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        <span className="absolute bottom-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                        <span className="absolute top-2 right-2 bg-red-500/20 text-red-300 p-1 rounded-full">
                          <FaHeart size={16} />
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">{recipe.name}</h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{recipe.description}</p>
                        <div className="flex justify-between items-center text-gray-300">
                          <span className="flex items-center gap-2">
                            <FaThumbsUp className="text-emerald-400" />
                            {recipe.post?.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            {recipe.post?.average_rating || "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "mealplans" && (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-3xl font-bold text-emerald-400 mb-8 text-center"
              >
                Your Meal Plans
              </motion.h2>
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
              ) : mealPlans.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-gray-800 rounded-2xl p-12 text-gray-400 shadow-inner"
                >
                  <FaShoppingCart className="text-teal-400 text-4xl mx-auto mb-4" />
                  <p className="text-lg">No meal plans yet. Create one to get started!</p>
                  <Link
                    to="/meal-planner"
                    className="mt-4 inline-block px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300"
                  >
                    Add Meal Plan
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {/* Add Meal Plan Button */}
                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Link
                      to="/meal-planner"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-all duration-300"
                    >
                      <FaPlus /> Add Meal Plan
                    </Link>
                  </motion.div>

                  <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {mealPlans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        className="bg-gray-800 rounded-2xl p-6 shadow-lg border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300"
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
                    ))}
                  </motion.div>
                </div>
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
                      className="bg-gray-850 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-2xl border border-emerald-500/30"
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
                            className="bg-gray-800 p-6 rounded-xl border border-gray-700/50 shadow-md"
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
                                  className="flex items-center bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-700/50 hover:border-emerald-500/30 transition-all duration-300"
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
                          onClick={() => setShowIngredients(false)}
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
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;