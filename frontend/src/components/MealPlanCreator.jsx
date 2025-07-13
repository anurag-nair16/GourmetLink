import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaSearch, FaSpinner, FaExclamationCircle, FaCoffee, FaUtensils, 
  FaPizzaSlice, FaTimes, FaRobot, FaArrowRight, FaArrowLeft, 
  FaCalendar, FaMagic, FaEdit, FaCheck, FaUser, FaClock
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AIMealPlanner from "./AIMealPlanAssistant";

const MealPlannerCreator = ({ onPlanCreated }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({ 
    name: "", start_date: "", end_date: "", entries: [] 
  });
  const [recipes, setRecipes] = useState([]);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [searchOpen, setSearchOpen] = useState(null);
  const [searchTerms, setSearchTerms] = useState({});
  const [activeDay, setActiveDay] = useState(1);
  const [activeMeal, setActiveMeal] = useState("breakfast");
  const [formErrors, setFormErrors] = useState({});
  const [mealErrors, setMealErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    allergies: [], dietaryRestrictions: '', cuisinePreference: '', calories: '',
  });
  
  const navigate = useNavigate();
  const searchInputRefs = useRef({});
  const currentUser = "anurag-nair16";
  const currentDateTime = "2025-04-24 17:07:41";

  const PageHeader = () => (
    <div className="mb-8">
      <div className="text-center mb-6">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Smart Meal Planner</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create personalized meal plans effortlessly with our AI-powered planner.
        </p>
      </div>
      
    </div>
  );

  useEffect(() => {
    fetchRecipes();
  }, []);

  const fetchRecipes = async () => {
    const token = localStorage.getItem("token");
    setLoadingRecipes(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/features/recipes/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // console.log("Fetched recipes:", response.data);
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
          const existingEntry = formData.entries.find(
            (e) => e.day === day && e.meal_type === mealType
          );
          newEntries.push(
            existingEntry || { recipe_id: "", day, meal_type: mealType, servings: 1 }
          );
        });
      }
      setFormData({ ...formData, entries: newEntries });
    }
  }, [formData.start_date, formData.end_date]);

  const handleAIGenerated = (plan) => {
    setFormData(prev => ({
      ...prev,
      entries: plan.entries
    }));
    setActiveDay(1);
    setActiveMeal('breakfast');
    setCurrentStep(1);
    toast.success('AI has generated your meal plan! Feel free to make any adjustments.');
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Plan name is required";
    if (!formData.start_date) errors.start_date = "Start date is required";
    if (!formData.end_date) errors.end_date = "End date is required";
    if (formData.start_date && formData.end_date && 
        new Date(formData.start_date) > new Date(formData.end_date)) {
      errors.end_date = "End date must be after start date";
    }

    const mealErrors = {};
    formData.entries.forEach((entry) => {
      if (!entry.recipe_id) {
        mealErrors[`${entry.day}-${entry.meal_type}`] = true;
      }
    });

    setFormErrors(errors);
    setMealErrors(mealErrors);
    return Object.keys(errors).length === 0 && Object.keys(mealErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Please fill all required meals before submitting.");
      return;
    }
    setIsSubmitting(true);
    const token = localStorage.getItem("token");
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/features/mealplans/`, 
        formData, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Meal plan created successfully!");
      if (typeof onPlanCreated === "function") {
        onPlanCreated();
      } else {
        navigate("/my-mealplans");
      }
    } catch (error) {
      console.error("Error creating meal plan:", error);
      toast.error("Failed to create meal plan. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPlanBasics = () => (
    <div className="max-w-4xl mx-auto">
      <StepHeader 
        step={1}
        title="Plan Setup"
        description="Let's start by naming your plan and selecting your desired date range."
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <InfoCard
          icon="📅"
          title="Flexible Planning"
          description="Create meal plans for any duration - from a single day to multiple weeks."
        />
        <InfoCard
          icon="🎯"
          title="Smart Selection"
          description="Choose from our curated collection of recipes or let AI create a balanced plan."
        />
        <InfoCard
          icon="✨"
          title="AI Powered"
          description="Use our AI assistant to generate personalized meal plans based on your preferences."
        />
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="space-y-6">
          <div>
            <label className="text-gray-700 text-sm font-medium mb-2 block">Plan Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g., Weekly Feast"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main"
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 block">Start Date</label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main"
                min={new Date().toISOString().split('T')[0]}
              />
              {formErrors.start_date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.start_date}</p>
              )}
            </div>
            <div>
              <label className="text-gray-700 text-sm font-medium mb-2 block">End Date</label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-main"
                min={formData.start_date || new Date().toISOString().split('T')[0]}
              />
              {formErrors.end_date && (
                <p className="text-red-500 text-xs mt-1">{formErrors.end_date}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6">
            <button
              onClick={() => {
                if (!formData.start_date || !formData.end_date) {
                  toast.warning('Please select dates first');
                  return;
                }
                setShowAIPlanner(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r 
                from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg shadow-lg 
                hover:shadow-xl transition-all duration-300"
            >
              <FaMagic className="text-lg" />
              Use AI Assistant
            </button>

            <button
              onClick={() => {
                if (!formData.name || !formData.start_date || !formData.end_date) {
                  toast.warning('Please fill in all fields');
                  return;
                }
                setCurrentStep(1);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary-main 
                text-white px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Continue to Meal Selection
              <FaArrowRight />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderMealSelection = () => (
    <div className="max-w-6xl mx-auto">
      <StepHeader 
        step={2}
        title="Select Your Meals"
        description="Choose the perfect recipes for each meal of your plan."
      />
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        {/* Days navigation - Now horizontal at the top */}
        <div className="mb-8">
          <h4 className="font-medium text-gray-700 mb-4">Select Day</h4>
          <div className="flex overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
            <div className="flex gap-3">
              {Array.from({ length: calculateDays() }, (_, i) => i + 1).map((day) => (
                <button
                  key={day}
                  onClick={() => setActiveDay(day)}
                  className={`flex-shrink-0 px-6 py-4 rounded-lg transition-all duration-200 ${
                    activeDay === day
                      ? "bg-primary-main text-white shadow-md"
                      : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <div className="font-medium">Day {day}</div>
                  <div className="text-xs opacity-75">
                    {new Date(
                      new Date(formData.start_date).getTime() + (day - 1) * 86400000
                    ).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
  
        {/* Meals section - Now takes full width */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formData.entries
            .filter(entry => entry.day === activeDay)
            .map((entry) => (
              <div
                key={`${entry.day}-${entry.meal_type}`}
                className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-4">
                  {entry.meal_type === "breakfast" && <FaCoffee className="text-yellow-500 text-xl" />}
                  {entry.meal_type === "lunch" && <FaUtensils className="text-green-500 text-xl" />}
                  {entry.meal_type === "dinner" && <FaPizzaSlice className="text-purple-500 text-xl" />}
                  <h4 className="font-medium text-gray-700 capitalize">
                    {entry.meal_type}
                  </h4>
                </div>
                
                <button
                  onClick={() => setSearchOpen(`${entry.day}-${entry.meal_type}`)}
                  className={`w-full p-4 rounded-xl text-left transition-all duration-200 ${
                    entry.recipe_id
                      ? "bg-primary-light text-primary-dark hover:bg-primary-light/80"
                      : "bg-white text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {entry.recipe_id
                    ? recipes.find(r => r.id === entry.recipe_id)?.name
                    : `Select ${entry.meal_type}`}
                </button>
                
                {entry.recipe_id && (
                  <div className="mt-3 text-sm text-gray-500">
                    Click to change recipe
                  </div>
                )}
              </div>
            ))}
        </div>
  
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(0)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-main transition-colors"
          >
            <FaArrowLeft /> Back to Plan Setup
          </button>
          <button
            onClick={() => setCurrentStep(2)}
            className="flex items-center gap-2 bg-primary-main text-white px-6 py-3 rounded-lg
              hover:bg-primary-dark transition-colors"
          >
            Review Plan <FaArrowRight />
          </button>
        </div>
      </div>
    </div>
  );

  const StepHeader = ({ step, title, description }) => (
    <div className="mb-6 text-center">
      <div className="text-primary-main/80 text-sm font-medium mb-2">Step {step} of 3</div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600">{description}</p>
    </div>
  );
  
  const InfoCard = ({ icon, title, description }) => (
    <div className="bg-white/90 p-6 rounded-xl shadow-sm border border-primary-main/10 hover:border-primary-main/30 transition-all duration-300">
      <div className="text-primary-main text-xl mb-3">{icon}</div>
      <h3 className="font-semibold text-neutral-800 mb-2">{title}</h3>
      <p className="text-neutral-600 text-sm leading-relaxed">{description}</p>
    </div>
  );
  
  const StepIndicator = ({ currentStep, totalSteps }) => (
    <div className="flex items-center justify-center space-x-2 mb-6">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div
          key={i}
          className={`h-2 rounded-full transition-all duration-300 ${
            i === currentStep ? 'w-8 bg-primary-main' : 'w-2 bg-gray-300'
          }`}
        />
      ))}
    </div>
  );

  const renderReview = () => (
    <div className="max-w-5xl mx-auto">
      <StepHeader 
        step={3}
        title="Review Your Plan"
        description="Review your meal plan and make any final adjustments before saving."
      />
      
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="bg-primary-light/20 rounded-xl p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-primary-main rounded-full text-white">
              <FaCalendar />
            </div>
            <div>
              <h4 className="font-medium text-gray-700">{formData.name}</h4>
              <p className="text-gray-600 text-sm">
                {new Date(formData.start_date).toLocaleDateString()} - {new Date(formData.end_date).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {Array.from({ length: calculateDays() }, (_, i) => i + 1).map((day) => (
            <div key={day} className="bg-gray-50 rounded-xl p-6 hover:shadow-md transition-all duration-300">
              <h4 className="font-medium text-gray-700 mb-4">
                Day {day} - {new Date(
                  new Date(formData.start_date).getTime() + (day - 1) * 86400000
                ).toLocaleDateString("en-US", { weekday: 'long', month: "long", day: "numeric" })}
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {formData.entries
                  .filter(entry => entry.day === day)
                  .map((entry) => {
                    const recipe = recipes.find(r => r.id === entry.recipe_id)  ;
                    return (
                      <div 
                        key={`${entry.day}-${entry.meal_type}`}
                        className="bg-white rounded-lg p-4 shadow-sm"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          {entry.meal_type === "breakfast" && <FaCoffee className="text-yellow-500" />}
                          {entry.meal_type === "lunch" && <FaUtensils className="text-green-500" />}
                          {entry.meal_type === "dinner" && <FaPizzaSlice className="text-purple-500" />}
                          <p className="text-sm text-gray-500 capitalize">{entry.meal_type}</p>
                        </div>
                        <p className="font-medium text-gray-700">
                          {recipe?.name || "No meal selected"}
                        </p>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center pt-8">
          <button
            onClick={() => setCurrentStep(1)}
            className="flex items-center gap-2 text-gray-600 hover:text-primary-main transition-colors"
          >
            <FaArrowLeft /> Back to Meal Selection
          </button>
          
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-primary-main text-white px-8 py-4 rounded-xl
              hover:bg-primary-dark transition-all duration-300 disabled:opacity-50 shadow-lg"
          >
            {isSubmitting ? (
              <>
                <FaSpinner className="animate-spin" />
                Saving Plan...
              </>
            ) : (
              <>
                <FaCheck />
                Save Plan
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      <div className="max-w-7xl mx-auto">
        <PageHeader />
        <StepIndicator currentStep={currentStep} totalSteps={3} />
        
        {currentStep === 0 && renderPlanBasics()}
        {currentStep === 1 && renderMealSelection()}
        {currentStep === 2 && renderReview()}
      </div>

      <AIMealPlanner
        isOpen={showAIPlanner}
        onClose={() => setShowAIPlanner(false)}
        startDate={formData.start_date}
        endDate={formData.end_date}
        recipes={recipes}
        currentPreferences={userPreferences}
        onPlanGenerated={handleAIGenerated}
      />

      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSearchOpen(null)}
          >
            <motion.div
              className="bg-white rounded-xl shadow-xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center p-4 border-b">
                <h3 className="text-lg font-semibold text-gray-700">Select Recipe</h3>
                <button onClick={() => setSearchOpen(null)}>
                  <FaTimes className="text-gray-400" />
                </button>
              </div>
              
              <div className="p-4">
                <div className="relative mb-4">
                  <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search recipes..."
                    value={searchTerms[searchOpen] || ""}
                    onChange={(e) => setSearchTerms({
                      ...searchTerms,
                      [searchOpen]: e.target.value
                    })}
                    className="w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 
                      focus:ring-primary-main focus:border-transparent"
                  />
                </div>
                
                <div className="max-h-[60vh] overflow-y-auto">
                  {recipes
                    .filter(recipe => 
                      recipe.name
                        .toLowerCase()
                        .includes((searchTerms[searchOpen] || "").toLowerCase())
                    )
                    .map(recipe => (
                      <button
                        key={recipe.id}
                        onClick={() => {
                          const [day, mealType] = searchOpen.split("-");
                          const newEntries = formData.entries.map(entry =>
                            entry.day === parseInt(day) && entry.meal_type === mealType
                              ? { ...entry, recipe_id: recipe.id }
                              : entry
                          );
                          setFormData({ ...formData, entries: newEntries });
                          setSearchOpen(null);
                        }}
                        className="w-full text-left p-4 hover:bg-gray-50 rounded-lg 
                          transition-colors duration-200 border-b border-gray-100 last:border-0"
                      >
                        <p className="font-medium text-gray-700">{recipe.recipe.name}</p>
                        <div className="text-yellow-400 text-sm mt-1">
                          {"★".repeat(Math.round(recipe.average_rating || 0))}
                          {"☆".repeat(5 - Math.round(recipe.average_rating || 0))}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealPlannerCreator;