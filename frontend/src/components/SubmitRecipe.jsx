import React, { useState, useRef } from "react";
import { FaCamera, FaPlus, FaTimes, FaClock, FaUsers, FaChevronRight, FaTag } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const RecipePostCreator = () => {
  const [recipe, setRecipe] = useState({
    name: "",
    ingredients: [""],
    description: "",
    instructions: "",
    image: null,
    cuisine: "",
    tags: [],
    cookingTime: "",
    servings: "",
  });
  const [tagInput, setTagInput] = useState("");
  const [activeSection, setActiveSection] = useState("basic");
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const ingredientRefs = useRef([]);
  const [showPreview, setShowPreview] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];  // Get the file
    if (file && file.size <= 10485760) {  // Check file size
      setRecipe({ ...recipe, image: file });  // Store the actual file, not the URL
    }
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = value;
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const addIngredient = (focusNew = false) => {
    const newIngredients = [...recipe.ingredients, ""];
    setRecipe({ ...recipe, ingredients: newIngredients });
    if (focusNew) {
      setTimeout(() => {
        const newIndex = newIngredients.length - 1; // Target the last (new) input
        ingredientRefs.current[newIndex]?.focus(); // Focus the new input
      }, 10); // Small delay to ensure DOM update
    }
  };

  const handleIngredientKeyPress = (e, index) => {
    if (e.key === "Enter" && recipe.ingredients[index].trim()) {
      e.preventDefault(); // Prevent form submission
      addIngredient(true); // Add new ingredient and focus it
    }
  };

  const removeIngredient = (index) => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleTagAdd = () => {
    if (tagInput.trim() && !recipe.tags.includes(tagInput.trim())) {
      setRecipe({ ...recipe, tags: [...recipe.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleTagRemove = (tag) => {
    setRecipe({
      ...recipe,
      tags: recipe.tags.filter((t) => t !== tag),
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Initialize an empty errors object
    let validationErrors = {};
    
    // Validate required fields
    if (!recipe.name) validationErrors.name = "Recipe name is required.";
    if (recipe.ingredients.length === 0 || recipe.ingredients.some(ingredient => ingredient.trim() === "")) {
      validationErrors.ingredients = "At least one ingredient is required.";
    }
    if (!recipe.instructions) validationErrors.instructions = "Instructions are required.";
    if (!recipe.cuisine) validationErrors.cuisine = "Cuisine type is required.";
    if (!recipe.cookingTime) validationErrors.cookingTime = "Cooking time is required.";
    if (!recipe.servings) validationErrors.servings = "Servings are required.";
    
    // Check if there are any validation errors
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);  // Set the errors state to display error messages
      return;  // Stop the submission process
    }
    
    // Proceed with the API request if there are no errors
    const authToken = localStorage.getItem("token"); // Retrieve the token from localStorage
    
    const formData = new FormData();
    formData.append("name", recipe.name);
    formData.append("ingredients", recipe.ingredients);  // Directly append the array
    // console.log(recipe.tags)
    // console.log(recipe.ingredients)
    formData.append("instructions", recipe.instructions);
    formData.append("cuisine", recipe.cuisine);
    formData.append("prep_time", recipe.cookingTime);
    formData.append("servings", recipe.servings);
    formData.append("tags", recipe.tags);
    formData.append("description", recipe.description);

    // Add the image file (not just the URL)
    if (recipe.image && recipe.image instanceof File) {
      formData.append("image", recipe.image);
    }

    console.log(formData)
  
    setIsLoading(true);
  
    fetch(`${process.env.REACT_APP_API_URL}/submit-recipe/`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${authToken}`,
      },
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        setIsLoading(false);
        console.log("Recipe submitted:", data);
        setSuccessMessage("Recipe submitted successfully!");
        // Clear the form
        setRecipe({
          name: "",
          ingredients: [""],
          instructions: "",
          image: null,
          cuisine: "",
          tags: [],
          cookingTime: "",
          servings: "",
          description: "",
        });
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error submitting recipe:", error);
      });
  };
  
  const sections = [
    { id: "basic", label: "Basic Info" },
    { id: "ingredients", label: "Ingredients" },
    { id: "instructions", label: "Instructions" },
  ];

  const cuisineTypes = [
    "Italian",
    "Indian",
    "Mexican",
    "Chinese",
    "Japanese",
    "Thai",
    "Mediterranean",
    "French",
    "American",
  ];

  // Add this function inside your component, before the return statement
const calculateProgress = () => {
  const requiredFields = [
    'name',
    'ingredients',
    'instructions',
    'cuisine',
    'cookingTime',
    'servings',
    'description',
    'image'
  ];
  
  let completedFields = 0;
  
  // Check each required field
  requiredFields.forEach(field => {
    if (field === 'ingredients') {
      // Check if ingredients array has at least one non-empty ingredient
      if (recipe.ingredients.some(ing => ing.trim() !== '')) {
        completedFields++;
      }
    } else if (field === 'image') {
      // Check if image is uploaded
      if (recipe.image) {
        completedFields++;
      }
    } else {
      // Check if other fields are filled
      if (recipe[field] && recipe[field].toString().trim() !== '') {
        completedFields++;
      }
    }
  });

  return Math.round((completedFields / requiredFields.length) * 100);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Updated Header with more soothing colors */}
      <header className="bg-gradient-to-r from-teal-500 to-blue-500 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-pattern opacity-20"></div>
        </div>
        <div className="container mx-auto max-w-4xl relative">
          <h1 className="text-3xl sm:text-4xl font-bold text-center mb-4">
            Create Your Recipe
          </h1>
          <p className="text-center text-blue-50 text-lg max-w-2xl mx-auto leading-relaxed">
            Share your culinary inspiration with our community. Your recipe could be someone's next favorite dish.
          </p>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Updated Info Cards with softer shadows and transitions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="text-teal-500 text-xl mb-3 font-light">Step 1</div>
            <h3 className="font-semibold text-gray-800 mb-2">Essential Details</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Start with your recipe's name and a beautiful photo that captures its essence.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="text-teal-500 text-xl mb-3 font-light">Step 2</div>
            <h3 className="font-semibold text-gray-800 mb-2">Ingredients List</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Detail your ingredients with precise measurements for perfect results every time.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 transform transition-all duration-300 hover:shadow-md hover:-translate-y-1">
            <div className="text-teal-500 text-xl mb-3 font-light">Step 3</div>
            <h3 className="font-semibold text-gray-800 mb-2">Cooking Steps</h3>
            <p className="text-gray-600 text-sm leading-relaxed">Guide others through your cooking process with clear, step-by-step instructions.</p>
          </div>
        </div>

        {/* Enhanced Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8 border border-blue-100"
        >
          {/* Updated Progress Bar */}
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              <span className="text-sm text-gray-600">Completion Progress</span>
              <span className="text-sm text-teal-600 font-medium">
                {calculateProgress()}%
              </span>
            </div>
            <div className="w-full h-2 bg-blue-50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-teal-400 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
          </div>

          {/* Enhanced Image Upload */}
          <div
            onClick={() => document.getElementById("image-upload").click()}
            className="relative w-full h-64 rounded-xl bg-gradient-to-br from-blue-50 to-teal-50 flex items-center justify-center cursor-pointer mb-8 border-2 border-dashed border-blue-200 hover:border-teal-400 transition-all duration-300 group overflow-hidden"
          >
            {recipe.image ? (
              <div className="relative w-full h-full">
                <img
                  src={URL.createObjectURL(recipe.image)}
                  alt="Recipe"
                  className="w-full h-full object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <p className="text-white text-sm font-medium">Click to Change Photo</p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center group-hover:scale-110 transition-transform duration-300">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mb-3">
                  <FaCamera className="text-teal-500 text-xl" />
                </div>
                <p className="text-gray-600 text-sm font-medium">Add Your Recipe Photo</p>
                <p className="text-gray-400 text-xs mt-1">Drag & drop or click to upload</p>
              </div>
            )}
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/*"
              onChange={handleImageUpload}
            />
          </div>

          {/* Enhanced Section Navigation */}
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {sections.map((section) => (
              <motion.button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-teal-500 to-blue-500 text-white shadow-md"
                    : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                }`}
              >
                <span>{section.label}</span>
                <FaChevronRight className={`text-xs transition-transform ${
                  activeSection === section.id ? "rotate-90" : ""
                }`} />
              </motion.button>
            ))}
          </div>

          {/* Form Fields - Basic Info Section */}
          {activeSection === "basic" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <label className="text-gray-700 font-medium block mb-1">Recipe Name</label>
                <input
                  type="text"
                  name="name"
                  value={recipe.name}
                  onChange={handleChange}
                  placeholder="What's your recipe called?"
                  className="w-full text-lg bg-blue-50 border-0 rounded-xl focus:ring-2 focus:ring-teal-400 outline-none py-3 px-4 text-gray-800 placeholder-gray-400 transition-all duration-300"
                />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* Time and Servings in a grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-gray-700 font-medium block mb-1">Cooking Time</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <FaClock className="text-teal-500 text-sm" />
                    </div>
                    <input
                      type="number"
                      name="cookingTime"
                      value={recipe.cookingTime}
                      onChange={handleChange}
                      placeholder="Minutes"
                      className="w-full bg-blue-50 rounded-xl pl-12 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 outline-none transition-all duration-300"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-gray-700 font-medium block mb-1">Servings</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <FaUsers className="text-teal-500 text-sm" />
                    </div>
                    <input
                      type="number"
                      name="servings"
                      value={recipe.servings}
                      onChange={handleChange}
                      placeholder="Number of people"
                      className="w-full bg-blue-50 rounded-xl pl-12 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 outline-none transition-all duration-300"
                    />
                  </div>
                </div>
              </div>

              {/* Cuisine Type Dropdown */}
              <div className="space-y-2">
                <label className="text-gray-700 font-medium block mb-1">Cuisine Type</label>
                <select
                  name="cuisine"
                  value={recipe.cuisine}
                  onChange={handleChange}
                  className="w-full bg-blue-50 rounded-xl px-4 py-3 text-gray-800 focus:ring-2 focus:ring-teal-400 outline-none transition-all duration-300 cursor-pointer"
                >
                  <option value="">Select cuisine style</option>
                  {cuisineTypes.map((cuisine) => (
                    <option key={cuisine} value={cuisine}>{cuisine}</option>
                  ))}
                </select>
              </div>

              {/* Description Text Area */}
              <div className="space-y-2">
                <label className="text-gray-700 font-medium block mb-1">Description</label>
                <textarea
                  name="description"
                  value={recipe.description}
                  onChange={handleChange}
                  placeholder="Tell us about your recipe..."
                  className="w-full bg-blue-50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 outline-none transition-all duration-300 h-24 resize-none"
                />
              </div>

              {/* Tags Input */}
              <div className="space-y-3">
                <label className="text-gray-700 font-medium block mb-1">Tags</label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center group-hover:bg-teal-200 transition-colors">
                      <FaTag className="text-teal-500 text-sm" />
                    </div>
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleTagAdd()}
                      placeholder="Add recipe tags"
                      className="w-full bg-blue-50 rounded-xl pl-12 pr-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 outline-none transition-all duration-300"
                    />
                  </div>
                  <motion.button
                    onClick={handleTagAdd}
                    whileHover={{ scale: 1.05 }}
                    className="bg-gradient-to-r from-teal-500 to-blue-500 p-3 rounded-xl text-white shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <FaPlus className="text-sm" />
                  </motion.button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recipe.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      className="bg-blue-50 text-blue-600 px-4 py-2 rounded-xl text-sm flex items-center gap-2 group hover:bg-blue-100 transition-colors duration-300"
                    >
                      #{tag}
                      <button 
                        onClick={() => handleTagRemove(tag)}
                        className="text-blue-400 group-hover:text-blue-600 transition-colors"
                      >
                        <FaTimes size={12} />
                      </button>
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Ingredients Section */}
          {activeSection === "ingredients" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <div className="max-h-[400px] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50">
                {recipe.ingredients.map((ingredient, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 relative group">
                      <input
                        type="text"
                        value={ingredient}
                        onChange={(e) => handleIngredientChange(index, e.target.value)}
                        onKeyPress={(e) => handleIngredientKeyPress(e, index)}
                        placeholder={`Ingredient ${index + 1}`}
                        ref={(el) => (ingredientRefs.current[index] = el)}
                        className="w-full bg-blue-50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 outline-none transition-all duration-300"
                      />
                    </div>
                    <motion.button
                      onClick={() => removeIngredient(index)}
                      whileHover={{ scale: 1.1 }}
                      className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-colors"
                    >
                      <FaTimes size={16} />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
              <motion.button
                onClick={() => addIngredient(true)}
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-xl hover:shadow-md transition-all duration-300 w-full justify-center font-medium"
              >
                <FaPlus size={14} />
                Add Ingredient
              </motion.button>
            </motion.div>
          )}

          {/* Instructions Section */}
          {activeSection === "instructions" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-2"
            >
              <label className="text-gray-700 font-medium block mb-1">Cooking Instructions</label>
              <textarea
                name="instructions"
                value={recipe.instructions}
                onChange={handleChange}
                placeholder="Share your cooking process step by step..."
                className="w-full bg-blue-50 rounded-xl px-4 py-3 text-gray-800 placeholder-gray-400 focus:ring-2 focus:ring-teal-400 outline-none transition-all duration-300 h-[400px] resize-none scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50"
              />
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <motion.button
              onClick={() => setShowPreview(true)}
              whileHover={{ scale: 1.02 }}
              className="flex-1 bg-blue-50 text-blue-600 py-3 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all duration-300"
            >
              Preview Recipe
            </motion.button>
            <motion.button
              onClick={handleSubmit}
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              className="flex-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white py-3 rounded-xl text-sm font-medium hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:hover:shadow-none"
            >
              {isLoading ? "Publishing..." : "Publish Recipe"}
            </motion.button>
          </div>
        </motion.div>

        {/* Preview Modal */}
{showPreview && (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50"
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-bold text-teal-600">Recipe Preview</h3>
        <button
          onClick={() => setShowPreview(false)}
          className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
        >
          <FaTimes size={20} />
        </button>
      </div>

      <div className="space-y-6">
        {recipe.image && (
          <img
            src={URL.createObjectURL(recipe.image)}
            alt="Recipe"
            className="w-full h-64 object-cover rounded-xl shadow-md"
          />
        )}

        <div className="space-y-4">
          <h4 className="text-2xl font-bold text-gray-800">
            {recipe.name || "Untitled Recipe"}
          </h4>

          {recipe.cuisine && (
            <p className="text-teal-500 font-medium">{recipe.cuisine} Cuisine</p>
          )}

          <div className="flex gap-6 text-gray-600">
            {recipe.cookingTime && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaClock className="text-teal-500" />
                </div>
                <span>{recipe.cookingTime} minutes</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaUsers className="text-teal-500" />
                </div>
                <span>Serves {recipe.servings}</span>
              </div>
            )}
          </div>

          {recipe.description && (
            <p className="text-gray-600 leading-relaxed bg-blue-50 p-4 rounded-xl">
              {recipe.description}
            </p>
          )}

          {recipe.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recipe.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-sm"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {recipe.ingredients.some((ing) => ing.trim()) && (
            <div className="space-y-3 bg-blue-50 p-6 rounded-xl">
              <h5 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaTag className="text-teal-500" />
                </span>
                Ingredients
              </h5>
              <ul className="space-y-2">
                {recipe.ingredients
                  .filter((ing) => ing.trim())
                  .map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-3 text-gray-600">
                      <span className="w-2 h-2 bg-teal-400 rounded-full" />
                      {ingredient}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {recipe.instructions && (
            <div className="space-y-3 bg-blue-50 p-6 rounded-xl">
              <h5 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <span className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                  <FaChevronRight className="text-teal-500" />
                </span>
                Instructions
              </h5>
              <div className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                {recipe.instructions}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  </motion.div>
)}

        {/* Community Stats Section */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-6 text-lg">
            Join our growing community of food enthusiasts
          </p>
          <div className="flex justify-center gap-6">
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-100 transition-all duration-300"
            >
              <span className="text-teal-500 text-2xl font-bold block mb-1">1.2K+</span>
              <span className="text-gray-600">Recipes Shared</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-100 transition-all duration-300"
            >
              <span className="text-teal-500 text-2xl font-bold block mb-1">5K+</span>
              <span className="text-gray-600">Community Members</span>
            </motion.div>
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white px-6 py-4 rounded-xl shadow-sm border border-blue-100 transition-all duration-300"
            >
              <span className="text-teal-500 text-2xl font-bold block mb-1">10K+</span>
              <span className="text-gray-600">Recipe Saves</span>
            </motion.div>
          </div>
        </div>
      </div>
    </div>

    
  );
};

export default RecipePostCreator;