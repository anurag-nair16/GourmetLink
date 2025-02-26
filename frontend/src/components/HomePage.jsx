import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaUtensils, FaSearch, FaHeart, FaUserFriends, FaStar, FaArrowRight } from 'react-icons/fa';
import TranslatedText from '../context/TranslatedText';

const Home = () => {
  const featuredRecipes = [
    {
      id: 1,
      recipe: {
        name: "Classic Margherita Pizza",
        image: "https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?ixlib=rb-4.0.3",
        average_rating: 4.9,
        prep_time: 30,
        servings: 4,
        tags: "Italian, Pizza, Vegetarian",
        description: "A timeless Italian favorite with fresh basil, mozzarella, and tomatoes"
      },
      chef: "Chef Mario",
      likes_count: 1240
    },
    {
      id: 2,
      recipe: {
        name: "Japanese Sushi Roll",
        image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3",
        average_rating: 4.8,
        prep_time: 45,
        servings: 3,
        tags: "Japanese, Seafood, Sushi",
        description: "Fresh salmon and avocado rolled in seasoned rice and nori"
      },
      chef: "Chef Yuki",
      likes_count: 956
    },
    {
      id: 3,
      recipe: {
        name: "Creamy Butter Chicken",
        image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?ixlib=rb-4.0.3",
        average_rating: 4.9,
        prep_time: 50,
        servings: 6,
        tags: "Indian, Curry, Chicken",
        description: "Rich and creamy Indian curry with tender chicken pieces"
      },
      chef: "Chef Priya",
      likes_count: 1567
    },
    {
      id: 4,
      recipe: {
        name: "Chocolate Lava Cake",
        image: "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?ixlib=rb-4.0.3",
        average_rating: 4.7,
        prep_time: 25,
        servings: 2,
        tags: "Dessert, Chocolate, Baking",
        description: "Decadent chocolate cake with a molten center"
      },
      chef: "Chef Sophie",
      likes_count: 892
    }
  ];

  const features = [
    {
      icon: <FaUtensils className="text-4xl text-emerald-500" />,
      title: "Share Recipes",
      description: "Upload and share your favorite recipes with the community"
    },
    {
      icon: <FaSearch className="text-4xl text-emerald-500" />,
      title: "Discover",
      description: "Find new and exciting recipes from around the world"
    },
    {
      icon: <FaHeart className="text-4xl text-emerald-500" />,
      title: "Save Favorites",
      description: "Save recipes you love and build your personal cookbook"
    },
    {
      icon: <FaUserFriends className="text-4xl text-emerald-500" />,
      title: "Community",
      description: "Connect with other food lovers and share your experiences"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
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
            style={{ position: 'absolute' }} // This ensures the video stays within the section
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
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="mb-8"
          >
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              <span className="block">
                <TranslatedText id="hero_cook">Cook</TranslatedText>
              </span>
              <span className="block text-emerald-400">
                <TranslatedText id="hero_share">Share</TranslatedText>
              </span>
              <span className="block">
                <TranslatedText id="hero_enjoy">Enjoy</TranslatedText>
              </span>
            </h1>
            <div className="w-24 h-1 bg-emerald-500 mx-auto my-8"></div>
          </motion.div>

          <motion.p 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
          >
            <TranslatedText id="hero_description">
              Join our culinary community where passion meets plate. 
              Share your recipes, discover new flavors, and connect with food lovers worldwide.
            </TranslatedText>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="flex flex-col md:flex-row gap-6 justify-center"
          >
            <Link 
              to="/submit-recipe"
              className="group relative px-8 py-4 bg-emerald-600 text-white rounded-full overflow-hidden"
            >
              <span className="absolute inset-0 w-0 bg-emerald-700 transition-all duration-500 ease-out group-hover:w-full"></span>
              <span className="relative flex items-center justify-center">
              <TranslatedText id="btn_share_recipe">Share Your Recipe</TranslatedText>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
            <Link 
              to="/posts"
              className="group relative px-8 py-4 bg-white/10 backdrop-blur-sm text-white rounded-full overflow-hidden hover:bg-white/20 transition-colors duration-300"
            >
              <span className="relative flex items-center justify-center">
              <TranslatedText id="btn_explore_recipes">Explore Recipes</TranslatedText>
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </Link>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <section className="py-20 bg-gray-800">
        <div className="container mx-auto px-4">
        <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-4xl font-bold text-center text-white mb-16"
          >
            <TranslatedText id="features_title">Why Choose Our Platform?</TranslatedText>
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-900 p-6 rounded-xl hover:transform hover:scale-105 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  {feature.icon}
                  <h3 className="text-xl font-semibold text-white mt-4 mb-2">
                    <TranslatedText id={feature.titleId}>{feature.title}</TranslatedText>
                  </h3>
                  <p className="text-gray-400">
                    <TranslatedText id={feature.descriptionId}>{feature.description}</TranslatedText>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Recipes Section */}
    <section className="py-20 bg-gray-900">
      <div className="container mx-auto px-4">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl font-bold text-center text-white mb-16"
        >
          <TranslatedText id="featured_recipes_title">Featured Recipes</TranslatedText>
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredRecipes.map((recipe, index) => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-gray-800 rounded-xl overflow-hidden group hover:transform hover:scale-105 transition-all duration-300"
            >
              <div className="relative aspect-[4/3]">
                <img 
                  src={recipe.recipe.image} 
                  alt={recipe.recipe.name}
                  className="w-full h-full object-cover transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 w-full">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    {recipe.recipe.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <FaStar className="text-yellow-500" size={16} />
                      <span className="text-white">{recipe.recipe.average_rating}</span>
                    </div>
                    <span className="text-emerald-400 text-sm">
                    <TranslatedText id="recipe_by">by</TranslatedText> {recipe.chef}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {recipe.recipe.tags.split(", ").map((tag, i) => (
                      <span 
                        key={i}
                        className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm line-clamp-2">
                  {recipe.recipe.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    🕒 {recipe.recipe.prep_time} mins
                  </span>
                  <span className="text-gray-400">
                    👥 {recipe.recipe.servings} servings
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mt-12"
        >
          <Link 
            to="/posts"
            className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all duration-300 transform hover:scale-105"
          >
            <TranslatedText id="btn_explore_all">Explore All Recipes</TranslatedText>
            <FaArrowRight className="ml-2" />
          </Link>
        </motion.div>
      </div>
    </section>

      {/* Call to Action Section */}
      <motion.section 
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="py-20 bg-emerald-600"
      >
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-8">
            <TranslatedText id="cta_title">Ready to Start Your Culinary Journey?</TranslatedText>
          </h2>
          <p className="text-xl text-white/90 mb-12">
            <TranslatedText id="cta_description">
              Join our community of food lovers and share your recipes with the world
            </TranslatedText>
          </p>
          <Link 
            to="/signup"
            className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 rounded-full hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
          >
            <TranslatedText id="btn_get_started">Get Started</TranslatedText>
            <FaArrowRight className="ml-2" />
          </Link>
        </div>
      </motion.section>
    </div>
  );
};

export default Home;