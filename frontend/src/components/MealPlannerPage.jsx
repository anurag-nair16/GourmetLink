import React, { useState, useEffect } from "react";
import axios from "axios";
import MealPlanForm from "./MealPlanForm";
import MealPlanCalendar from "./forms/MealPlanCalendar";
import ShoppingList from "./forms/ShoppingList";

const MealPlannerPage = () => {
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [shoppingList, setShoppingList] = useState([]);

  useEffect(() => {
    fetchMealPlans();
  }, []);

  const fetchMealPlans = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/meal-plans/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMealPlans(response.data);
    } catch (err) {
      console.error("Error fetching meal plans:", err);
    }
  };

  const fetchShoppingList = async (planId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/meal-plans/${planId}/shopping-list/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShoppingList(response.data.items);
    } catch (err) {
      console.error("Error fetching shopping list:", err);
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    fetchShoppingList(plan.id);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4">
      <h1 className="text-4xl font-bold text-center text-emerald-400 mb-8">Meal Planner</h1>
      <div className="container mx-auto max-w-5xl grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <MealPlanForm onPlanSaved={fetchMealPlans} selectedPlan={selectedPlan} />
          <div className="mt-6 space-y-4">
            {mealPlans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => handlePlanSelect(plan)}
                className={`w-full p-4 rounded-lg text-left ${
                  selectedPlan?.id === plan.id ? "bg-emerald-600" : "bg-gray-800"
                } hover:bg-emerald-700 transition-all duration-300`}
              >
                {plan.name} ({plan.duration})
              </button>
            ))}
          </div>
        </div>
        <div className="lg:col-span-2">
          {selectedPlan && <MealPlanCalendar plan={selectedPlan} />}
          {shoppingList.length > 0 && <ShoppingList items={shoppingList} />}
        </div>
      </div>
    </div>
  );
};

export default MealPlannerPage;