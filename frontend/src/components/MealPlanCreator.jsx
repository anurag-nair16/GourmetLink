import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaSpinner, FaExclamationCircle, FaCoffee, FaUtensils, FaPizzaSlice, FaTimes } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const MealPlannerCreator = ({ onPlanCreated }) => {
  const [formData, setFormData] = useState({ name: "", start_date: "", end_date: "", entries: [] });
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [searchOpen, setSearchOpen] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [activeDay, setActiveDay] = useState(1);
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [formErrors, setFormErrors] = useState({});
  const [mealErrors, setMealErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const searchInputRefs = useRef({});


  const mealTypes = [
    {
      type: "breakfast",
      icon: <FaCoffee />,
      label: "Breakfast",
      description: "Start your day right",
      gradient: "from-yellow-500 to-orange-500"
    },
    {
      type: "lunch",
      icon: <FaUtensils />,
      label: "Lunch",
      description: "Midday energy boost",
      gradient: "from-primary-main to-primary-dark"
    },
    {
      type: "dinner",
      icon: <FaPizzaSlice />,
      label: "Dinner",
      description: "Evening satisfaction",
      gradient: "from-purple-500 to-indigo-500"
    }
  ];

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const token = localStorage.getItem("token");
    setLoadingRecipes(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/features/recipes/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRecipes(response.data);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      toast.error("Failed to fetch recipes. Please try again.");
    } finally {
      setLoadingRecipes(false);
    }
  };

  const calculateDays = () => {
    if (!formData.start_date || !formData.end_date) return 0;
    const start = new Date(formData.start_date);
    const end = new Date(formData.end_date);
    return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) {
      const days = calculateDays();
      if (days <= 0) return;
      const mealTypes = ["breakfast", "lunch", "dinner"];
      const newEntries = [];
      for (let day = 1; day <= days; day++) {
        mealTypes.forEach((mealType) => {
          const existingEntry = formData.entries.find((e) => e.day === day && e.meal_type === mealType);
          newEntries.push(existingEntry || { recipe_id: "", day, meal_type: mealType, servings: 1 });
        });
      }
      setFormData({ ...formData, entries: newEntries });
    }
  }, [formData.start_date, formData.end_date]);

  const updateEntry = (day, mealType, recipeId) => {
    const newEntries = formData.entries.map((entry) =>
      entry.day === day && entry.meal_type === mealType ? { ...entry, recipe_id: recipeId } : entry
    );
    setFormData({ ...formData, entries: newEntries });
    setSearchOpen(null);
    setMealErrors((prev) => ({ ...prev, [`${day}-${mealType}`]: false }));
  };

  const handleSearch = (key, value) => {
    setSearchTerms({ ...searchTerms, [key]: value });
  };

  const filteredRecipes = (key) => {
    const searchTerm = searchTerms[key]?.toLowerCase() || "";
    return recipes
        .filter((recipe) => recipe.recipe.name.toLowerCase().includes(searchTerm))
        .sort((a, b) => 
            (b.average_rating || 0) - (a.average_rating || 0)
        );
  };  

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Plan name is required";
    if (!formData.start_date) errors.start_date = "Start date is required";
    if (!formData.end_date) errors.end_date = "End date is required";
    if (formData.start_date && formData.end_date && new Date(formData.start_date) > new Date(formData.end_date)) {
      errors.end_date = "End date must be after start date";
    }

    const mealErrors = {};
    formData.entries.forEach((entry) => {
      if (!entry.recipe_id) {
        mealErrors[`${entry.day}-${entry.meal_type}`] = "Please select a recipe for this meal.";
      }
    });

    setFormErrors(errors);
    setMealErrors(mealErrors);
    return Object.keys(errors).length === 0 && Object.keys(mealErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill the details before submitting.");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      toast.error("You must be logged in to create a meal plan.");
      setIsSubmitting(false);
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/features/mealplans/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Meal plan created:", response.data);
      toast.success("Meal plan created successfully!");
      setFormData({ name: "", start_date: "", end_date: "", entries: [] });
      setSearchTerms({});
      setSearchOpen(null);
      if (typeof onPlanCreated === "function") {
        onPlanCreated();
      } else {
        navigate("/my-mealplans");
      }
    } catch (error) {
      console.error("Error creating meal plan:", error.response?.data || error.message);
      toast.error("Failed to create meal plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openSearchPopup = (key) => {
    setSearchOpen(key);
    setTimeout(() => {
      if (searchInputRefs.current[key]) {
        searchInputRefs.current[key].focus();
      }
    }, 100);
  };

  const renderStars = (rating) => {
    if (!rating) return <span className="text-gray-400 text-xs">Unrated</span>;
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5 ? "★" : "";
    const emptyStars = 5 - Math.ceil(rating);
    return (
      <span className="text-yellow-400 text-xs">
        {"★".repeat(fullStars)}
        {halfStar}
        {"☆".repeat(emptyStars)} ({rating.toFixed(1)})
      </span>
    );
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const popupVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white text-neutral-800 p-4 flex flex-col">
        <ToastContainer position="top-right" autoClose={3000} theme="light" />
        <motion.div
          className="w-[90%] mx-auto bg-white/95 rounded-xl p-6 sm:p-8 shadow-lg border border-neutral-200 flex-1 flex flex-col relative"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-primary-main tracking-wide mb-2">
              Create Your Meal Plan
            </h2>
            <p className="text-neutral-600">
              Design your perfect week of meals with our easy-to-use planner
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-primary-main/20">
            <div className="text-primary-main text-xl mb-3">🎯</div>
            <h3 className="font-semibold text-neutral-800 mb-2">Plan Smarter</h3>
            <p className="text-neutral-600 text-sm">
              Take control of your nutrition with our intelligent meal planning system. Save time and eat better.
            </p>
          </div>
          <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-primary-main/20">
            <div className="text-primary-main text-xl mb-3">✨</div>
            <h3 className="font-semibold text-neutral-800 mb-2">Eat Better</h3>
            <p className="text-neutral-600 text-sm">
              Choose from our curated collection of healthy, delicious recipes for balanced nutrition.
            </p>
          </div>
          <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-primary-main/20">
            <div className="text-primary-main text-xl mb-3">💪</div>
            <h3 className="font-semibold text-neutral-800 mb-2">Stay Consistent</h3>
            <p className="text-neutral-600 text-sm">
              Build healthy habits with organized meal plans that fit your lifestyle.
            </p>
          </div>
        </div>

        <div className="mb-2">
          <h3 className="text-lg font-semibold text-primary-main mb-1">Plan Details</h3>
          <p className="text-sm text-neutral-600">
            Give your meal plan a name and set its duration
          </p>
        </div>
        {/* Form Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { label: "Plan Name", key: "name", type: "text", placeholder: "e.g., Weekly Feast" },
            { label: "Start Date", key: "start_date", type: "date" },
            { label: "End Date", key: "end_date", type: "date" },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-gray-200 text-sm font-semibold mb-1 block">{field.label}</label>
              <input
                type={field.type}
                value={formData[field.key]}
                onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                placeholder={field.placeholder || ""}
                className={`w-full bg-gray-800/70 text-gray-100 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 ${
                  formErrors[field.key] ? "focus:ring-red-500 border-red-500/50" : "focus:ring-teal-500 border-teal-500/20"
                } border transition-all duration-200`}
              />
              {formErrors[field.key] && (
                <p className="text-red-400 text-xs mt-1 flex items-center">
                  <FaExclamationCircle className="mr-1" /> {formErrors[field.key]}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Day and Meal Navigation */}
        {formData.entries.length > 0 && (
          <div className="flex-1 flex flex-col overflow-y-auto">
            {/* Day Selector */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-teal-400 mb-3">Select Day</h3>
              <div className="w-full overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-800">
                <div className="flex space-x-3 w-max">
                  {Array.from({ length: calculateDays() }, (_, i) => i + 1).map((day) => (
                    <motion.div
                      key={day}
                      className={`flex-shrink-0 w-20 h-20 bg-gray-800/70 rounded-lg p-3 cursor-pointer border ${
                        activeDay === day ? "border-teal-500 bg-teal-900/20" : "border-gray-700 hover:border-teal-500/50"
                      } transition-all duration-200`}
                      onClick={() => {
                        setActiveDay(day);
                        setActiveMeal("breakfast");
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <p className={`text-sm font-medium ${activeDay === day ? "text-teal-400" : "text-gray-300"}`}>
                        Day {day}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(
                          new Date(formData.start_date).getTime() + (day - 1) * 86400000
                        ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-primary-light rounded-xl p-4 mb-6">
              <h4 className="text-primary-main font-semibold mb-2">Quick Tips:</h4>
              <ul className="text-sm text-neutral-700 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-primary-main">•</span>
                  Plan breakfast, lunch, and dinner for each day
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-main">•</span>
                  Consider portion sizes and dietary restrictions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-primary-main">•</span>
                  Mix and match recipes for variety
                </li>
              </ul>
            </div>

            {/* Meal Selector */}
            <div className="mb-6 flex justify-center space-x-4">
              {[
                { type: "breakfast", icon: <FaCoffee />, label: "Breakfast", gradient: "from-yellow-500 to-orange-500" },
                { type: "lunch", icon: <FaUtensils />, label: "Lunch", gradient: "from-green-500 to-teal-500" },
                { type: "dinner", icon: <FaPizzaSlice />, label: "Dinner", gradient: "from-purple-500 to-indigo-500" },
              ].map((meal) => (
                <motion.div
                  key={meal.type}
                  className={`w-16 h-16 rounded-full flex flex-col items-center justify-center cursor-pointer border-2 ${
                    activeMeal === meal.type
                      ? `bg-gradient-to-br ${meal.gradient} border-teal-400 text-white`
                      : "bg-gray-800/70 border-gray-700 text-gray-300 hover:border-teal-500/50"
                  } transition-all duration-200`}
                  onClick={() => setActiveMeal(meal.type)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <div className="text-lg">{meal.icon}</div>
                  <p className="text-xs font-medium">{meal.label}</p>
                </motion.div>
              ))}
            </div>

            {/* Meal Selection Section */}
            <motion.div
              className="bg-gray-850/70 p-4 rounded-xl shadow-lg border border-teal-500/10 mb-6"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`${activeDay}-${activeMeal}`}
            >
              <div>
                <label className="text-gray-200 capitalize text-sm font-semibold mb-2 block">
                  {activeMeal}
                </label>
                <div
                  className={`w-full bg-gray-800/70 text-gray-100 rounded-lg px-4 py-2 flex items-center justify-between cursor-pointer border ${
                    mealErrors[`${activeDay}-${activeMeal}`]
                      ? "border-red-500/50"
                      : "border-teal-500/20 hover:border-teal-500/50"
                  } transition-all duration-200`}
                  onClick={() => openSearchPopup(`${activeDay}-${activeMeal}`)}
                >
                  <span className="truncate text-sm">
                    {recipes.find(
                      (r) =>
                        r.recipe.id ===
                        formData.entries.find((e) => e.day === activeDay && e.meal_type === activeMeal)?.recipe_id
                    )?.recipe.name || `Choose a ${activeMeal} Recipe`}
                  </span>
                  <FaSearch className="text-teal-400" />
                </div>
                {mealErrors[`${activeDay}-${activeMeal}`] && (
                  <p className="text-red-400 text-xs mt-1 flex items-center">
                    <FaExclamationCircle className="mr-1" /> {mealErrors[`${activeDay}-${activeMeal}`]}
                  </p>
                )}
              </div>
            </motion.div>
          </div>
        )}

      <div className="mb-20"> {/* Increased bottom margin to prevent overlap */}
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-neutral-600">Plan Progress</span>
          <span className="text-sm font-medium text-primary-main">
            {formData.entries.length ? 
              Math.round((formData.entries.filter(e => e.recipe_id).length / formData.entries.length) * 100) : 0}%
          </span>
        </div>
        <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary-main rounded-full transition-all duration-500"
            style={{ 
              width: `${formData.entries.length ? 
                Math.round((formData.entries.filter(e => e.recipe_id).length / formData.entries.length) * 100) : 0}%` 
            }}
          />
        </div>
      </div>
      
      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-neutral-200 p-4 z-50">
  <div className="container mx-auto max-w-4xl flex flex-col sm:flex-row items-center justify-between gap-3">
    <div className="text-sm text-neutral-600 order-2 sm:order-1">
      <span className="font-medium text-primary-main">
        {formData.entries.length ? 
          Math.round((formData.entries.filter(e => e.recipe_id).length / formData.entries.length) * 100) : 0}%
      </span> complete
    </div>
    <motion.button
      onClick={handleSubmit}
      className="w-full sm:w-auto bg-primary-main hover:bg-primary-dark text-white 
        py-2.5 px-6 rounded-lg font-semibold transition-colors duration-300 
        disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg
        order-1 sm:order-2"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      disabled={isSubmitting}
    >
      {isSubmitting ? <FaSpinner className="animate-spin" /> : null}
      {isSubmitting ? "Saving Plan..." : "Save Plan"}
    </motion.button>
  </div>
</div>
        {/* Recipe Search Popup */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-30 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSearchOpen(null)}
            >
              <motion.div
                className="bg-gray-900/95 rounded-lg shadow-2xl border border-teal-500/20 w-full max-w-md max-h-[80vh] overflow-y-auto scrollbar-thin scrollbar-thumb-teal-500 scrollbar-track-gray-800"
                variants={popupVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-700/50">
                  <h3 className="text-lg font-semibold text-teal-400">Select Recipe</h3>
                  <FaTimes className="text-gray-400 cursor-pointer" onClick={() => setSearchOpen(null)} />
                </div>
                <input
                  type="text"
                  placeholder="Search recipes..."
                  value={searchTerms[searchOpen] || ""}
                  onChange={(e) => handleSearch(searchOpen, e.target.value)}
                  ref={(el) => (searchInputRefs.current[searchOpen] = el)}
                  className="w-full bg-gray-800/50 text-gray-100 px-4 py-2 border-b border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <div className="p-4">
                  {loadingRecipes ? (
                    <div className="flex justify-center py-4">
                      <FaSpinner className="text-teal-400 text-xl animate-spin" />
                    </div>
                  ) : filteredRecipes(searchOpen).length === 0 ? (
                    <p className="text-gray-400 text-center py-4 text-sm">No recipes found</p>
                  ) : (
                    filteredRecipes(searchOpen).map((recipe) => (
                      <motion.div
                        key={recipe.recipe.id}
                        className="px-3 py-2 text-gray-200 hover:bg-teal-600/20 cursor-pointer rounded-lg transition-colors duration-150 flex justify-between items-center"
                        onClick={() => updateEntry(activeDay, activeMeal, recipe.recipe.id)}
                        whileHover={{ scale: 1.02 }}
                      >
                        <span>{recipe.recipe.name}</span>
                        {renderStars(recipe.average_rating)}
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default MealPlannerCreator;