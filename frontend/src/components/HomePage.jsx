import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUtensils, FaCamera, FaListAlt, FaShoppingCart, FaMapMarkerAlt, FaArrowRight } from 'react-icons/fa';

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
  const [scrollPosition, setScrollPosition] = useState(0);
  const [hoveredCuisine, setHoveredCuisine] = useState(null);

  const containerRef = useRef(null);

  useEffect(() => {
    setIsPageLoaded(true);
    const interval = setInterval(() => {
      if (containerRef.current) {
        const maxScroll = containerRef.current.scrollWidth - containerRef.current.clientWidth;
        setScrollPosition((prev) => (prev >= maxScroll ? 0 : prev + 1));
      }
    }, 30);
    return () => clearInterval(interval);
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
      title: 'Share & Discover Recipes',
      description: 'Join a global community of food lovers to share your unique recipes, complete with photos and nutritional insights, while exploring thousands of diverse, community-driven dishes from around the world.',
      image: "https://media.30seconds.com/tip/lg/Submit-Your-Recipes-to-30Seconds-How-to-Share-Your-Favorit-21089-4faef85b07-1616429902.jpg",
      color: "orange-500",
    },
    {
      icon: <FaCamera className="text-4xl text-green-500" />,
      title: 'AI Ingredient Scanner',
      description: 'Simply snap a photo of your available ingredients, and our advanced AI will analyze them to suggest personalized recipes tailored to your dietary preferences and pantry contents.',
      image: "https://cdn.prod.website-files.com/62c82c2449b0ebd57821fd87/653d8b67a494cdf3059b8a39_nutrition-hero-graphic.webp",
      color: "green-500",
    },
    {
      icon: <FaListAlt className="text-4xl text-blue-500" />,
      title: 'Smart Meal Planning',
      description: 'Effortlessly craft personalized meal plans or let our AI assistant generate weekly menus using community recipes, optimized for your dietary needs, schedule, and taste preferences.',
      image: "https://img.freepik.com/free-photo/flat-lay-charts-organic-food-lunch-boxes_23-2148515964.jpg?semt=ais_hybrid&w=740",
      color: "blue-500",
    },
    {
      icon: <FaShoppingCart className="text-4xl text-purple-500" />,
      title: 'Shop Ingredients',
      description: 'Automatically generate detailed shopping lists from your meal plans and discover nearby grocery stores to source fresh, high-quality ingredients with ease and convenience.',
      image: "https://donewithdiligence.com/wp-content/uploads/2023/09/Grocery-Shopping-with-Diligence-Featured-Image.jpg",
      color: "purple-500",
    },
    {
      icon: <FaMapMarkerAlt className="text-4xl text-red-500" />,
      title: 'Cheat Day Adventures',
      description: 'Indulge in culinary delights by exploring top-rated local restaurants, curated to match your favorite cuisines and dishes, for a memorable dining experience.',
      image: "https://media-cldnry.s-nbcnews.com/image/upload/t_social_share_1024x768_scale,f_auto,q_auto:best/newscms/2018_18/2084256/170725-better-cheat-day-hamburger-se-540p.jpg",
      color: "red-500",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: isPageLoaded ? 1 : 0 }}
        transition={{ duration: 1 }}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-100 to-white overflow-hidden"
      >
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover opacity-20"
          >
            <source
              src="/videos/mixkit-preparing-a-bowl-with-yogurt-and-fruit-43925-full-hd.mp4"
              type="video/mp4"
            />
          </video>
        </div>
        <div className="container mx-auto px-6 relative z-10 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="lg:w-1/2 text-center lg:text-left"
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                Cook, Share, & Savor
                <span className="block text-orange-500">Your Culinary Journey</span>
              </h1>
              <p className="text-lg text-gray-700 mb-8 max-w-md mx-auto lg:mx-0">
                Join a vibrant community to share recipes, get AI-driven nutritional insights, plan meals, and explore local dining for your cheat days.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  to="/signup"
                  className="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg"
                >
                  Get Started
                </Link>
                <Link
                  to="/posts"
                  className="px-8 py-3 bg-white text-orange-500 border-2 border-orange-500 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300"
                >
                  Explore Recipes
                </Link>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:w-1/2 mt-12 lg:mt-0"
            >
              <div className="relative">
                <img
                  src="https://images.unsplash.com/photo-1504674900247-0877df9cc836"
                  alt="Culinary dish"
                  className="w-full h-auto rounded-2xl shadow-2xl"
                />
                <div className="absolute -bottom-4 -right-4 bg-orange-500 text-white px-6 py-2 rounded-full font-semibold">
                  Discover Now
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Elevate Your Culinary Journey
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Discover powerful tools designed to inspire creativity, simplify meal planning, and connect you with global flavors.
            </p>
          </motion.div>

          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className={`flex flex-col ${
                index % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'
              } items-center gap-6 lg:gap-10 py-8 sm:py-12`}
            >
              {/* Image Side */}
              <motion.div
                variants={itemVariants}
                className="lg:w-1/2 w-full"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="w-full max-h-96 object-contain transform hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </motion.div>

              {/* Content Side */}
              <motion.div
                variants={itemVariants}
                className="lg:w-1/2 w-full text-center lg:text-left"
              >
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-${feature.color} mb-3`}>
                  {React.cloneElement(feature.icon, { className: 'text-xl text-white' })}
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-base sm:text-lg text-gray-600 mb-4">
                  {feature.description}
                </p>
                <Link
                  to="/learn-more"
                  className={`inline-flex items-center px-5 py-2 bg-${feature.color} text-white rounded-full font-medium hover:bg-opacity-90 transition-all duration-300 shadow-sm`}
                >
                  Learn More <FaArrowRight className="ml-2 text-sm" />
                </Link>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-16 sm:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              A World of Flavors Awaits
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto">
              From spicy curries to delicate sushi, discover dishes that will expand your culinary horizons.
            </p>
          </motion.div>
          <div className="relative overflow-hidden py-4" ref={containerRef}>
            <div
              className="flex space-x-4 sm:space-x-6"
              style={{ transform: `translateX(-${scrollPosition}px)` }}
            >
              {cuisineImages.concat(cuisineImages).map((cuisine, index) => (
                <motion.div
                  key={index}
                  className="flex-shrink-0 w-56 relative rounded-lg overflow-hidden shadow-md"
                  onHoverStart={() => setHoveredCuisine(index)}
                  onHoverEnd={() => setHoveredCuisine(null)}
                  whileHover={{ y: -5 }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={cuisine.image}
                    alt={cuisine.tag}
                    className="w-56 h-48 object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-base sm:text-lg font-medium text-white">{cuisine.tag}</p>
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

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              From uploading recipes to planning meals and enjoying cheat days, here’s how we make it seamless.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-center"
            >
              <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-500">1</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Share & Discover</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Upload your recipes with photos and get nutritional analysis. Browse thousands of community recipes.
              </p>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-500">2</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Plan & Shop</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Use our AI to create meal plans and generate shopping lists with nearby store locations.
              </p>
            </motion.div>
            <motion.div
              variants={cardVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-orange-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-xl font-bold text-orange-500">3</span>
              </div>
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">Enjoy Cheat Days</h3>
              <p className="text-gray-600 text-sm sm:text-base">
                Pick a cuisine and find the best local restaurants for a delightful dining experience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gradient-to-r from-orange-100 to-orange-200 text-gray-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h2
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6"
          >
            Ready to Transform Your Culinary Experience?
          </motion.h2>
          <motion.p
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-gray-700 mb-8 max-w-2xl mx-auto"
          >
            Join our community to share recipes, plan meals with AI, and discover local dining options.
          </motion.p>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/signup"
              className="px-6 py-2 sm:px-8 sm:py-3 bg-orange-500 text-white rounded-full font-medium hover:bg-orange-600 transition-all duration-300 shadow-md"
            >
              Join Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;