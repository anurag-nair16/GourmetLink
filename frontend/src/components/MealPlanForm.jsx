import React, { useState, useEffect } from "react";
import axios from "axios";

const MealPlanForm = ({ onPlanSaved, selectedPlan }) => {
  const [name, setName] = useState(selectedPlan?.name || "My Meal Plan");
  const [startDate, setStartDate] = useState(selectedPlan?.start_date || "");
  const [duration, setDuration] = useState(selectedPlan?.duration || "week");
  const [recipes, setRecipes] = useState([]);
  const [entries, setEntries] = useState(selectedPlan?.entries || []);

  useEffect(() => {
    fetchRecipes();
    if (selectedPlan) {
      setName(selectedPlan.name);
      setStartDate(selectedPlan.start_date);
      setDuration(selectedPlan.duration);
      setEntries(selectedPlan.entries);
    }
  }, [selectedPlan]);

  const fetchRecipes = async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setRecipes(response.data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const data = { name, start_date: startDate, duration, entries };
    try {
      if (selectedPlan) {
        await axios.put(`${process.env.REACT_APP_API_URL}/meal-plans/${selectedPlan.id}/`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${process.env.REACT_APP_API_URL}/meal-plans/`, data, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      onPlanSaved();
      setEntries([]);
    } catch (err) {
      console.error("Error saving meal plan:", err);
    }
  };

  const addEntry = (recipeId) => {
    setEntries([...entries, { recipe_id: recipeId, day: 1, meal_type: "breakfast", servings: 1 }]);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-emerald-400 mb-4">
        {selectedPlan ? "Edit" : "Create"} Meal Plan
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Plan Name"
          className="w-full p-3 bg-gray-700 rounded-lg text-white"
        />
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded-lg text-white"
        />
        <select
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="w-full p-3 bg-gray-700 rounded-lg text-white"
        >
          <option value="week">Week</option>
          <option value="month">Month</option>
        </select>
        <div className="max-h-40 overflow-y-auto space-y-2">
          {recipes.map((recipe) => (
            <button
              key={recipe.id}
              type="button"
              onClick={() => addEntry(recipe.id)}
              className="w-full p-2 bg-gray-600 rounded-lg text-left hover:bg-gray-500"
            >
              {recipe.recipe.name}
            </button>
          ))}
        </div>
        <button type="submit" className="w-full p-3 bg-emerald-600 rounded-lg hover:bg-emerald-700">
          Save Meal Plan
        </button>
      </div>
    </form>
  );
};

export default MealPlanForm;