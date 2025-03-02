import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSpring, animated } from "react-spring";
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

  useEffect(() => {
    setIsPageLoaded(true);

    const hasVisited = localStorage.getItem('hasVisited');
    if (!hasVisited) {
      setTimeout(() => setShowModal(true), 3000);
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
      description:
        'Upload your culinary masterpieces with detailed photos, steps, and secret techniques',
    },
    {
      icon: <FaSearch className="text-4xl text-emerald-500" />,
      title: 'Discover',
      description:
        'Explore authentic global recipes from professional chefs and passionate home cooks',
    },
    {
      icon: <FaHeart className="text-4xl text-emerald-500" />,
      title: 'Save Favorites',
      description:
        'Curate your personal collection of go-to recipes for any occasion or craving',
    },
    {
      icon: <FaUserFriends className="text-4xl text-emerald-500" />,
      title: 'Community',
      description:
        'Connect with fellow food enthusiasts, share cooking tips, and join culinary challenges',
    },
  ];


  const [scrollPosition, setScrollPosition] = useState(0);
  const containerRef = useRef(null);

  // Smooth scroll animation
  const scrollAnim = useSpring({
    transform: `translateX(-${scrollPosition}px)`,
    config: { tension: 120, friction: 30 },
  });

  const handleScroll = () => {
    if (containerRef.current) {
      setScrollPosition((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const interval = setInterval(handleScroll, 16); // ~60fps for smooth animation
    return () => clearInterval(interval); // Clean up interval on unmount
  }, []);

  const categoryCarouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    centerMode: true,
    centerPadding: '0px',
  };

  const interestedVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Welcome Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gray-800 rounded-xl overflow-hidden max-w-md w-full"
            >
              <div className="relative h-40 overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1543352634-99a5d50ae78e?ixlib=rb-1.2.1"
                  alt="Food collage"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-800 to-transparent" />
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70"
                >
                  ✕
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-emerald-400 mb-4">
                  Welcome, Food Lover!
                </h3>
                <p className="text-gray-300 mb-6">
                  Join our global culinary community and embark on a delicious
                  journey of discovery, creation, and connection.
                </p>
                <div className="flex justify-between">
                  <button
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 bg-transparent text-gray-400 hover:text-white"
                  >
                    Explore First
                  </button>
                  <Link
                    to="/signup"
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    onClick={() => setShowModal(false)}
                  >
                    Join Now
                  </Link>
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
        className="relative h-screen flex items-center justify-center overflow-hidden"
      >
        {/* Video Background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-black/60 z-10"></div>
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute top-0 left-0 w-full h-full object-cover"
          >
            <source
              src="/videos/mixkit-preparing-a-bowl-with-yogurt-and-fruit-43925-full-hd.mp4"
              type="video/mp4"
            />
            Your browser does not support the video tag.
          </video>
        </div>

        {/* Content Overlay */}
        <div className="relative z-20 text-center px-4 max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 50 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">Cook</span>
              <span className="block text-emerald-400">Share</span>
              <span className="block">Enjoy</span>
            </h1>
            <div className="w-24 h-1 bg-emerald-500 mx-auto my-8"></div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 30 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            Join our culinary community where passion meets plate. Share your
            recipes, discover new flavors, and connect with food lovers
            worldwide.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: isPageLoaded ? 1 : 0, y: isPageLoaded ? 0 : 30 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col md:flex-row gap-6 justify-center"
          >
            <Link
              to="/submit-recipe"
              className="group relative px-8 py-4 bg-emerald-600 text-white rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 w-0 bg-emerald-700 transition-all duration-500 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center justify-center">
                Share Your Recipe
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
            <Link
              to="/posts"
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full overflow-hidden hover:bg-white/20 transition-colors duration-300"
            >
              <span className="relative flex items-center justify-center">
                Explore Recipes
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </motion.div>
        </div>

        {/* Scrolling Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isPageLoaded ? 1 : 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-20"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="flex flex-col items-center"
          ></motion.div>
        </motion.div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white mb-16"
          >
            Why Choose Our Platform?
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300 border border-gray-700 hover:border-emerald-600/50 group"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="mb-6 transform group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white mt-4 mb-2 group-hover:text-emerald-400 transition-colors duration-300">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-900 relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1547592180-85f173990554?ixlib=rb-1.2.1"
          alt="Food background"
          className="w-full h-full object-cover"
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Explore Global Cuisines</h2>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Dive into recipes from every corner of the world, from traditional
            classics to modern innovations
          </p>
        </motion.div>

        {/* Infinite Scroll (Using react-spring for smooth scrolling) */}
        <div className="overflow-hidden relative">
          <animated.div
            ref={containerRef}
            className="flex space-x-8"
            style={scrollAnim}
          >
            {cuisineImages.concat(cuisineImages).map((cuisine, index) => (
              <div key={index} className="flex-shrink-0">
                <div className="relative group">
                  <img
                    src={cuisine.image}
                    alt={cuisine.tag}
                    className="w-48 h-48 object-cover rounded-xl shadow-lg transition-all duration-300 ease-in-out transform group-hover:scale-105"
                  />
                  <p className="text-center mt-2 text-gray-300">{cuisine.tag}</p>
                </div>
              </div>
            ))}
          </animated.div>
        </div>
      </div>
    </section>



<section className="py-24 bg-emerald-700">
        <div className="container mx-auto px-4 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-5xl font-bold text-white mb-8"
          >
            Ready to Join the Culinary Revolution?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl text-gray-200 mb-12 max-w-3xl mx-auto"
          >
            Sign up today and start sharing your favorite recipes, discovering new cuisines, and connecting with a passionate community of food lovers.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <Link
              to="/signup"
              className="px-8 py-4 bg-white text-emerald-700 rounded-full font-semibold text-lg hover:bg-emerald-100 transition-colors duration-300"
            >
              Join Our Community
            </Link>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default Home;
