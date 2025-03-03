import React from "react";

const MealPlanCalendar = ({ plan }) => {
  const days = plan.duration === "week" ? 7 : 31;
  const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-emerald-400 mb-4">{plan.name}</h2>
      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {Array.from({ length: days }, (_, i) => (
          <div key={i} className="bg-gray-700 p-4 rounded-lg">
            <h3 className="text-lg font-medium text-white mb-2">Day {i + 1}</h3>
            {mealTypes.map((type) => {
              const entry = plan.entries.find((e) => e.day === i + 1 && e.meal_type === type);
              return (
                <div key={type} className="mb-2">
                  <p className="text-gray-400 capitalize">{type}</p>
                  <p className="text-white">
                    {entry ? `${entry.recipe.name} (${entry.servings} servings)` : "-"}
                  </p>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanCalendar;