import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const popupVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.5 } },
};

const PopupMessage = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000); // Auto close after 3 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          className="w-full text-center bg-emerald-600 text-white px-4 py-2 rounded shadow-lg flex items-center gap-2 mb-4"
          variants={popupVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          <FaCheckCircle />
          <span className="flex-1">{message}</span>
          <button onClick={onClose} className="text-white">
            <FaTimesCircle />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PopupMessage;