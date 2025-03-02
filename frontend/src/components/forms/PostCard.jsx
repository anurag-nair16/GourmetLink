import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Avatar from 'react-avatar';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { useTranslation } from '../../context/TranslationContext'; // Import the useTranslation hook
import TranslatedText from '../../context/TranslatedText'; // Import the TranslatedText component

const PostCard = ({ post, index, onOpenModal, onLike, profileData, renderRatingStars }) => {
  const [userProfile, setUserProfile] = useState(null);
  const { currentLanguage, translateRecipe } = useTranslation(); // Add translation context
  const [translatedRecipe, setTranslatedRecipe] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (post.user) {
        const token = localStorage.getItem("token");
        try {
          const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/profile/${post.user}/`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          setUserProfile(profileResponse.data);
        } catch (error) {
          console.error("Error fetching user profile data:", error);
        }
      } else {
        console.error("User email is not available");
      }
    };

    fetchUserProfile();
  }, [post.user]);

  // Add effect for translation
  useEffect(() => {
    const fetchTranslation = async () => {
      if (post.recipe && currentLanguage !== 'en') {
        const translated = await translateRecipe(post.recipe.id, currentLanguage);
        if (translated) {
          setTranslatedRecipe(translated);
        }
      } else {
        setTranslatedRecipe(null);
      }
    };

    fetchTranslation();
  }, [post.recipe, currentLanguage]);

  if (!userProfile) {
    return <div className="bg-gray-800 rounded-xl h-full"></div>;
  }

  // Use translated content or fallback to original
  const recipeContent = translatedRecipe || post.recipe;

  // Handle date parsing and formatting
  let formattedDate;
  console.log(recipeContent.created_at);
  console.log(formattedDate);
  try {
    formattedDate = formatDistanceToNow(new Date(recipeContent.created_at), { addSuffix: true });
  } catch (error) {
    console.error("Invalid date value:", error);
    formattedDate = 'Invalid date';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onClick={() => onOpenModal(post.recipe, index)}
      className="bg-gray-800 rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden cursor-pointer group hover:transform hover:scale-105"
    >
      <div className="relative aspect-[4/3]">
        <img
          src={recipeContent.image}
          alt={recipeContent.name}
          className="w-full h-full object-cover transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white mb-2">
              {recipeContent.name}
            </h3>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-500" size={16} />
              <span className="text-white">{post.average_rating}</span>
              <span className="text-gray-400 text-xs">
                ({post.ratings.length} ratings)
              </span>
            </div>
            <div className="ml-auto">
              <span className="text-emerald-400 text-sm">
                by {userProfile.username}
              </span>
            </div>
          </div>
  
          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
              {recipeContent.tags?.split(",").map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-gray-700">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-gray-400">
            {formattedDate}
          </span>
          <div className="flex items-center space-x-4 text-white">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
              className="flex items-center space-x-1 hover:text-emerald-500 transition-colors"
            >
              {post.likes.includes(profileData.id) ? (
                <FaHeart className="text-red-500" />
              ) : (
                <FaRegHeart />
              )}
              <span>{post.likes_count}</span>
            </button>
  
            <div className="flex items-center space-x-1">
              <FaComment />
              <span>{post.comments.length}</span>
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-sm line-clamp-2">
          {recipeContent.description}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
          <span>
            🕒 {recipeContent.prep_time} mins
          </span>
          <span>
            👥 {recipeContent.servings} servings
          </span>
        </div>
      </div>
    </motion.div>
  );  
};

export default PostCard;