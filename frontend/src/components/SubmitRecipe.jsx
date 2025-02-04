import React, { useState } from "react";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Box, Container } from "@mui/material";

const darkBlueTheme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#1E3A8A",
    },
    background: {
      default: "#1e293b",
      paper: "#1e2a47",
    },
    text: {
      primary: "#ffffff",
      secondary: "#a3b1c6",
    },
  },
});

const RecipePostCreator = () => {
  const [recipe, setRecipe] = useState({
    name: "",
    ingredients: [""],
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

    // Add the image file (not just the URL)
    if (recipe.image && recipe.image instanceof File) {
      formData.append("image", recipe.image);
    }

    console.log(formData)
  
    setIsLoading(true);
  
    fetch("http://localhost:8000/submit-recipe/", {
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
        });
      })
      .catch((error) => {
        setIsLoading(false);
        console.error("Error submitting recipe:", error);
      });
  };
  
  
  

  return (
    <ThemeProvider theme={darkBlueTheme}>
    <Box
      sx={{
        width: "100%",
        backgroundColor: "#233554", // Lighter shade for the background
        padding: { xs: "0", md: "0 10%" }, // No padding on xs (phones), 10% on md (desktops)
      }}
    >
    <Container maxWidth="100%" sx={{ padding: "50px 16px", backgroundColor: "#1e293b" }}>
    <div className="min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-[#2a3a4c] shadow-md rounded-lg mb-6 p-6">
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div
                className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center cursor-pointer relative overflow-hidden"
                onClick={() => document.getElementById("image-upload").click()}
              >
                {recipe.image ? (
                  // <img
                  //   src={recipe.image}
                  //   alt="Recipe"
                  //   className="w-full h-full object-cover"
                  // />
                  <img
                    src={URL.createObjectURL(recipe.image)}  // Create a preview URL for the uploaded file
                    alt="Recipe"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-indigo-500 text-sm">Add Photo</div>
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
              <div className="flex-1">
                {/* Recipe Name Input */}
                <div className="w-full overflow-x-auto">
                  <input
                    type="text"
                    name="name"
                    value={recipe.name}
                    onChange={handleChange}
                    placeholder="Recipe Name"
                    className="w-full text-2xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0 p-0 whitespace-nowrap overflow-x-auto text-white"
                    style={{
                      maxWidth: "100%", // Ensure it stays within the container
                    }}
                  />
                </div>

                {/* Cooking Time & Servings Inputs */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mt-2">
                  <input
                    type="number"
                    name="cookingTime"
                    value={recipe.cookingTime}
                    onChange={handleChange}
                    placeholder="Cooking time (in minutes)"
                    className="flex-1 bg-gray-100 rounded-full px-4 py-1 text-sm"
                    style={{
                      maxWidth: "100%", // Ensure it fits within the container
                    }}
                  />
                  <input
                    type="number"
                    name="servings"
                    value={recipe.servings}
                    onChange={handleChange}
                    placeholder="Servings"
                    className="flex-1 bg-gray-100 rounded-full px-4 py-1 text-sm"
                    style={{
                      maxWidth: "100%", // Ensure it fits within the container
                    }}
                  />
                </div>
              </div>

            </div>

            <div className="border-b border-gray-200 mb-6">
              <div className="flex gap-6">
                {["basic", "ingredients", "instructions"].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section)}
                    className={`pb-2 px-1 ${
                      activeSection === section
                        ? "border-b-2 border-indigo-500 text-indigo-500"
                        : "text-gray-500"
                    }`}
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            {activeSection === "basic" && (
              <div className="space-y-4">
                <select
                  name="cuisine"
                  value={recipe.cuisine}
                  onChange={handleChange}
                  className="w-full p-2 rounded-lg bg-gray-100 border-none"
                >
                  <option value="">Select Cuisine Type</option>
                  <option value="Italian">Italian</option>
                  <option value="Indian">Indian</option>
                  <option value="Mexican">Mexican</option>
                  <option value="Chinese">Chinese</option>
                </select>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && handleTagAdd()}
                      placeholder="Add tags (press Enter)"
                      className="flex-1 p-2 rounded-lg bg-gray-100 border-none"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-indigo-100 text-indigo-600 px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tag}
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="hover:text-indigo-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === "ingredients" && (
              <div className="space-y-3">
                {recipe.ingredients.map((ingredient, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={ingredient}
                      onChange={(e) => handleIngredientChange(index, e.target.value)}
                      placeholder="Add an ingredient"
                      className="flex-1 p-2 rounded-lg bg-gray-100 border-none"
                    />
                    <button
                      onClick={() => removeIngredient(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  onClick={addIngredient}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  + Add Ingredient
                </button>
              </div>
            )}

            {activeSection === "instructions" && (
              <textarea
                name="instructions"
                value={recipe.instructions}
                onChange={handleChange}
                placeholder="Share your cooking instructions..."
                className="w-full p-4 rounded-lg bg-gray-100 border-none min-h-[200px] resize-none"
              />
            )}
          </div>

          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-500 text-white py-3 rounded-lg hover:bg-indigo-600 transition-colors"
          >
            Share Recipe
          </button>
          {isLoading && <p className="text-indigo-500">Submitting your recipe...</p>}
          {successMessage && <p className="text-green-500">{successMessage}</p>}

        </div>

        {/* Preview Card */}
        <div className="lg:w-96">
          <div className="sticky top-8">
            <div className="bg-[#2a3a4c] shadow-md rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 text-white">Preview</h3>
              <div className="space-y-4">
                {recipe.image && (
                  <img
                    src={URL.createObjectURL(recipe.image)} // Create a preview URL for the uploaded file
                    alt="Recipe"
                    className="w-full h-full object-cover"
                  />
                )}
                <div>
                  <h4 className="text-xl font-semibold text-white">{recipe.name || "Recipe Name"}</h4>
                  {recipe.cuisine && (
                    <p className="text-gray-300 text-sm">{recipe.cuisine} Cuisine</p>
                  )}
                </div>
                {(recipe.cookingTime || recipe.servings) && (
                  <div className="flex gap-4 text-sm text-gray-300">
                    {recipe.cookingTime && <span>🕒 {recipe.cookingTime} mins</span>}
                    {recipe.servings && <span>🍽 {recipe.servings} servings</span>}
                  </div>
                )}
                {recipe.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {recipe.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="bg-gray-600 text-gray-100 px-3 py-1 rounded-full text-sm"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {recipe.ingredients.length > 0 && (
                  <div>
                    <h5 className="font-semibold mb-1 text-white">Ingredients</h5>
                    <ul className="list-disc list-inside text-sm text-gray-300">
                      {recipe.ingredients.map((ingredient, index) => (
                        <li key={index}>{ingredient}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {recipe.instructions && (
                  <div>
                    <h5 className="font-semibold mb-1 text-white">Instructions</h5>
                    <p className="text-sm text-gray-300 whitespace-pre-wrap">
                      {recipe.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
    </Container>
    </Box>
    </ThemeProvider>
  );
};

export default RecipePostCreator;
