import React, { useState } from "react";
import { FaCamera, FaPlus, FaTimes, FaClock, FaUsers, FaChevronRight } from "react-icons/fa";

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

  const addIngredient = () => {
    setRecipe({ ...recipe, ingredients: [...recipe.ingredients, ""] });
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
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 py-6 px-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-100">
          Create Recipe
          <span className="text-emerald-500 ml-2">✨</span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          {/* Form Section */}
          <div className="flex-1">
            {/* Image Upload and Basic Info */}
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center mb-6">
                {/* Image Upload */}
                <div
                  onClick={() => document.getElementById("image-upload").click()}
                  className="w-full md:w-48 h-48 rounded-lg bg-gray-700 flex items-center justify-center cursor-pointer overflow-hidden relative group"
                >
                  {recipe.image ? (
                    <>
                      <img
                        src={URL.createObjectURL(recipe.image)}
                        alt="Recipe"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <FaCamera className="text-white text-2xl" />
                      </div>
                    </>
                  ) : (
                    <div className="text-center">
                      <FaCamera className="text-emerald-500 text-3xl mb-2" />
                      <p className="text-gray-400 text-sm">Upload Photo</p>
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

                {/* Basic Info Fields */}
                <div className="flex-1 w-full">
                  <input
                    type="text"
                    name="name"
                    value={recipe.name}
                    onChange={handleChange}
                    placeholder="Recipe Name"
                    className="w-full text-2xl font-semibold bg-transparent border-b border-gray-700 focus:border-emerald-500 focus:outline-none pb-2 mb-4 text-gray-100 placeholder-gray-500"
                  />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="cookingTime"
                        value={recipe.cookingTime}
                        onChange={handleChange}
                        placeholder="Cooking time (mins)"
                        className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="relative">
                      <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="number"
                        name="servings"
                        value={recipe.servings}
                        onChange={handleChange}
                        placeholder="Servings"
                        className="w-full bg-gray-700 rounded-lg pl-10 pr-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section Navigation */}
              <div className="flex border-b border-gray-700 mb-6">
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`pb-3 px-4 relative ${
                      activeSection === section.id
                        ? "text-emerald-500"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                  >
                    {section.label}
                    {activeSection === section.id && (
                      <div className="absolute bottom-0 left-0 w-full h-0.5 bg-emerald-500" />
                    )}
                  </button>
                ))}
                
              </div>


              {/* Section Content */}
              <div className="min-h-[300px]">
                {activeSection === "basic" && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-gray-300 mb-2">Recipe Description</label>
                      <textarea
                        name="description"
                        value={recipe.description}
                        onChange={handleChange}
                        placeholder="Describe your recipe..."
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[100px] resize-none"
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 mb-2">Cuisine Type</label>
                      <select
                        name="cuisine"
                        value={recipe.cuisine}
                        onChange={handleChange}
                        className="w-full bg-gray-700 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      >
                        <option value="">Select Cuisine Type</option>
                        {cuisineTypes.map((cuisine) => (
                          <option key={cuisine} value={cuisine}>
                            {cuisine}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-gray-300 mb-2">Tags</label>
                      <div className="flex items-center gap-2 mb-3">
                        <input
                          type="text"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={(e) => e.key === "Enter" && handleTagAdd()}
                          placeholder="Add tags and press Enter"
                          className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {recipe.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-700 text-emerald-400 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                          >
                            #{tag}
                            <button
                              onClick={() => handleTagRemove(tag)}
                              className="hover:text-emerald-300"
                            >
                              <FaTimes size={14} />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {activeSection === "ingredients" && (
                  <div className="space-y-4">
                    {recipe.ingredients.map((ingredient, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={ingredient}
                          onChange={(e) => handleIngredientChange(index, e.target.value)}
                          placeholder="Add an ingredient"
                          className="flex-1 bg-gray-700 rounded-lg px-4 py-2 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        />
                        <button
                          onClick={() => removeIngredient(index)}
                          className="text-gray-400 hover:text-red-500 p-2"
                        >
                          <FaTimes size={18} />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addIngredient}
                      className="flex items-center gap-2 text-emerald-500 hover:text-emerald-400 transition-colors"
                    >
                      <FaPlus size={14} />
                      Add Ingredient
                    </button>
                  </div>
                )}

                {activeSection === "instructions" && (
                  <textarea
                    name="instructions"
                    value={recipe.instructions}
                    onChange={handleChange}
                    placeholder="Share your cooking instructions..."
                    className="w-full bg-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[300px] resize-none"
                  />
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                "Creating Recipe..."
              ) : (
                <>
                  Share Recipe
                  <FaChevronRight size={14} />
                </>
              )}
            </button>

            {/* Messages */}
            {successMessage && (
              <div className="mt-4 p-4 bg-emerald-900/20 text-emerald-500 rounded-lg">
                {successMessage}
              </div>
            )}
          </div>

          {/* Preview Section */}
          <div className="lg:w-96">
            <div className="sticky top-8">
              <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-100">Preview</h3>
                </div>
                <div className="p-4 space-y-4">
                  {recipe.image && (
                    <img
                      src={URL.createObjectURL(recipe.image)}
                      alt="Recipe"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  )}

                  <div>
                    <h4 className="text-xl font-semibold text-gray-100">
                      {recipe.name || "Recipe Name"}
                    </h4>
                    {recipe.cuisine && (
                      <p className="text-emerald-400 text-sm mt-1">{recipe.cuisine} Cuisine</p>
                    )}
                  </div>

                  {(recipe.cookingTime || recipe.servings) && (
                    <div className="flex gap-4 text-sm text-gray-400">
                      {recipe.cookingTime && (
                        <div className="flex items-center gap-2">
                          <FaClock />
                          <span>{recipe.cookingTime} mins</span>
                        </div>
                      )}
                      {recipe.servings && (
                        <div className="flex items-center gap-2">
                          <FaUsers />
                          <span>{recipe.servings} servings</span>
                        </div>
                      )}
                    </div>
                  )}

                  {recipe.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="bg-gray-700 text-emerald-400 px-3 py-1 rounded-full text-sm"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {recipe.ingredients.some((ing) => ing.trim()) && (
                    <div>
                      <h5 className="font-semibold text-gray-100 mb-2">Ingredients</h5>
                      <ul className="space-y-1 text-gray-400">
                        {recipe.ingredients
                          .filter((ing) => ing.trim())
                          .map((ingredient, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                              {ingredient}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {recipe.instructions && (
                    <div>
                      <h5 className="font-semibold text-gray-100 mb-2">Instructions</h5>
                      <p className="text-gray-400 whitespace-pre-wrap text-sm">
                        {recipe.instructions}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RecipePostCreator;
