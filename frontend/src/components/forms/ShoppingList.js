import React from "react";

const ShoppingList = ({ items }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg mt-6">
    <h2 className="text-2xl font-semibold text-emerald-400 mb-4">Shopping List</h2>
    <ul className="space-y-2">
      {items.map((item, index) => (
        <li key={index} className="text-gray-300">
          {item.name}: {item.quantity} {item.unit}
        </li>
      ))}
    </ul>
  </div>
);

export default ShoppingList;