import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  FaUtensils,
  FaSearch,
  FaHeart,
  FaUserFriends,
  FaArrowRight,
  FaQuoteLeft,
} from 'react-icons/fa';

import italianImage from '../assets/images/italian.jpeg';
import japaneseImage from '../assets/images/japanese.jpeg';
import mexicanImage from '../assets/images/mexican.jpeg';
import indianImage from '../assets/images/indian.jpeg';
import thaiImage from '../assets/images/thai.jpeg';
import frenchImage from '../assets/images/french.jpeg';
import mediterraneanImage from '../assets/images/mediterranean.jpeg';
import chineseImage from '../assets/images/chinese.jpeg';
import americanImage from '../assets/images/american.jpeg';
import dessertsImage from '../assets/images/dessert.jpeg';
import veganImage from '../assets/images/vegan.jpeg';
import seafoodImage from '../assets/images/seafood.jpeg';

const Home = () => {
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [hoveredCuisine, setHoveredCuisine] = useState(null);

  useEffect(() => {
    setIsPageLoaded(true);
    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setTimeout(() => setShowModal(true), 2000);
      localStorage.setItem('hasVisited', 'true');
    }
  }, []);

  const cuisineImages = [
    { tag: 'Italian', image: italianImage },
    { tag: 'Japanese', image: japaneseImage },
    { tag: 'Mexican', image: mexicanImage },
    { tag: 'Indian', image: indianImage },
    { tag: 'Thai', image: thaiImage },
    { tag: 'French', image: frenchImage },
    { tag: 'Mediterranean', image: mediterraneanImage },
    { tag: 'Chinese', image: chineseImage },
    { tag: 'American', image: americanImage },
    { tag: 'Desserts', image: dessertsImage },
    { tag: 'Vegan', image: veganImage },
    { tag: 'Seafood', image: seafoodImage },
  ];

  const features = [
    {
      icon: <FaUtensils className="text-4xl text-orange-500" />,
      title: 'Share Recipes',
      description: 'Showcase your culinary creations with vibrant photos and step-by-step guides.',
    },
    {
      icon: <FaSearch className="text-4xl text-orange-500" />,
      title: 'Discover',
      description: 'Uncover authentic recipes from chefs and home cooks worldwide.',
    },
    {
      icon: <FaHeart className="text-4xl text-orange-500" />,
      title: 'Save Favorites',
      description: 'Build your personal recipe library for every mood and moment.',
    },
    {
      icon: <FaUserFriends className="text-4xl text-orange-500" />,
      title: 'Community',
      description: 'Engage with food lovers, swap tips, and join tasty challenges.',
    },
  ];

  const testimonials = [
    {
      quote: "This platform transformed my cooking game—endless inspiration!",
      author: "Emma L., Home Cook",
    },
    {
      quote: "Connecting with foodies globally has been a delight.",
      author: "Raj S., Culinary Enthusiast",
    },
    {
      quote: "The best place to share and discover unique recipes.",
      author: "Sophie M., Chef",
    },
  ];

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  // Simple scrolling effect for cuisine images
  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (containerRef.current) {
        const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
        setScrollPosition((prev) => (prev >= maxScroll ? 0 : prev + 1));
      }
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {/* Welcome Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-white rounded-lg overflow-hidden max-w-lg w-full shadow-xl"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1543352634-99a5d50ae78e?ixlib=rb-1.2.1"
                  alt="Food collage"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/80 flex items-center justify-center text-gray-800 hover:bg-white transition-all duration-300"
                >
                  ✕
                </button>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Welcome to Culinary Connect
                </h3>
                <p className="text-gray-600 mb-6">
                  Discover, create, and connect with a global community of food enthusiasts.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    to="/signup"
                    className="px-6 py-2 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-all duration-300 shadow-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Get Started
                  </Link>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-2 bg-white text-orange-500 border border-orange-500 rounded-md hover:bg-orange-50 transition-all duration-300"
                  >
                    Explore Now
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: isPageLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center justify-center bg-white"
      >
        <div className="absolute inset-0 z-0 opacity-20">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source
              src="/videos/mixkit-preparing-a-bowl-with-yogurt-and-fruit-43925-full-hd.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        
        <div className="container mx-auto px-6 relative z-10 py-20">
          <div className="flex flex-col lg:flex-row items-center justify-center text-center lg:text-center">
            <div className="lg:w-1/2 mb-12 lg:mb-0">
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight text-center"
              >
                Discover & Share
                <span className="block text-orange-500">Exceptional Recipes</span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg text-gray-600 mb-8 max-w-lg mx-auto"
              >
                Connect with a global community of culinary enthusiasts. Find inspiration, share your creations, and elevate your cooking experience.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.8 }}
                className="flex flex-col lg:flex-row gap-4 justify-center"
              >
                <Link
                  to="/submit-recipe"
                  className="px-6 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-all duration-300 shadow-md flex items-center justify-center"
                >
                  Start Cooking
                  <FaArrowRight className="ml-2" />
                </Link>
                <Link
                  to="/posts"
                  className="px-6 py-3 bg-white border border-orange-500 text-orange-500 rounded-md font-medium hover:bg-orange-50 transition-all duration-300"
                >
                  Discover Now
                </Link>
              </motion.div>
            </div>
            <div className="lg:w-1/2 mt-12 lg:mt-0">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="relative rounded-lg overflow-hidden shadow-2xl"
              >
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
                  alt="Culinary masterpiece"
                  className="w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Your Culinary Journey Starts Here
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Unleash your inner chef with professional tools and a community designed for food lovers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-white p-8 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 border-t-4 border-orange-500"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Explore Global Cuisines
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              From spicy curries to delicate sushi, discover dishes that will expand your culinary horizons.
            </p>
          </motion.div>

          <div className="relative overflow-hidden py-4" ref={containerRef}>
            <div 
              className="flex space-x-6"
              style={{ transform: `translateX(-${scrollPosition}px)` }}
            >
              {cuisineImages.concat(cuisineImages).map((cuisine, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-64 relative group rounded-lg overflow-hidden shadow-md"
                  onHoverStart={() => setHoveredCuisine(index)}
                  onHoverEnd={() => setHoveredCuisine(null)}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={cuisine.image}
                    alt={cuisine.tag}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-lg font-medium text-white">
                      {cuisine.tag}
                    </p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: hoveredCuisine === index ? 1 : 0, y: hoveredCuisine === index ? 0 : 10 }}
                      className="mt-2"
                    >
                      <Link
                        to="/posts"
                        className="inline-flex items-center px-4 py-1 bg-orange-500 text-white rounded-full text-sm hover:bg-orange-600 transition-all duration-300"
                      >
                        Explore <FaArrowRight className="ml-1 text-xs" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-center text-gray-900 mb-16"
          >
            What Our Community Says
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-white p-6 rounded-lg shadow-lg border-l-4 border-orange-500"
              >
                <FaQuoteLeft className="text-orange-400 text-2xl mb-4" />
                <p className="text-gray-700 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-orange-600 font-medium">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-white border-t border-gray-200">
        <div className="container mx-auto px-6 text-center max-w-4xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          >
            Join Our Culinary Community Today
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-600 mb-10"
          >
            Become part of a network where every dish tells a story. Start sharing your recipes and culinary experiences.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-wrap justify-center gap-6"
          >
            <Link
              to="/signup"
              className="px-8 py-3 bg-orange-500 text-white rounded-md font-medium hover:bg-orange-600 transition-all duration-300 shadow-md flex items-center"
            >
              Join Now <FaArrowRight className="ml-2" />
            </Link>
            <Link
              to="/posts"
              className="px-8 py-3 bg-white border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
            >
              Browse Recipes
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

const NavItem = ({ icon, text, to, onClick, scrollY, extraClass = '' }) => {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`flex items-center space-x-2 text-gray-700 px-4 py-2 rounded-md 
        transition-all duration-300 hover:bg-orange-50 hover:text-orange-600 ${extraClass} ${
          scrollY > 50 ? 'text-sm' : 'text-base'
        }`}
    >
      <span>{icon}</span>
      <span>{text}</span>
    </Link>
  );
};

export default Home;