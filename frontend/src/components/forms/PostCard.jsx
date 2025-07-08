import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';

const PostCard = ({ post, index, onOpenModal, onLike, profileData }) => {
  // State for user data
  // const [userData, setUserData] = useState(null);
  // const [isLoading, setIsLoading] = useState(true);
  // const [error, setError] = useState(null);
  

  // // Fetch user details using the endpoint
  // useEffect(() => {
  //   // Skip fetching if userProfile is missing

  //   const fetchUserData = async () => {
  //     try {
  //       const email = post.recipe.user;
  //       if (!email) {
  //         setError('No user email provided');
  //         setIsLoading(false);
  //         return;
  //       }

  //       // Check cache first
  //       if (userCache[email]) {
  //         setUserData(userCache[email]);
  //         setIsLoading(false);
  //         return;
  //       }

  //       const token = localStorage.getItem('token');
  //       if (!token) {
  //         throw new Error('No access token found');
  //       }
  //       const headers = { Authorization: `Bearer ${token}` };
  //       const response = await axios.get(
  //         `${process.env.REACT_APP_API_URL}/profile/${email}/`,
  //         { headers }
  //       );
  //       const data = response.data;
  //       // Store in cache
  //       userCache[email] = data;
  //       setUserData(data);
  //       // console.log('User data fetched:', data);
  //     } catch (err) {
  //       console.error('Error fetching user data:', err);
  //       setError(err.message || 'Failed to fetch user data');
  //     } finally {
  //       setIsLoading(false);
  //     }
  //   };

  //   fetchUserData();
  // }, [post.user]); // Include userProfile in dependencies

  const recipeContent = post.recipe;
  const user = post.user;

  // Handle date parsing and formatting
  let formattedDate;
  try {
    formattedDate = formatDistanceToNow(new Date(recipeContent.created_at), { addSuffix: true });
  } catch (error) {
    console.error('Invalid date value:', error);
    formattedDate = 'Unknown date';
  }

  return (
    <motion.div
      initial={{ opacity: 1, y: 0 }}
      onClick={() => onOpenModal(post, index)}
      className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-neutral-200 
        transition-all duration-300 overflow-hidden cursor-pointer group hover:transform 
        hover:scale-105"
    >
      <div className="relative aspect-[4/3]">
        <img
          src={recipeContent.image_thumbnail || recipeContent.image}
          alt={recipeContent.name}
          className="w-full h-full object-cover transition-transform duration-300"
          loading="lazy"
          width="400"
          height="300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white mb-2">
              {recipeContent.name}
            </h3>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-400" size={16} />
              <span className="text-white">{post.average_rating || 0}</span>
              <span className="text-white/80 text-xs">
                ({post.ratings.length} ratings)
              </span>
            </div>
            <div className="ml-auto">
              <span className="text-white/90 text-sm">
                by {user?.username || 'Unknown User'}
              </span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex flex-wrap gap-1">
              {recipeContent.tags?.split(',').map((tag, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-primary-main/20 text-white rounded-full text-xs"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="p-4 border-t border-neutral-200">
        <div className="flex justify-between items-start mb-2">
          <span className="text-xs text-neutral-500">
            {formattedDate}
          </span>
          <div className="flex items-center space-x-4 text-neutral-600">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLike(post.id);
              }}
              className="flex items-center space-x-1 hover:text-primary-main transition-colors"
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
        <p className="text-neutral-600 text-sm line-clamp-2">
          {recipeContent.description}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
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