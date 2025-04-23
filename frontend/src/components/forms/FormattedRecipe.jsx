// src/forms/FormattedRecipe.jsx
import React from 'react';
import { FaClock, FaUtensils, FaUsers, FaListUl, FaClipboardCheck, FaLightbulb } from 'react-icons/fa';
import { GiCook, GiMeal } from 'react-icons/gi';

const FormattedRecipe = ({ recipeText, currentUser }) => {
  // Function to format current date and time
  const formatDateTime = () => {
    const now = new Date();
    return now.toISOString().slice(0, 19).replace('T', ' ');
  };

  // Parse the recipe text into sections
  const parseRecipe = (text) => {
    const sections = {};
    let currentSection = '';
    
    const lines = text.split('\n');
    lines.forEach(line => {
      if (line.includes('Recipe Name:')) {
        sections.name = line.split(':')[1].trim();
      } else if (line.includes('Preparation Time:')) {
        sections.prepTime = line.split(':')[1].trim();
      } else if (line.includes('Cooking Time:')) {
        sections.cookTime = line.split(':')[1].trim();
      } else if (line.includes('Total Time:')) {
        sections.totalTime = line.split(':')[1].trim();
      } else if (line.includes('Servings:')) {
        sections.servings = line.split(':')[1].trim();
      } else if (line.includes('Ingredients:')) {
        currentSection = 'ingredients';
        sections.ingredients = [];
      } else if (line.includes('Instructions:')) {
        currentSection = 'instructions';
        sections.instructions = [];
      } else if (line.includes('Nutritional Information')) {
        currentSection = 'nutrition';
        sections.nutrition = [];
      } else if (line.includes('Tips:')) {
        currentSection = 'tips';
        sections.tips = [];
      } else if (line.trim() !== '') {
        if (currentSection === 'ingredients' && line.includes('*')) {
          sections.ingredients.push(line.replace('*', '').trim());
        } else if (currentSection === 'instructions' && line.includes('.')) {
          sections.instructions.push(line.trim());
        } else if (currentSection === 'nutrition' && line.includes('-')) {
          sections.nutrition.push(line.replace('-', '').trim());
        } else if (currentSection === 'tips') {
          sections.tips.push(line.trim());
        }
      }
    });

    return sections;
  };

  const recipe = parseRecipe(recipeText);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8">
      {/* Recipe Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-primary-main mb-2">{recipe.name}</h1>
        <div className="flex justify-center items-center gap-4 text-neutral-600">
          <span className="flex items-center gap-1">
            <FaClock className="text-primary-main" />
            {recipe.totalTime}
          </span>
          <span className="flex items-center gap-1">
            <FaUsers className="text-primary-main" />
            {recipe.servings}
          </span>
        </div>
      </div>

      {/* Time Information */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-neutral-50 rounded-lg">
          <FaClock className="text-primary-main text-xl mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Prep Time</p>
          <p className="font-semibold">{recipe.prepTime}</p>
        </div>
        <div className="text-center p-4 bg-neutral-50 rounded-lg">
          <GiCook className="text-primary-main text-xl mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Cook Time</p>
          <p className="font-semibold">{recipe.cookTime}</p>
        </div>
        <div className="text-center p-4 bg-neutral-50 rounded-lg">
          <GiMeal className="text-primary-main text-xl mx-auto mb-2" />
          <p className="text-sm text-neutral-600">Total Time</p>
          <p className="font-semibold">{recipe.totalTime}</p>
        </div>
      </div>

      {/* Ingredients */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
          <FaListUl className="text-primary-main" />
          Ingredients
        </h2>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {recipe.ingredients?.map((ingredient, index) => (
            <li key={index} className="flex items-center gap-2 p-2 bg-neutral-50 rounded-lg">
              <span className="w-2 h-2 bg-primary-main rounded-full" />
              {ingredient}
            </li>
          ))}
        </ul>
      </div>

      {/* Instructions */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
          <FaClipboardCheck className="text-primary-main" />
          Instructions
        </h2>
        <ol className="space-y-4">
          {recipe.instructions?.map((instruction, index) => (
            <li key={index} className="flex gap-4 items-start">
              <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-primary-main text-white rounded-full">
                {index + 1}
              </span>
              <p className="flex-1">{instruction.replace(/^\d+\.\s*/, '')}</p>
            </li>
          ))}
        </ol>
      </div>

      {/* Nutritional Information */}
      <div className="mb-8">
        <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
          <FaUtensils className="text-primary-main" />
          Nutritional Information
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recipe.nutrition?.map((info, index) => (
            <div key={index} className="p-3 bg-neutral-50 rounded-lg text-center">
              {info}
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      {recipe.tips && recipe.tips.length > 0 && (
        <div className="mb-8">
          <h2 className="flex items-center gap-2 text-2xl font-semibold mb-4">
            <FaLightbulb className="text-primary-main" />
            Pro Tips
          </h2>
          <ul className="space-y-3">
            {recipe.tips.map((tip, index) => (
              <li key={index} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-lg">
                <FaLightbulb className="flex-shrink-0 text-primary-main mt-1" />
                <p>{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-4 border-t border-neutral-200 text-sm text-neutral-600">
        <p>Recipe generated on: {formatDateTime()} UTC</p>
        <p>Chef: @{currentUser}</p>
      </div>
    </div>
  );
};

export default FormattedRecipe;