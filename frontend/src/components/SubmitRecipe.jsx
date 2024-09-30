import React, { useState } from "react";
import { FaUtensils, FaCamera, FaPlus } from "react-icons/fa";
import { MdDelete } from "react-icons/md";

const RecipeInput = () => {
  const [recipe, setRecipe] = useState({
    name: "",
    ingredients: [""],
    instructions: "",
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRecipe({ ...recipe, [name]: value });
    setErrors({ ...errors, [name]: "" });
  };

  const handleIngredientChange = (index, value) => {
    const newIngredients = [...recipe.ingredients];
    newIngredients[index] = value;
    setRecipe({ ...recipe, ingredients: newIngredients });
    setErrors({ ...errors, ingredients: "" });
  };

  const addIngredient = () => {
    setRecipe({ ...recipe, ingredients: [...recipe.ingredients, ""] });
  };

  const removeIngredient = (index) => {
    const newIngredients = recipe.ingredients.filter((_, i) => i !== index);
    setRecipe({ ...recipe, ingredients: newIngredients });
  };

  const handleImageUpload = (e) => {
    setIsLoading(true);
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRecipe({ ...recipe, image: reader.result });
        setIsLoading(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!recipe.name.trim()) newErrors.name = "Recipe name is required";
    if (recipe.ingredients.every((ing) => !ing.trim()))
      newErrors.ingredients = "Please add at least one ingredient";
    if (!recipe.instructions.trim())
      newErrors.instructions = "Instructions are required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // Submit the form
      console.log("Form submitted:", recipe);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <br />
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Add a New Recipe
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="recipe-name" className="sr-only">
                Recipe Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUtensils className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  id="recipe-name"
                  name="name"
                  type="text"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm pl-10 bg-gray-700 text-white`}
                  placeholder="Recipe Name"
                  value={recipe.name}
                  onChange={handleChange}
                  aria-invalid={errors.name ? "true" : "false"}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
              </div>
            </div>
            {errors.name && (
              <p
                className="mt-2 text-sm text-red-500"
                id="name-error"
                role="alert"
              >
                {errors.name}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="ingredients" className="sr-only">
              Ingredients
            </label>
            {recipe.ingredients.map((ingredient, index) => (
              <div key={index} className="flex mt-2">
                <input
                  type="text"
                  value={ingredient}
                  onChange={(e) => handleIngredientChange(index, e.target.value)}
                  className={`flex-grow appearance-none rounded-none relative block w-full px-3 py-2 border ${
                    errors.ingredients ? "border-red-500" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-700 text-white`}
                  placeholder={`Ingredient ${index + 1}`}
                  aria-label={`Ingredient ${index + 1}`}
                />
                <button
                  type="button"
                  onClick={() => removeIngredient(index)}
                  className="ml-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  aria-label={`Remove ingredient ${index + 1}`}
                >
                  <MdDelete className="h-5 w-5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addIngredient}
              className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <FaPlus className="mr-2" /> Add Ingredient
            </button>
            {errors.ingredients && (
              <p
                className="mt-2 text-sm text-red-500"
                id="ingredients-error"
                role="alert"
              >
                {errors.ingredients}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="instructions" className="sr-only">
              Instructions
            </label>
            <textarea
              id="instructions"
              name="instructions"
              rows="4"
              className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                errors.instructions ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm bg-gray-700 text-white`}
              placeholder="Instructions"
              value={recipe.instructions}
              onChange={handleChange}
              aria-invalid={errors.instructions ? "true" : "false"}
              aria-describedby={errors.instructions ? "instructions-error" : undefined}
            ></textarea>
            {errors.instructions && (
              <p
                className="mt-2 text-sm text-red-500"
                id="instructions-error"
                role="alert"
              >
                {errors.instructions}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="image-upload" className="sr-only">
              Upload Image
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-indigo-500 transition-colors duration-300">
              <div className="space-y-1 text-center">
                <FaCamera className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="image-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500"
                  >
                    <span>Upload a file</span>
                    <input
                      id="image-upload"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                  <p className="pl-1 text-white">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
              </div>
            </div>
            {isLoading && (
              <div className="mt-2 text-center">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                <p className="mt-2 text-sm text-gray-500">Uploading image...</p>
              </div>
            )}
            {recipe.image && (
              <div className="mt-2">
                <img
                  src={recipe.image}
                  alt="Recipe"
                  className="mx-auto h-32 w-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-300"
            >
              Submit Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecipeInput;
