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

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-gray-800 to-teal-900 py-4 px-4 shadow-xl">
        <h1 className="text-xl sm:text-2xl font-bold text-center text-emerald-400">
          Create Recipe
        </h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-850 rounded-xl shadow-xl p-6 border border-emerald-500/20"
          >
            {/* Image Upload */}
            <div
              onClick={() => document.getElementById("image-upload").click()}
              className="relative w-full h-48 rounded-lg bg-gray-800 flex items-center justify-center cursor-pointer mb-6"
            >
              {recipe.image ? (
                <img
                  src={URL.createObjectURL(recipe.image)}
                  alt="Recipe"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <FaCamera className="text-emerald-400 text-2xl mb-2" />
                  <p className="text-gray-300 text-sm">Add Photo</p>
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

            {/* Section Navigation */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {sections.map((section) => (
                <motion.button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`flex-1 min-w-[100px] px-2 py-1 rounded-full text-sm font-medium transition-all ${
                    activeSection === section.id
                      ? "bg-emerald-600 text-white"
                      : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  }`}
                >
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
                className="space-y-4"
              >
                {activeSection === "basic" && (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={recipe.name}
                      onChange={handleChange}
                      placeholder="Recipe Name"
                      className="w-full text-lg font-bold bg-transparent border-b border-gray-600 focus:border-emerald-400 outline-none py-2 text-gray-100 placeholder-gray-400"
                    />
                    {errors.name && <p className="text-red-400 text-xs">{errors.name}</p>}
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <FaClock className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-400 text-sm" />
                        <input
                          type="number"
                          name="cookingTime"
                          value={recipe.cookingTime}
                          onChange={handleChange}
                          placeholder="Time (mins)"
                          className="w-full bg-gray-700 rounded-lg pl-8 pr-2 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.cookingTime && <p className="text-red-400 text-xs">{errors.cookingTime}</p>}
                      </div>
                      <div className="relative">
                        <FaUsers className="absolute left-2 top-1/2 -translate-y-1/2 text-emerald-400 text-sm" />
                        <input
                          type="number"
                          name="servings"
                          value={recipe.servings}
                          onChange={handleChange}
                          placeholder="Servings"
                          className="w-full bg-gray-700 rounded-lg pl-8 pr-2 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        {errors.servings && <p className="text-red-400 text-xs">{errors.servings}</p>}
                      </div>
                    </div>
                    
                    <select
                      name="cuisine"
                      value={recipe.cuisine}
                      onChange={handleChange}
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Cuisine</option>
                      {cuisineTypes.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>{cuisine}</option>
                      ))}
                    </select>
                    {errors.cuisine && <p className="text-red-400 text-xs">{errors.cuisine}</p>}
                    
                    <textarea
                      name="description"
                      value={recipe.description}
                      onChange={handleChange}
                      placeholder="Description"
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-20 resize-none"
                    />
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <FaTag className="text-emerald-400 text-sm" />
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleTagAdd()}
                          placeholder="Add tag"
                          className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <motion.button
                          onClick={handleTagAdd}
                          whileHover={{ scale: 1.1 }}
                          className="bg-emerald-600 p-2 rounded-full"
                        >
                          <FaPlus className="text-white text-sm" />
                        </motion.button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.map((tag, index) => (
                          <motion.span
                            key={index}
                            className="bg-emerald-700 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1"
                          >
                            #{tag}
                            <button onClick={() => handleTagRemove(tag)}>
                              <FaTimes size={10} />
                            </button>
                          </motion.span>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {activeSection === "ingredients" && (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {recipe.ingredients.map((ingredient, index) => (
                      <motion.div
                        key={index}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => handleIngredientChange(index, e.target.value)}
                          onKeyPress={(e) => handleIngredientKeyPress(e, index)}
                          placeholder={`Ingredient ${index + 1}`}
                          ref={(el) => (ingredientRefs.current[index] = el)}
                          className="flex-1 bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <motion.button
                          onClick={() => removeIngredient(index)}
                          whileHover={{ scale: 1.1 }}
                          className="text-red-400 p-1"
                        >
                          <FaTimes size={14} />
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
                    {errors.ingredients && <p className="text-red-400 text-xs">{errors.ingredients}</p>}
                  </div>
                )}

                {activeSection === "instructions" && (
                  <div>
                    <textarea
                      name="instructions"
                      value={recipe.instructions}
                      onChange={handleChange}
                      placeholder="Steps..."
                      className="w-full bg-gray-700 rounded-lg px-3 py-2 text-sm text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 h-32 resize-none"
                    />
                    {errors.instructions && <p className="text-red-400 text-xs">{errors.instructions}</p>}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>

            {/* Buttons */}
            <div className="flex gap-4 mt-6">
              <motion.button
                onClick={() => setShowPreview(true)}
                whileHover={{ scale: 1.05 }}
                className="flex-1 bg-gray-700 text-white py-2 rounded-lg text-sm"
              >
                Show Preview
              </motion.button>
              <motion.button
                onClick={handleSubmit}
                disabled={isLoading}
                whileHover={{ scale: 1.05 }}
                className="flex-1 bg-emerald-600 text-white py-2 rounded-lg text-sm disabled:opacity-50"
              >
                {isLoading ? "Sharing..." : "Share Recipe"}
              </motion.button>
            </div>

            {successMessage && (
              <motion.div
                className="mt-4 p-3 bg-emerald-900/30 text-emerald-400 rounded-lg text-sm text-center"
              >
                {successMessage}
              </motion.div>
            )}
          </motion.div>
        </div>
      </main>

      {/* Preview Popup */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-gray-800/90 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="bg-gray-850 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-emerald-400">Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-300 hover:text-white"
              >
                <FaTimes size={16} />
              </button>
            </div>
            {recipe.image && (
              <img
                src={URL.createObjectURL(recipe.image)}
                alt="Recipe"
                className="w-full h-40 object-cover rounded-lg mb-4"
              />
            )}
            <h4 className="text-lg font-semibold text-white">
              {recipe.name || "Your Recipe"}
            </h4>
            {recipe.cuisine && (
              <p className="text-emerald-300 text-xs italic">{recipe.cuisine}</p>
            )}
            {(recipe.cookingTime || recipe.servings) && (
              <div className="flex gap-4 text-gray-300 text-sm mt-2">
                {recipe.cookingTime && (
                  <div className="flex items-center gap-1">
                    <FaClock className="text-emerald-400 text-sm" />
                    <span>{recipe.cookingTime} mins</span>
                  </div>
                )}
                {recipe.servings && (
                  <div className="flex items-center gap-1">
                    <FaUsers className="text-emerald-400 text-sm" />
                    <span>{recipe.servings} servings</span>
                  </div>
                )}
              </div>
            )}
            {recipe.description && (
              <p className="text-gray-300 text-sm mt-2">{recipe.description}</p>
            )}
            {recipe.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {recipe.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-emerald-700 text-white px-2 py-1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
            {recipe.ingredients.some((ing) => ing.trim()) && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-emerald-400">Ingredients</h5>
                <ul className="space-y-1 text-gray-300 text-sm mt-2">
                  {recipe.ingredients.filter((ing) => ing.trim()).map((ingredient, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="w-1 h-1 bg-emerald-400 rounded-full" />
                      {ingredient}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {recipe.instructions && (
              <div className="mt-4">
                <h5 className="text-sm font-semibold text-emerald-400">Steps</h5>
                <p className="text-gray-300 text-sm mt-2 whitespace-pre-wrap">{recipe.instructions}</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default RecipePostCreator;