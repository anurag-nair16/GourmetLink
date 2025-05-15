import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaUtensils, FaCalendarAlt, FaMagic, FaPlus, FaTimes, FaSearch } from 'react-icons/fa';

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState(null);
  const location = useLocation();

  const routes = [
    {
      path: '/submit-recipe',
      name: 'Submit Recipe',
      icon: FaUtensils,
      description: 'Share your culinary creations with the community',
      color: 'bg-amber-500',
    },
    {
      path: '/meal-planner',
      name: 'Meal Plan',
      icon: FaCalendarAlt,
      description: 'Plan your weekly meals with smart scheduling',
      color: 'bg-blue-500',
    },
    {
      path: '/recipe-generator',
      name: 'Recipe Generator',
      icon: FaMagic,
      description: 'Generate custom recipes from your available ingredients',
      color: 'bg-purple-500',
    },
    {
      path: '/cheat-day',
      name: 'Cheat Day',
      icon: FaSearch,
      description: 'Find nearby restaurants for your favorite dishes',
      color: 'bg-orange-500',
    },
  ];

  const buttonSize = 56; // Floating button size (w-14 h-14 = 56px)
  const radius = 105; // Radius of the concentric circle
  // Top-left quarter (90° to 180°, i.e., from π/2 to π radians)
  const startAngle = Math.PI / 2; // 90° (top)
  const endAngle = Math.PI; // 180° (left)
  const angleSpan = endAngle - startAngle; // Span of the quarter circle
  const angle = routes.length > 1 ? angleSpan / (routes.length - 1) : 0; // Angle between each menu item

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <div
            className="absolute"
            style={{
              bottom: buttonSize / 2, // Center on the floating button vertically
              right: buttonSize / 2, // Center on the floating button horizontally
            }}
          >
            {routes.map((route, index) => {
              // Calculate position on the quarter circle (90° to 180°)
              const itemAngle = startAngle + angle * index;
              // Invert y to move buttons above the floating button
              const x = Math.cos(itemAngle) * radius;
              const y = -Math.sin(itemAngle) * radius; // Negative y to position above

              return (
                <div
                  key={route.path}
                  className="absolute"
                  style={{ transform: 'translate(-50%, -50%)' }}
                >
                  <motion.div
                    initial={{ scale: 0, x: 0, y: 0 }}
                    animate={{
                      scale: 1,
                      x: x,
                      y: y,
                    }}
                    exit={{
                      scale: 0,
                      x: 0,
                      y: 0,
                    }}
                    transition={{
                      type: 'spring',
                      stiffness: 400,
                      damping: 17,
                      delay: index * 0.05,
                    }}
                    className="relative"
                    onMouseEnter={() => setActiveTooltip(index)}
                    onMouseLeave={() => setActiveTooltip(null)}
                    onClick={() =>
                      setActiveTooltip(activeTooltip === index ? null : index)
                    }
                  >
                    <Link
                      to={route.path}
                      className={`w-12 h-12 ${route.color} rounded-full shadow-lg flex items-center justify-center text-white hover:scale-110 transition-transform`}
                      onClick={() => {
                        setIsOpen(false);
                        setActiveTooltip(null);
                      }}
                    >
                      <route.icon className="text-xl" />
                    </Link>

                    {/* Tooltip */}
                    <AnimatePresence>
                      {activeTooltip === index && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="absolute z-[100] w-48"
                          style={{
                            // Custom positioning for tooltips based on index
                            top:
                              index === 0
                                ? 'calc(-160% - 60px)' // Submit Recipe (topmost)
                                : index === 1
                                ? 'calc(-120% - 50px)' // Meal Plan
                                : index === 2
                                ? 'calc(-100% - 40px)' // Recipe Generator
                                : 'calc(-80% - 30px)', // Cheat Day (leftmost)
                            left:
                              index === 0
                                ? 'calc(-80% - 80px)' // Submit Recipe
                                : index === 1
                                ? 'calc(-190% - 40px)' // Meal Plan
                                : index === 2
                                ? 'calc(-220% - 100px)' // Recipe Generator
                                : 'calc(-240% - 120px)', // Cheat Day
                            transform: 'translateX(0)', // Reset transform for custom positioning
                          }}
                        >
                          <div className="bg-white rounded-lg shadow-xl p-3 border border-gray-200">
                            <p className="font-semibold text-gray-800 mb-1">
                              {route.name}
                            </p>
                            <p className="text-sm text-gray-600">
                              {route.description}
                            </p>
                            <div
                              className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-gray-200"
                              style={{
                                left:
                                  index === 0
                                    ? '70%' // Submit Recipe
                                    : index === 1
                                    ? '80%' // Meal Plan
                                    : index === 2
                                    ? '40%' // Recipe Generator
                                    : '30%', // Cheat Day
                              }}
                            ></div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsOpen(!isOpen);
          if (isOpen) setActiveTooltip(null); // Close tooltips when closing menu
        }}
        className={`w-14 h-14 rounded-full bg-emerald-500 text-white shadow-lg flex items-center justify-center transition-all duration-300 ${
          isOpen ? 'rotate-45 bg-rose-500' : ''
        }`}
      >
        {isOpen ? (
          <FaTimes className="text-xl" />
        ) : (
          <FaPlus className="text-xl" />
        )}
      </motion.button>
    </div>
  );
};

export default Navigation;  