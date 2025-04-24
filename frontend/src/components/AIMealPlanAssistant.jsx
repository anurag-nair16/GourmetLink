// components/AIMealPlanner.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaRobot, FaMagic, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast } from 'react-toastify';
import axios from 'axios';

const AIMealPlanner = ({ 
  isOpen, 
  onClose, 
  onPlanGenerated, 
  startDate, 
  endDate,
  recipes,
  currentPreferences
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState(currentPreferences || {
    dietaryRestrictions: '',
    cuisinePreference: '',
    calories: '',
    allergies: [],
  });

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        start_date: startDate,
        end_date: endDate,
        preferences: {
          dietaryRestrictions: preferences.dietaryRestrictions,
          cuisinePreference: preferences.cuisinePreference,
          calories: preferences.calories,
          allergies: preferences.allergies.filter(a => a && a !== 'None')
        },
        recipes: recipes.map(recipe => ({
          recipe: {
            id: recipe.recipe.id,
            name: recipe.recipe.name
          },
          average_rating: recipe.average_rating || 0
        }))
      };
  
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/ai/generate-meal-plan/`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
  
      if (response.data && response.data.entries) {
        onPlanGenerated(response.data);
        onClose();
        toast.success('Meal plan generated successfully!');
      } else {
        throw new Error('Invalid response format from server');
      }
    } catch (error) {
      console.error('Error generating meal plan:', error);
      toast.error(
        error.response?.data?.detail || 
        error.response?.data?.error || 
        'Failed to generate meal plan. Please try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white rounded-xl shadow-xl w-full max-w-lg"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <FaRobot className="text-primary-main" />
                  AI Meal Planner
                </h2>
                <button onClick={onClose}>
                  <FaTimes className="text-gray-400 hover:text-gray-600" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dietary Restrictions
                  </label>
                  <select
                    value={preferences.dietaryRestrictions}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      dietaryRestrictions: e.target.value
                    })}
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-main/20"
                  >
                    <option value="">None</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                    <option value="gluten-free">Gluten-free</option>
                    <option value="keto">Keto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Preferred Cuisine
                  </label>
                  <input
                    type="text"
                    value={preferences.cuisinePreference}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      cuisinePreference: e.target.value
                    })}
                    placeholder="E.g., Italian, Indian, Mexican"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-main/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <input
                    type="text"
                    value={preferences.allergies.join(', ')}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      allergies: e.target.value.split(',').map(item => item.trim())
                    })}
                    placeholder="E.g., nuts, dairy, shellfish"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-main/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Daily Calories
                  </label>
                  <input
                    type="number"
                    value={preferences.calories}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      calories: e.target.value
                    })}
                    placeholder="E.g., 2000"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-main/20"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating}
                  className="bg-primary-main text-white px-6 py-2 rounded-lg font-medium 
                    flex items-center gap-2 hover:bg-primary-dark transition-colors 
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <FaMagic />
                      Generate Plan
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AIMealPlanner;