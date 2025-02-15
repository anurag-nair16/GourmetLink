import React, { useState, useEffect } from 'react';
import { FaTimes } from 'react-icons/fa';

const PopupMessage = ({ message }) => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(false);
    }, 3000); // Display message for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-emerald-600 text-white px-4 py-2 rounded shadow-lg flex items-center">
      <span>{message}</span>
      <button onClick={() => setShow(false)} className="ml-4">
        <FaTimes />
      </button>
    </div>
  );
};

export default PopupMessage;