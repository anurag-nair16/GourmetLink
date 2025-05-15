import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      icon: <FaUtensils className="text-5xl text-orange-500" />,
      title: 'Share & Discover Recipes',
      description: 'Upload your culinary creations and explore a world of recipes from global food enthusiasts.',
    },
    {
      icon: <FaCamera className="text-5xl text-orange-500" />,
      title: 'AI Ingredient Scanner',
      description: 'Snap a photo of your ingredients, and our AI suggests personalized recipes based on your preferences.',
    },
    {
      icon: <FaListAlt className="text-5xl text-orange-500" />,
      title: 'Smart Meal Planning',
      description: 'Create or let our AI assistant generate meal plans using community recipes, tailored to your needs.',
    },
    {
      icon: <FaShoppingCart className="text-5xl text-orange-500" />,
      title: 'Shop Ingredients',
      description: 'Get a shopping list for your meal plan and find nearby stores to purchase ingredients.',
    },
    {
      icon: <FaMapMarkerAlt className="text-5xl text-orange-500" />,
      title: 'Cheat Day Adventures',
      description: 'Indulge with top-rated restaurants nearby offering your favorite dishes or cuisines.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: 'easeOut',
      },
    },
    hover: {
      y: -10,
      boxShadow: '0 10px 20px rgba(0, 0, 0, 0.1)',
      transition: {
        duration: 0.3,
      },
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
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Master Your Kitchen
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From recipe sharing to AI-powered meal planning and local dining, our platform has it all.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
  key={index}
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.6, delay: index * 0.1 }}
  className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-orange-100 relative overflow-hidden"
>
  {/* Orange horizontal line */}
  <div className="absolute top-0 left-0 w-full h-1 bg-orange-500 rounded-t-2xl" />

  <div className="flex items-center justify-center mb-4 mt-2">
    {feature.icon}
  </div>
  <h3 className="text-2xl font-semibold text-gray-900 mb-3 text-center">
    {feature.title}
  </h3>
  <p className="text-gray-600 text-center">{feature.description}</p>
  <div className="mt-4 text-center">
    <Link
      to="/features"
      className="text-orange-500 font-medium hover:underline"
    >
      Learn More
    </Link>
  </div>
</motion.div>

            ))}
          </div>
        </div>
      </section>

      {/* Cuisines Section */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              A World of Flavors Awaits
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

      {/* How It Works Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From uploading recipes to planning your meals and enjoying cheat days, here’s how we make it seamless.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-500">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Share & Discover</h3>
              <p className="text-gray-600">
                Upload your recipes with photos and get nutritional analysis. Browse thousands of community recipes.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-500">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plan & Shop</h3>
              <p className="text-gray-600">
                Use our AI to create meal plans and generate shopping lists with nearby store locations.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-center"
            >
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-orange-500">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enjoy Cheat Days</h3>
              <p className="text-gray-600">
                Pick a cuisine and find the best local restaurants for a delightful dining experience.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-orange-100 to-orange-200 text-gray-900">
        <div className="container mx-auto px-6 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold mb-6"
          >
            Ready to Transform Your Culinary Experience?
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-lg text-gray-700 mb-10 max-w-2xl mx-auto"
          >
            Join our community to share recipes, plan meals with AI, and discover local dining options.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            {/* <Link
              to="/signup"
              className="px-8 py-3 bg-orange-500 text-white rounded-full font-semibold hover:bg-orange-600 transition-all duration-300 shadow-lg"
            >
              Join Now 
            </Link> */}
            <Link
              to="/signup"
              className="px-8 py-3 bg-orange-500 text-white border-2 border-orange-500 rounded-full font-semibold hover:bg-orange-600 transition-all duration-300"
            >
              → Join Now
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;