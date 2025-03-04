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

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-teal-900 py-8 px-6 shadow-xl">
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-center text-emerald-400 tracking-tight animate-pulse-slow">
          Craft Your Culinary Masterpiece
        </h1>
        <p className="text-center text-gray-300 mt-2 text-lg">Share your recipe with the world!</p>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-12">
          {/* Form Section */}
          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="bg-gray-850 rounded-2xl shadow-2xl p-8 border border-emerald-500/20 overflow-hidden"
            >
              {/* Image Upload */}
              <div
                onClick={() => document.getElementById("image-upload").click()}
                className="relative w-full h-64 rounded-xl bg-gray-800 flex items-center justify-center cursor-pointer overflow-hidden group mb-8"
              >
                {recipe.image ? (
                  <img
                    src={URL.createObjectURL(recipe.image)}
                    alt="Recipe"
                    className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="text-center">
                    <FaCamera className="text-emerald-400 text-4xl mb-3 animate-bounce" />
                    <p className="text-gray-300 text-lg font-medium">Add a Mouthwatering Photo</p>
                  </div>
                )}
                <div className="absolute inset-0 bg-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <FaCamera className="text-white text-3xl" />
                </div>
                <input
                  type="file"
                  id="image-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </div>

              {/* Section Navigation */}
              <div className="flex justify-center gap-4 mb-8">
                {sections.map((section) => (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center gap-2 px-4 py-2 sm:px-6 sm:py-3 rounded-full text-sm sm:text-base font-medium transition-all duration-300 ${
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

              {/* Section Content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6"
                >
                  {activeSection === "basic" && (
                    <>
                      <div>
                      <input
                        type="text"
                        name="name"
                        value={recipe.name}
                        onChange={handleChange}
                        placeholder="Give Your Recipe a Tasty Name"
                        className="w-full text-xl sm:text-2xl md:text-3xl font-bold bg-transparent border-b-2 border-gray-600 focus:border-emerald-400 outline-none py-2 text-gray-100 placeholder-gray-400 transition-colors duration-300"
                      />
                        {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="relative">
                          <FaClock className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                          <input
                            type="number"
                            name="cookingTime"
                            value={recipe.cookingTime}
                            onChange={handleChange}
                            placeholder="Cooking Time (mins)"
                            className="w-full bg-gray-700 rounded-lg pl-12 pr-4 py-3 text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                          {errors.cookingTime && <p className="text-red-400 text-sm mt-1">{errors.cookingTime}</p>}
                        </div>
                        <div className="relative">
                          <FaUsers className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-400" />
                          <input
                            type="number"
                            name="servings"
                            value={recipe.servings}
                            onChange={handleChange}
                            placeholder="Servings"
                            className="w-full bg-gray-700 rounded-lg pl-12 pr-4 py-3 text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                          {errors.servings && <p className="text-red-400 text-sm mt-1">{errors.servings}</p>}
                        </div>
                      </div>
                      <div>
                        <label className="text-emerald-400 font-medium mb-2 block">Cuisine Type</label>
                        <select
                          name="cuisine"
                          value={recipe.cuisine}
                          onChange={handleChange}
                          className="w-full bg-gray-700 rounded-lg px-4 py-3 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        >
                          <option value="">Pick a Cuisine</option>
                          {cuisineTypes.map((cuisine) => (
                            <option key={cuisine} value={cuisine}>{cuisine}</option>
                          ))}
                        </select>
                        {errors.cuisine && <p className="text-red-400 text-sm mt-1">{errors.cuisine}</p>}
                      </div>
                      <div>
                        <label className="text-emerald-400 font-medium mb-2 block">Description</label>
                        <textarea
                          name="description"
                          value={recipe.description}
                          onChange={handleChange}
                          placeholder="Tell us about your dish..."
                          className="w-full bg-gray-700 rounded-lg px-4 py-3 text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px] resize-none transition-all"
                        />
                      </div>
                      <div>
                        <label className="text-emerald-400 font-medium mb-2 block">Tags</label>
                        <div className="flex items-center gap-2 mb-3">
                          <FaTag className="text-emerald-400" />
                          <input
                              type="text"
                              value={tagInput}
                              onChange={(e) => setTagInput(e.target.value)}
                              onKeyPress={(e) => e.key === "Enter" && handleTagAdd()}
                              placeholder="Add a tag (e.g., Spicy, Easy)"
                              className="flex-1 bg-gray-700 rounded-lg px-4 py-3 text-sm sm:text-base text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                          <motion.button
                            onClick={handleTagAdd}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            className="bg-emerald-600 p-2 rounded-full"
                          >
                            <FaPlus className="text-white" />
                          </motion.button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {recipe.tags.map((tag, index) => (
                            <motion.span
                              key={index}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="bg-emerald-700 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                            >
                              #{tag}
                              <button onClick={() => handleTagRemove(tag)} className="hover:text-red-400">
                                <FaTimes size={12} />
                              </button>
                            </motion.span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {activeSection === "ingredients" && (
                    <div className="space-y-4">
                      {recipe.ingredients.map((ingredient, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-center gap-3"
                        >
                          <input
                            type="text"
                            value={ingredient}
                            onChange={(e) => handleIngredientChange(index, e.target.value)}
                            onKeyPress={(e) => handleIngredientKeyPress(e, index)}
                            placeholder={`Ingredient ${index + 1} (e.g., 2 cups flour)`}
                            ref={(el) => (ingredientRefs.current[index] = el)} // Assign ref to input
                            className="flex-1 bg-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                          />
                          <motion.button
                            onClick={() => removeIngredient(index)}
                            whileHover={{ scale: 1.1, rotate: 90 }}
                            className="text-red-400 p-2"
                          >
                            <FaTimes size={18} />
                          </motion.button>
                        </motion.div>
                      ))}
                      <motion.button
                        onClick={() => addIngredient(true)} // Focus new input when clicked
                        whileHover={{ scale: 1.05 }}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all"
                      >
                        <FaPlus size={14} />
                        Add Ingredient
                      </motion.button>
                      {errors.ingredients && <p className="text-red-400 text-sm">{errors.ingredients}</p>}
                    </div>
                  )}

                  {activeSection === "instructions" && (
                    <div>
                      <textarea
                        name="instructions"
                        value={recipe.instructions}
                        onChange={handleChange}
                        placeholder="Step 1: Preheat oven to 350°F...\nStep 2: Mix ingredients..."
                        className="w-full bg-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[300px] resize-none transition-all"
                      />
                      {errors.instructions && <p className="text-red-400 text-sm mt-1">{errors.instructions}</p>}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Submit Button */}
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full mt-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z" />
                    </svg>
                    Sharing Recipe...
                  </span>
                ) : (
                  <>
                    Share Your Creation
                    <FaChevronRight size={16} />
                  </>
                )}
              </motion.button>

              {/* Success Message */}
              {successMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-4 bg-emerald-900/30 text-emerald-400 rounded-xl flex items-center justify-center gap-2"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  {successMessage}
                </motion.div>
              )}
            </motion.div>
          </div>

          {/* Preview Section */}
          <div className="lg:w-96">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="sticky top-12 bg-gray-850 rounded-2xl shadow-2xl p-6 border border-emerald-500/20"
            >
              <h3 className="text-2xl font-bold text-emerald-400 mb-6">Live Preview</h3>
              <div className="space-y-6">
                {recipe.image && (
                  <img
                    src={URL.createObjectURL(recipe.image)}
                    alt="Recipe"
                    className="w-full h-56 object-cover rounded-xl shadow-md transform transition-transform duration-300 hover:scale-105"
                  />
                )}
                <div>
                  <h4 className="text-2xl font-semibold text-white">
                    {recipe.name || "Your Recipe Name"}
                  </h4>
                  {recipe.cuisine && (
                    <p className="text-emerald-300 text-sm mt-1 italic">{recipe.cuisine} Delight</p>
                  )}
                </div>
                {(recipe.cookingTime || recipe.servings) && (
                  <div className="flex gap-6 text-gray-300">
                    {recipe.cookingTime && (
                      <div className="flex items-center gap-2">
                        <FaClock className="text-emerald-400" />
                        <span>{recipe.cookingTime} mins</span>
                      </div>
                    )}
                    {recipe.servings && (
                      <div className="flex items-center gap-2">
                        <FaUsers className="text-emerald-400" />
                        <span>{recipe.servings} servings</span>
                      </div>
                    )}
                  </div>
                )}
                {recipe.description && (
                  <p className="text-gray-300 text-sm italic">{recipe.description}</p>
                )}
                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-emerald-700 text-white px-3 py-1 rounded-full text-sm shadow-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
                {recipe.ingredients.some((ing) => ing.trim()) && (
                  <div>
                    <h5 className="text-lg font-semibold text-emerald-400 mb-2">Ingredients</h5>
                    <ul className="space-y-2 text-gray-300">
                      {recipe.ingredients.filter((ing) => ing.trim()).map((ingredient, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full" />
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {recipe.instructions && (
                  <div>
                    <h5 className="text-lg font-semibold text-emerald-400 mb-2">Steps</h5>
                    <p className="text-gray-300 whitespace-pre-wrap text-sm">{recipe.instructions}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipePostCreator;