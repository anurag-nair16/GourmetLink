import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCamera, FaImage, FaSpinner, FaUtensils, FaList, FaSlidersH, FaTimes } from 'react-icons/fa';
import FormattedRecipe from "./forms/FormattedRecipe";

const Stepper = ({ currentStep }) => {
  const steps = ['Upload', 'Ingredients', 'Preferences', 'Recipe'];

  return (
    <div className="flex justify-center items-center gap-4 py-4 mb-8">
      {steps.map((step, index) => (
        <div key={index} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              index <= currentStep
                ? 'bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {index + 1}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 h-1 mx-2 ${
                index < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const LoadingAnimation = ({ type }) => {
  const ingredients = ['🥕', '🍅', '🥬', '🧀', '🍗', '🥚'];
  const recipes = ['🍽️', '🥄', '🥗', '🍲', '🍝'];
  const items = type === 'ingredients' ? ingredients : recipes;

  return (
    <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-md flex items-center justify-center z-10">
      <motion.div
        className="relative"
        animate={{ scale: [1, 1.2, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FaSpinner className="text-5xl text-white animate-spin" />
      </motion.div>
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-3xl"
          initial={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            opacity: 0,
            scale: 0.5,
          }}
          animate={{
            x: Math.random() * 200 - 100,
            y: Math.random() * 200 - 100,
            opacity: [0, 1, 0],
            scale: [0.5, 1.5, 0.5],
            rotate: Math.random() * 360,
            transition: {
              duration: 2 + Math.random(),
              repeat: Infinity,
              delay: Math.random() * 0.5,
              ease: 'easeInOut',
            },
          }}
        >
          {item}
        </motion.div>
      ))}
    </div>
  );
};

const RecipeGenerator = () => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isIngredientsConfirmed, setIsIngredientsConfirmed] = useState(false);
  const [userPreferences, setUserPreferences] = useState({
    allergies: [],
    dietaryRestrictions: '',
    cuisinePreference: '',
    mealType: '',
  });
  const [recipeResponse, setRecipeResponse] = useState(null);
  const [isGeneratingRecipe, setIsGeneratingRecipe] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const fileInputRef = useRef(null);

  const handlePhotoCapture = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Image size should be less than 5MB');
        return;
      }

      setPreviewUrl(URL.createObjectURL(file));
      await analyzePhoto(file);
      setCurrentStep(1);
    }
  };

  const analyzePhoto = async (file) => {
    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('photo', file);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/recipe-generator/analyze-ingredients/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to analyze ingredients');
      }

      const data = await response.json();
      if (!data.ingredients || data.ingredients.length === 0) {
        throw new Error('No ingredients detected in the image');
      }

      setDetectedIngredients(data.ingredients);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      alert(error.message || 'Failed to analyze ingredients. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleIngredientEdit = (index, newValue) => {
    const updatedIngredients = [...detectedIngredients];
    updatedIngredients[index] = newValue;
    setDetectedIngredients(updatedIngredients);
    setIsIngredientsConfirmed(false);
  };

  const confirmIngredients = () => {
    setIsIngredientsConfirmed(true);
    setCurrentStep(2);
  };

  const generateRecipe = async () => {
    setIsGeneratingRecipe(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${process.env.REACT_APP_API_URL}/recipe-generator/generate-recipe/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ingredients: detectedIngredients,
          preferences: userPreferences,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate recipe');
      }

      const data = await response.json();
      if (!data.recipe) {
        throw new Error('No recipe was generated');
      }

      setRecipeResponse(data.recipe);
      setCurrentStep(3);
    } catch (error) {
      console.error('Error generating recipe:', error);
      alert(error.message || 'Failed to generate recipe. Please try again.');
    } finally {
      setIsGeneratingRecipe(false);
    }
  };

  const resetForm = () => {
    setPreviewUrl(null);
    setDetectedIngredients([]);
    setIsIngredientsConfirmed(false);
    setUserPreferences({
      allergies: [],
      dietaryRestrictions: '',
      cuisinePreference: '',
      mealType: '',
    });
    setRecipeResponse(null);
    setCurrentStep(0);
  };

  return (
    <div className="min-h-screen bg-cream-100 flex flex-col items-center">
      <div className="w-full max-w-3xl px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-800 tracking-tight">Craft Your Recipe</h1>
          <p className="text-lg text-gray-600 mt-2">Transform your ingredients into a delicious meal with ease.</p>
        </motion.div>

        <Stepper currentStep={currentStep} />

        <div className="space-y-8">
          {/* Step 1: Photo Upload */}
          {currentStep === 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-lg relative"
            >
              {isAnalyzing && <LoadingAnimation type="ingredients" />}
              <div className={isAnalyzing ? 'filter blur-sm' : ''}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Start with Your Ingredients</h2>
                <p className="text-gray-600 mb-6">Snap a photo or upload an image to begin.</p>

                <div className="flex flex-col sm:flex-row gap-4 mb-8">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                  >
                    <FaCamera className="text-lg" />
                    Take Photo
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex-1 py-4 bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors flex items-center justify-center gap-2"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing}
                  >
                    <FaImage className="text-lg" />
                    Upload Image
                  </motion.button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoCapture}
                  />
                </div>

                {previewUrl && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="relative rounded-2xl overflow-hidden"
                  >
                    <img
                      src={previewUrl}
                      alt="Ingredients"
                      className="w-full h-96 object-cover"
                    />
                  </motion.div>
                )}
              </div>

              {previewUrl && !isAnalyzing && (
                <div className="flex justify-end mt-6">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(1)}
                    className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                  >
                    Next
                  </motion.button>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 2: Ingredients Confirmation */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-lg"
            >
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Review Your Ingredients</h2>
              <p className="text-gray-600 mb-6">Edit or remove ingredients as needed.</p>

              <div className="space-y-4">
                {detectedIngredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientEdit(index, e.target.value)}
                      className="flex-1 p-3 bg-cream-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 disabled:bg-gray-100"
                      disabled={isIngredientsConfirmed}
                    />
                    {!isIngredientsConfirmed && (
                      <button
                        onClick={() => {
                          const newIngredients = detectedIngredients.filter((_, i) => i !== index);
                          setDetectedIngredients(newIngredients);
                        }}
                        className="text-rose-500 hover:text-rose-600 transition-colors"
                      >
                        <FaTimes className="text-lg" />
                      </button>
                    )}
                  </motion.div>
                ))}
              </div>

              {!isIngredientsConfirmed && (
                <div className="flex justify-between mt-6">
                  <button
                    onClick={() => setDetectedIngredients([...detectedIngredients, ''])}
                    className="text-emerald-500 hover:text-emerald-600 font-semibold transition-colors"
                  >
                    + Add Ingredient
                  </button>
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(0)}
                      className="px-6 py-3 bg-cream-50 text-gray-700 rounded-xl hover:bg-cream-200 transition-colors"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={confirmIngredients}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                      disabled={detectedIngredients.length === 0}
                    >
                      Confirm Ingredients
                    </motion.button>
                  </div>
                </div>
              )}
              {isIngredientsConfirmed && (
                <div className="flex justify-end mt-6">
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(0)}
                      className="px-6 py-3 bg-cream-50 text-gray-700 rounded-xl hover:bg-cream-200 transition-colors"
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(2)}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      Next
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 3: Preferences */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-lg relative"
            >
              {isGeneratingRecipe && <LoadingAnimation type="recipes" />}
              <div className={isGeneratingRecipe ? 'filter blur-sm' : ''}>
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Tailor Your Recipe</h2>
                <p className="text-gray-600 mb-6">Customize your dish with your preferences.</p>

                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Allergies</label>
                    <input
                      type="text"
                      placeholder="e.g., nuts, dairy, shellfish"
                      className="w-full p-3 bg-cream-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      value={userPreferences.allergies.join(', ')}
                      onChange={(e) =>
                        setUserPreferences({
                          ...userPreferences,
                          allergies: e.target.value.split(',').map((item) => item.trim()),
                        })
                      }
                      disabled={isGeneratingRecipe}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Dietary Restrictions</label>
                    <select
                      className="w-full p-3 bg-cream-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      value={userPreferences.dietaryRestrictions}
                      onChange={(e) =>
                        setUserPreferences({
                          ...userPreferences,
                          dietaryRestrictions: e.target.value,
                        })
                      }
                      disabled={isGeneratingRecipe}
                    >
                      <option value="">None</option>
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="gluten-free">Gluten-free</option>
                      <option value="keto">Keto</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Cuisine Preference</label>
                    <input
                      type="text"
                      placeholder="e.g., Italian, Indian, Mexican"
                      className="w-full p-3 bg-cream-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      value={userPreferences.cuisinePreference}
                      onChange={(e) =>
                        setUserPreferences({
                          ...userPreferences,
                          cuisinePreference: e.target.value,
                        })
                      }
                      disabled={isGeneratingRecipe}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Meal Type</label>
                    <select
                      className="w-full p-3 bg-cream-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
                      value={userPreferences.mealType}
                      onChange={(e) =>
                        setUserPreferences({
                          ...userPreferences,
                          mealType: e.target.value,
                        })
                      }
                      disabled={isGeneratingRecipe}
                    >
                      <option value="">Select meal type</option>
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end mt-6">
                  <div className="flex gap-4">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCurrentStep(1)}
                      className="px-6 py-3 bg-cream-50 text-gray-700 rounded-xl hover:bg-cream-200 transition-colors"
                      disabled={isGeneratingRecipe}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={generateRecipe}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      disabled={isGeneratingRecipe}
                    >
                      {isGeneratingRecipe ? (
                        <>
                          <FaSpinner className="animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Recipe'
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Recipe */}
          {currentStep === 3 && recipeResponse && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl p-8 shadow-lg"
            >
              <FormattedRecipe recipeText={recipeResponse} currentUser="anurag-nair16" />

              <div className="flex justify-end mt-6">
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-cream-50 text-gray-700 rounded-xl hover:bg-cream-200 transition-colors"
                  >
                    Back
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={resetForm}
                    className="px-6 py-3 bg-amber-100 text-amber-800 rounded-xl hover:bg-amber-200 transition-colors"
                  >
                    Generate New
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeGenerator;