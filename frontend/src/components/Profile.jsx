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
      <div className="min-h-screen bg-gradient-to-br from-primary-light to-white flex justify-center items-center">
        <div className="text-primary-main">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white text-neutral-800">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-primary-main/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-60 h-60 bg-primary-main/5 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.4, 0.3] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <main className="container mx-auto px-4 sm:px-6 py-12 relative z-10">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-white rounded-3xl shadow-lg p-8 mb-12 border border-neutral-200 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
            <div className="relative">
              <Avatar
                name={profileData.username}
                src={profileData.profile_image}
                size="140"
                round={true}
                className="border-4 border-primary-main shadow-lg transform hover:scale-105 transition-all duration-300"
              />
              <motion.div
                className="absolute -bottom-2 -right-2 bg-primary-main text-white rounded-full p-2"
                whileHover={{ scale: 1.1 }}
              >
                <FaEdit size={16} />
              </motion.div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-neutral-800 mb-2">{profileData.username}</h2>
              <p className="text-neutral-600 mb-4">{profileData.email}</p>
              <div className="flex justify-center md:justify-start gap-6 text-neutral-600">
                <div className="flex items-center gap-2">
                  <FaUtensils className="text-primary-main" />
                  <span>{userRecipes.length} Recipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeart className="text-red-400" />
                  <span>{favouriteRecipes.length} Favorites</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaShoppingCart className="text-primary-main" />
                  <span>{mealPlans.length} Plans</span>
                </div>
              </div>
              <Link
                to="/submit-recipe"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-primary-main text-white rounded-full font-semibold hover:bg-primary-dark transition-all duration-300"
              >
                <FaPlus /> Add New Recipe
              </Link>
            </div>
          </div>
        </motion.section>

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
                  ? "bg-primary-main text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
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
                className="text-3xl font-bold text-neutral-800 mb-8 text-center"
              >
                Your Recipes
              </motion.h2>
              {userRecipes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-white rounded-2xl p-12 text-neutral-600 shadow-inner border border-neutral-200"
                >
                  <FaUtensils className="text-primary-main text-4xl mx-auto mb-4" />
                  <p className="text-lg">You haven’t shared any recipes yet. Start cooking!</p>
                  <Link
                    to="/submit-recipe"
                    className="mt-4 inline-block px-6 py-3 bg-primary-main text-white rounded-full hover:bg-primary-dark transition-all duration-300"
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
                      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-lg transition-all duration-300 border border-neutral-200"
                    >
                      <div className="relative aspect-video">
                        {recipe.image && (
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        <span className="absolute bottom-2 right-2 bg-primary-main text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-neutral-800 line-clamp-1">{recipe.name}</h3>
                        <p className="text-neutral-600 text-sm line-clamp-2">{recipe.description}</p>
                        <div className="flex justify-between items-center text-neutral-600">
                          <span className="flex items-center gap-2">
                            <FaThumbsUp className="text-primary-main" />
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
                className="text-3xl font-bold text-neutral-800 mb-8 text-center"
              >
                Your Favourites
              </motion.h2>
              {favouriteRecipes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-white rounded-2xl p-12 text-neutral-600 shadow-inner border border-neutral-200"
                >
                  <FaHeart className="text-red-400 text-4xl mx-auto mb-4" />
                  <p className="text-lg">No favorite recipes yet. Explore and save some!</p>
                  <Link
                    to="/posts"
                    className="mt-4 inline-block px-6 py-3 bg-primary-main text-white rounded-full hover:bg-primary-dark transition-all duration-300"
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
                      className="bg-white rounded-xl shadow-md overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-lg transition-all duration-300 border border-neutral-200"
                    >
                      <div className="relative aspect-video">
                        {recipe.image && (
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        <span className="absolute bottom-2 right-2 bg-primary-main text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                        <span className="absolute top-2 right-2 bg-red-500/20 text-red-300 p-1 rounded-full">
                          <FaHeart size={16} />
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-neutral-800 line-clamp-1">{recipe.name}</h3>
                        <p className="text-neutral-600 text-sm line-clamp-2">{recipe.description}</p>
                        <div className="flex justify-between items-center text-neutral-600">
                          <span className="flex items-center gap-2">
                            <FaThumbsUp className="text-primary-main" />
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
                className="text-3xl font-bold text-neutral-800 mb-8 text-center"
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
                  <FaSpinner className="text-primary-main text-5xl animate-spin" />
                  <p className="text-neutral-600 mt-4 text-lg">Loading your meal plans...</p>
                </motion.div>
              ) : mealPlans.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-white rounded-2xl p-12 text-neutral-600 shadow-inner border border-neutral-200"
                >
                  <FaShoppingCart className="text-primary-main text-4xl mx-auto mb-4" />
                  <p className="text-lg">No meal plans yet. Create one to get started!</p>
                  <Link
                    to="/meal-planner"
                    className="mt-4 inline-block px-6 py-3 bg-primary-main text-white rounded-full hover:bg-primary-dark transition-all duration-300"
                  >
                    Add Meal Plan
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <motion.div
                    className="flex justify-end"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    <Link
                      to="/meal-planner"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-primary-main text-white rounded-full font-semibold hover:bg-primary-dark transition-all duration-300"
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
                        className="bg-white rounded-xl p-6 shadow-md border border-neutral-200 hover:border-primary-main/50 transition-all duration-300"
                        variants={itemVariants}
                        whileHover={{ scale: 1.03, boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <h3 className="text-xl font-semibold text-neutral-800 mb-2">{plan.name}</h3>
                        <p className="text-neutral-600 text-sm mb-4">
                          {new Date(plan.start_date).toLocaleDateString()} -{" "}
                          {new Date(plan.end_date).toLocaleDateString()}
                        </p>
                        <div className="flex gap-3">
                          <motion.button
                            onClick={() => setSelectedPlan(plan)}
                            className="flex-1 bg-primary-main hover:bg-primary-dark text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
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

              <AnimatePresence>
                {selectedPlan && (
                  <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="bg-white rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-8 shadow-xl border border-neutral-200"
                      variants={modalVariants}
                    >
                      <div className="flex justify-between items-center mb-8">
                        <h3 className="text-3xl font-bold text-neutral-800 tracking-wide">{selectedPlan.name}</h3>
                        <motion.button
                          onClick={() => setSelectedPlan(null)}
                          className="text-neutral-600 hover:text-primary-main transition-colors"
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
                            className="bg-neutral-50 p-6 rounded-xl border border-neutral-200 shadow-md"
                            variants={itemVariants}
                          >
                            <h4 className="text-xl font-semibold text-neutral-800 mb-4">
                              Day {day} -{" "}
                              {new Date(
                                new Date(selectedPlan.start_date).getTime() + (day - 1) * 86400000
                              ).toLocaleDateString()}
                            </h4>
                            <div className="space-y-4">
                              {selectedPlan.entries.filter((e) => e.day === day).map((entry) => (
                                <motion.div
                                  key={entry.meal_type}
                                  className="flex items-center bg-white p-4 rounded-lg shadow-sm border border-neutral-200 hover:border-primary-main/30 transition-all duration-300"
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
                                    <p className="text-neutral-800 text-lg">
                                      <span className="capitalize font-medium text-primary-main">{entry.meal_type}:</span>{" "}
                                      <span className="text-neutral-800">{entry.recipe?.name || "No recipe selected"}</span>
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

              <AnimatePresence>
                {showIngredients && (
                  <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <motion.div
                      className="bg-white rounded-xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-8 shadow-xl border border-neutral-200"
                      variants={modalVariants}
                    >
                      <div className="flex justify-between items-center mb-6">
                        <h3 className="text-3xl font-bold text-neutral-800 flex items-center gap-3 tracking-wide">
                          <FaShoppingCart /> Shopping List
                        </h3>
                        <motion.button
                          onClick={() => setShowIngredients(false)}
                          className="text-neutral-600 hover:text-primary-main transition-colors"
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
                          <FaSpinner className="text-primary-main text-4xl animate-spin" />
                          <p className="text-neutral-600 mt-4 text-lg">Fetching your shopping list...</p>
                        </motion.div>
                      ) : ingredients.length === 0 ? (
                        <p className="text-neutral-600 text-center py-6 text-lg">No ingredients available.</p>
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
                              className="text-neutral-800 bg-neutral-50 p-4 rounded-lg flex justify-between items-center shadow-sm border border-neutral-200"
                              variants={itemVariants}
                            >
                              <span className="font-medium text-primary-main">{item.name}</span>
                              <span className="text-neutral-600">
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