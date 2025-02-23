import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Avatar from 'react-avatar';
import { motion } from 'framer-motion';
import { FaStar, FaHeart, FaRegHeart, FaComment } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

const PostCard = ({ post, index, onOpenModal, onLike, profileData, renderRatingStars }) => {
  const [userProfile, setUserProfile] = useState(null);

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

  if (!userProfile) {
    return <div className="bg-gray-800 rounded-xl h-full"></div>;
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
          src={post.recipe.image}
          alt={post.recipe.name}
          className="w-full h-full object-cover transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          {/* <div className="flex items-center space-x-3 mb-2">
            <Avatar
              name={userProfile.username}
              src={userProfile.profile_image}
              size="40"
              round={true}
              className="border-4 border-emerald-500"
            />
            <p className="text-gray-300 font-medium">{userProfile.username}</p>
          </div> */}
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white mb-2">
              {post.recipe.name}
            </h3>
            
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-1">
              <FaStar className="text-yellow-500" size={16} />
              <span className="text-white">{post.average_rating}</span>
              <span className="text-gray-400 text-xs">({post.ratings.length} ratings)</span>
            </div>
            <div className="ml-auto">
              <span className="text-emerald-400 text-sm">by {userProfile.username}</span>
            </div>
          </div>

          <div className="mt-2 flex items-center justify-between gap-2">
            <div>
            {post.recipe.tags?.split(",").map((tag, i) => (
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
            {formatDistanceToNow(new Date(post.recipe.created_at), { addSuffix: true })}
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
          {post.recipe.description}
        </p>
        <div className="mt-3 flex items-center justify-between text-sm text-gray-400">
          <span>
            🕒 {post.recipe.prep_time} mins
          </span>
          <span>
            👥 {post.recipe.servings} servings
          </span>
        </div>
        <div className="flex items-center justify-between mt-3 text-gray-400">
          
        </div>
      </div>
    </motion.div>
  );
};

export default PostCard;