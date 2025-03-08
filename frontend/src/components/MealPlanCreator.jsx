import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaSearch, FaSpinner } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const MealPlannerCreator = ({ onPlanCreated }) => {
  const [formData, setFormData] = useState({ name: "", start_date: "", end_date: "", entries: [] });
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [searchOpen, setSearchOpen] = useState({});
  const [searchTerms, setSearchTerms] = useState({});
  const [activeDay, setActiveDay] = useState(1); // Track the active day
  const [activeMeal, setActiveMeal] = useState("breakfast"); // Track the active meal type
  const navigate = useNavigate();
  const dropdownRefs = useRef({});

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

  const generateEntries = () => {
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
  };

  useEffect(() => {
    if (formData.start_date && formData.end_date) generateEntries();
  }, [formData.start_date, formData.end_date]);

  const updateEntry = (day, mealType, recipeId) => {
    const newEntries = formData.entries.map((entry) =>
      entry.day === day && entry.meal_type === mealType ? { ...entry, recipe_id: recipeId } : entry
    );
    setFormData({ ...formData, entries: newEntries });
    setSearchOpen({ ...searchOpen, [`${day}-${mealType}`]: false });
  };

  const handleSearch = (key, value) => {
    setSearchTerms({ ...searchTerms, [key]: value });
  };

  const filteredRecipes = (key) => {
    const searchTerm = searchTerms[key]?.toLowerCase() || "";
    return recipes.filter((recipe) => recipe.recipe.name.toLowerCase().includes(searchTerm));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in.");
      return;
    }
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/features/mealplans/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log("Meal plan created:", response.data);
      setFormData({ name: "", start_date: "", end_date: "", entries: [] });
      setSearchTerms({});
      setSearchOpen({});
      if (typeof onPlanCreated === "function") {
        onPlanCreated();
      } else {
        navigate("/my-mealplans");
      }
    } catch (error) {
      console.error("Error creating meal plan:", error.response?.data || error.message);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs.current).forEach((key) => {
        if (dropdownRefs.current[key] && !dropdownRefs.current[key].contains(event.target)) {
          setSearchOpen((prev) => ({ ...prev, [key]: false }));
        }
      });
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-gray-100 p-6 flex flex-col">
      <motion.div
        className="max-w-5xl mx-auto bg-gray-850/90 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-emerald-500/30 relative flex-1 flex flex-col"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header with Title and Save Button */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-4xl font-extrabold text-emerald-400 tracking-tight">
            Create Your Meal Plan
          </h2>
          <motion.button
            onClick={handleSubmit}
            className="bg-emerald-600 hover:bg-emerald-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Save Meal Plan
          </motion.button>
        </div>

        {/* Plan Name and Dates */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Plan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekly Feast"
              className="w-full bg-gray-700/80 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">Start Date</label>
            <input
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              className="w-full bg-gray-700/80 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
          <div>
            <label className="text-gray-300 text-sm font-medium mb-2 block">End Date</label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
              className="w-full bg-gray-700/80 text-gray-100 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Day and Meal Navigation */}
        {formData.entries.length > 0 && (
          <div className="flex-1 flex flex-col">
            {/* Day Tabs */}
            <div className="flex border-b border-gray-700 mb-4 overflow-x-auto">
              {Array.from({ length: calculateDays() }, (_, i) => i + 1).map((day) => (
                <motion.button
                  key={day}
                  className={`px-4 py-2 text-sm font-medium ${
                    activeDay === day
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  onClick={() => {
                    setActiveDay(day);
                    setActiveMeal("breakfast"); // Reset to breakfast when switching days
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Day {day} -{" "}
                  {new Date(
                    new Date(formData.start_date).getTime() + (day - 1) * 86400000
                  ).toLocaleDateString()}
                </motion.button>
              ))}
            </div>

            {/* Meal Tabs */}
            <div className="flex border-b border-gray-700 mb-6">
              {["breakfast", "lunch", "dinner"].map((mealType) => (
                <motion.button
                  key={mealType}
                  className={`px-6 py-2 text-sm font-medium capitalize ${
                    activeMeal === mealType
                      ? "text-emerald-400 border-b-2 border-emerald-400"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                  onClick={() => setActiveMeal(mealType)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {mealType}
                </motion.button>
              ))}
            </div>

            {/* Active Meal Section */}
            <motion.div
              className="bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-700/50"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              key={`${activeDay}-${activeMeal}`} // Ensures animation on tab switch
            >
              <div>
                <label className="text-gray-300 capitalize text-sm font-medium mb-2 block">
                  {activeMeal}
                </label>
                <div className="relative" ref={(el) => (dropdownRefs.current[`${activeDay}-${activeMeal}`] = el)}>
                  <div
                    className="w-full bg-gray-700/80 text-gray-100 rounded-lg px-4 py-3 flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setSearchOpen({
                        ...searchOpen,
                        [`${activeDay}-${activeMeal}`]: !searchOpen[`${activeDay}-${activeMeal}`],
                      })
                    }
                  >
                    <span>
                      {recipes.find(
                        (r) =>
                          r.recipe.id ===
                          formData.entries.find(
                            (e) => e.day === activeDay && e.meal_type === activeMeal
                          )?.recipe_id
                      )?.recipe.name || `Select ${activeMeal}`}
                    </span>
                    <FaSearch className="text-gray-400" />
                  </div>
                  <AnimatePresence>
                    {searchOpen[`${activeDay}-${activeMeal}`] && (
                      <motion.div
                        className="absolute z-10 w-full bg-gray-800/90 backdrop-blur-md rounded-lg mt-2 shadow-lg border border-emerald-500/30 max-h-60 overflow-y-auto"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                      >
                        <input
                          type="text"
                          placeholder="Search recipes..."
                          value={searchTerms[`${activeDay}-${activeMeal}`] || ""}
                          onChange={(e) => handleSearch(`${activeDay}-${activeMeal}`, e.target.value)}
                          className="w-full bg-gray-700/50 text-gray-100 rounded-t-lg px-4 py-3 border-b border-gray-700 focus:outline-none sticky top-0"
                          onClick={(e) => e.stopPropagation()}
                        />
                        {loadingRecipes ? (
                          <div className="flex justify-center py-4">
                            <FaSpinner className="text-emerald-400 text-2xl animate-spin" />
                          </div>
                        ) : filteredRecipes(`${activeDay}-${activeMeal}`).length === 0 ? (
                          <p className="text-gray-400 text-center py-4">No recipes found</p>
                        ) : (
                          filteredRecipes(`${activeDay}-${activeMeal}`).map((recipe) => (
                            <motion.div
                              key={recipe.recipe.id}
                              className="px-4 py-3 text-gray-200 hover:bg-emerald-600/20 cursor-pointer transition-colors"
                              onClick={() => updateEntry(activeDay, activeMeal, recipe.recipe.id)}
                              whileHover={{ scale: 1.02 }}
                            >
                              {recipe.recipe.name}
                            </motion.div>
                          ))
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
            {/* Spacer for Dropdown */}
            <div className="h-64 flex-shrink-0" />
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default MealPlannerCreator;