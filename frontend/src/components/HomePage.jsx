import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from 'react-spring';
import { Link } from 'react-router-dom';
import {
  FaUtensils,
  FaSearch,
  FaHeart,
  FaUserFriends,
  FaGlobe,
  FaArrowRight,
  FaLeaf,
  FaFire,
  FaSeedling,
  FaPlay,
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
      setTimeout(() => setShowModal(true), 2000); // Faster trigger for better UX
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
      icon: <FaUtensils className="text-4xl text-emerald-500" />,
      title: 'Share Recipes',
      description: 'Showcase your culinary creations with vibrant photos and step-by-step guides.',
    },
    {
      icon: <FaSearch className="text-4xl text-emerald-500" />,
      title: 'Discover',
      description: 'Uncover authentic recipes from chefs and home cooks worldwide.',
    },
    {
      icon: <FaHeart className="text-4xl text-emerald-500" />,
      title: 'Save Favorites',
      description: 'Build your personal recipe library for every mood and moment.',
    },
    {
      icon: <FaUserFriends className="text-4xl text-emerald-500" />,
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

  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);
  const scrollAnim = useSpring({
    transform: `translateX(-${scrollPosition}px)`,
    config: { tension: 150, friction: 40 },
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (containerRef.current) {
        const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
        setScrollPosition((prev) => (prev >= maxScroll ? 0 : prev + 1));
      }
    }, 16);
    return () => clearInterval(interval);
  }, []);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-x-hidden">
      {/* Welcome Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-gray-850 rounded-2xl overflow-hidden max-w-lg w-full shadow-2xl border border-emerald-500/20"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1543352634-99a5d50ae78e?ixlib=rb-1.2.1"
                  alt="Food collage"
                  className="w-full h-full object-cover transform transition-transform duration-500 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-4 right-4 w-10 h-10 rounded-full bg-gray-900/70 flex items-center justify-center text-white hover:bg-gray-800 transition-all duration-300"
                >
                  ✕
                </button>
              </div>
              <div className="p-8 text-center">
                <h3 className="text-3xl font-extrabold text-emerald-400 mb-4 tracking-tight">
                  Welcome to Your Culinary Adventure!
                </h3>
                <p className="text-gray-200 mb-8 text-lg">
                  Discover, create, and connect with a global community of food enthusiasts.
                </p>
                <div className="flex justify-center gap-4">
                  <Link
                    to="/signup"
                    className="px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-all duration-300 shadow-md hover:shadow-lg"
                    onClick={() => setShowModal(false)}
                  >
                    Get Started
                  </Link>
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-6 py-3 bg-transparent text-emerald-300 border border-emerald-500/50 rounded-full hover:bg-emerald-900/50 transition-all duration-300"
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
        transition={{ duration: 1.2 }}
        className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-gray-900 to-gray-800"
      >
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-50"
          >
            <source
              src="/videos/mixkit-preparing-a-bowl-with-yogurt-and-fruit-43925-full-hd.mp4"
              type="video/mp4"
            />
          </video>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-transparent" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-5xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: 'easeOut' }}
            className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-white mb-6 leading-tight tracking-tight"
          >
            <span className="block">Savor the</span>
            <span className="block text-emerald-400">World’s Flavors</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto"
          >
            Share your recipes, explore global cuisines, and unite with food lovers everywhere.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/submit-recipe"
              className="group relative px-8 py-4 bg-emerald-600 text-white rounded-full font-semibold overflow-hidden shadow-md hover:shadow-xl transition-all duration-300"
            >
              <span className="absolute inset-0 bg-emerald-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-out" />
              <span className="relative z-10 flex items-center justify-center gap-2 text-xl font-medium tracking-wide">
                Start Cooking
                <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </span>
            </Link>
            <Link
              to="/posts"
              className="group px-8 py-4 bg-transparent border-2 border-emerald-500 text-emerald-300 rounded-full font-semibold hover:bg-emerald-500/20 hover:border-emerald-400 transition-all duration-300 shadow-md hover:shadow-xl"
            >
              <span className="flex items-center justify-center gap-2 text-xl font-medium tracking-wide">
                Discover Now
                <FaArrowRight className="transform group-hover:translate-x-1 transition-transform duration-300 ease-out" />
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-24 bg-gray-850 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Your Culinary Journey Starts Here
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Unleash your inner chef with tools and a community designed for food lovers.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="bg-gray-900 p-8 rounded-2xl border border-gray-800 hover:border-emerald-500/50 group transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-semibold text-emerald-400 mb-4 group-hover:text-emerald-300 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-24 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1547592180-85f173990554')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
              Taste the World
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              From spicy curries to delicate sushi, explore cuisines that ignite your palate.
            </p>
          </motion.div>

          <div className="relative overflow-hidden py-8">
            <animated.div
              ref={containerRef}
              className="flex space-x-6"
              style={scrollAnim}
            >
              {cuisineImages.concat(cuisineImages).map((cuisine, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-64 relative group rounded-xl overflow-hidden shadow-lg"
                  onHoverStart={() => setHoveredCuisine(index)}
                  onHoverEnd={() => setHoveredCuisine(null)}
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={cuisine.image}
                    alt={cuisine.tag}
                    className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-lg font-semibold text-white group-hover:text-emerald-300 transition-colors duration-300">
                      {cuisine.tag}
                    </p>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: hoveredCuisine === index ? 1 : 0, y: hoveredCuisine === index ? 0 : 10 }}
                      className="mt-2"
                    >
                      <Link
                        to="/posts"
                        className="inline-flex items-center px-4 py-2 bg-emerald-500/20 text-emerald-300 rounded-full hover:bg-emerald-500/40 transition-all duration-300"
                      >
                        Explore <FaArrowRight className="ml-2" />
                      </Link>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </animated.div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-gray-850">
        <div className="container mx-auto px-6">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl md:text-5xl font-bold text-center text-white mb-16 tracking-tight"
          >
            What Our Community Says
          </motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="bg-gray-900 p-6 rounded-xl border border-gray-800 hover:border-emerald-500/50 transition-all duration-300"
              >
                <FaQuoteLeft className="text-emerald-500 text-3xl mb-4" />
                <p className="text-gray-300 mb-4 italic">"{testimonial.quote}"</p>
                <p className="text-emerald-400 font-semibold">{testimonial.author}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-emerald-700 to-teal-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1504674900247-0877df9cc836')] bg-cover bg-center opacity-10" />
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-6xl font-extrabold text-white mb-8 tracking-tight"
          >
            Join the Flavor Revolution
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto"
          >
            Become part of a vibrant community where every dish tells a story. Sign up now!
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center gap-6"
          >
            <Link
              to="/signup"
              className="group px-10 py-5 bg-white text-emerald-700 rounded-full font-bold text-lg shadow-lg hover:bg-emerald-50 hover:shadow-xl transition-all duration-300 flex items-center"
            >
              Join Now <FaArrowRight className="ml-3 group-hover:translate-x-2 transition-transform duration-300" />
            </Link>
            <Link
              to="/posts"
              className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-full font-bold text-lg hover:bg-white/10 transition-all duration-300"
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
  // Assuming this is defined elsewhere in your app; included for completeness
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`relative flex items-center space-x-2 text-white px-4 py-2 rounded-full 
        transition-all duration-300 group overflow-hidden ${extraClass} ${
          scrollY > 50 ? 'text-sm' : 'text-base'
        }`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-teal-500/20 to-teal-500/0 
        transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
      <span className="relative z-10 flex items-center space-x-2">
        <span className="transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </span>
        <span className="bg-clip-text group-hover:text-transparent 
          group-hover:bg-gradient-to-r group-hover:from-teal-400 group-hover:to-yellow-400 
          transition-all duration-300">
          {text}
        </span>
      </span>
    </Link>
  );
};

export default Home;