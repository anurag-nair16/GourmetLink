// src/pages/AllPostsPage.js

import { useEffect, useState, useMemo, lazy, Suspense } from "react";
import axios from "axios";
import { FaSearch, FaSlidersH, FaStar, FaChevronUp, FaChevronDown } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PostCard from "./forms/PostCard";
import { Oval } from 'react-loader-spinner';


const PostDetails = lazy(() => import("./forms/PostDetails"));

// Loading bar component
const LoadingBar = () => (
  <div className="w-full h-1 bg-emerald-100 overflow-hidden">
    <motion.div
      className="h-full bg-emerald-500"
      initial={{ x: "-100%" }}
      animate={{ x: "100%" }}
      transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
    />
  </div>
);

// Skeleton component for loading state
const PostCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse border border-neutral-100">
    <div className="aspect-[4/3] bg-neutral-200"></div>
    <div className="p-4 space-y-4">
      <div className="h-6 bg-neutral-200 rounded-md w-3/4"></div>
      <div className="h-5 bg-neutral-200 rounded-md w-1/2"></div>
      <div className="flex justify-between items-center">
        <div className="h-8 w-24 bg-neutral-200 rounded-md"></div>
        <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
      </div>
    </div>
  </div>
);

const AllPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  // const [userProfiles, setUserProfiles] = useState({}); // Cached user profiles

  // Modal State
  const [selectedPost, setSelectedPost] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);

  // Filtering and Searching State
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    sortBy: 'newest',
    tags: [],
    likedByMe: false,
    myPosts: false,
  });
  const availableTags = useMemo(() => [
    'Vegetarian', 'Vegan', 'Gluten-Free', 'Quick & Easy', 
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Healthy', 'Spicy'
  ], []);

  // Fetch initial posts and all user profiles in one go
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch posts
        const [postsResponse, profileResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/posts/`, { headers }),
          axios.get(`${process.env.REACT_APP_API_URL}/profile/`, { headers })
        ]);

        setPosts(postsResponse.data);
        setProfileData(profileResponse.data);
      } catch (err) {
        console.error("Error fetching initial data:", err);
        setError("Failed to load posts. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Memoized filtered posts
  const filteredPosts = useMemo(() => {
    let tempPosts = [...posts];

    // Search filter
    if (searchQuery) {
      tempPosts = tempPosts.filter(post => 
        post.recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filters
    if (filters.minRating > 0) {
      tempPosts = tempPosts.filter(post => (post.average_rating || 0) >= filters.minRating);
    }
    if (filters.myPosts) {
      // FIX: Use recipe's user ID for comparison
      tempPosts = tempPosts.filter(post => post.user.id === profileData.id);
    }
    if (filters.likedByMe) {
      tempPosts = tempPosts.filter(post => post.likes.includes(profileData.id));
    }
    if (filters.tags.length > 0) {
      tempPosts = tempPosts.filter(post =>
        filters.tags.every(tag =>
          post.recipe.tags && post.recipe.tags.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    // Sorting
    switch (filters.sortBy) {
      case 'oldest':
        tempPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'mostLiked':
        tempPosts.sort((a, b) => (b.likes_count || 0) - (a.likes_count || 0));
        break;
      case 'highestRated':
        tempPosts.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0));
        break;
      default:
        tempPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break; // newest
    }

    return tempPosts;
  }, [posts, searchQuery, filters, profileData.id]);

  // Handlers for Post Interactions
  const updatePostInState = (updatedPost) => {
    setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    if (selectedPost && selectedPost.id === updatedPost.id) {
      setSelectedPost(updatedPost);
    }
  };

  const handleLike = async (postId) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/like/`, 
        {}, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // --- SIMPLIFIED LOGIC ---
      // The response.data is now the complete, updated post object.
      // We can just use it directly to update our state.
      // No more manual state building on the client!
      updatePostInState(response.data);

    } catch (err) {
      console.error("Error liking post:", err);
      // Optional: Add user feedback for failed likes
      alert("Failed to update like status. Please try again.");
    }
  };

  const handleRate = async (postId, value) => {
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/rate/`, 
        { value }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const currentPost = posts.find(p => p.id === postId);
      const updatedPost = { ...currentPost, average_rating: response.data.average_rating };
      updatePostInState(updatedPost);
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost);
      }
      setRating(0);
    } catch (err) {
      console.error("Error rating post:", err);
    }
  };

  const handleComment = async (postId) => {
    if (!commentText.trim()) return;
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/comment/`, 
        { text: commentText }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const currentPost = posts.find(p => p.id === postId);
      const updatedPost = { ...currentPost, comments: [...currentPost.comments, response.data] };
      updatePostInState(updatedPost);
      if (selectedPost && selectedPost.id === postId) {
        setSelectedPost(updatedPost);
      }
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  // Modal handlers
  const openModal = (post, index) => {
    setSelectedPost(post);
    const actualIndex = filteredPosts.findIndex(p => p.id === post.id);
    setCurrentIndex(actualIndex);
  };

  const closeModal = () => {
    setSelectedPost(null);
    setCurrentIndex(null);
  };

  const handleArrowClick = (direction) => {
    const newIndex = direction === "left"
      ? (currentIndex - 1 + filteredPosts.length) % filteredPosts.length
      : (currentIndex + 1) % filteredPosts.length;
    setSelectedPost(filteredPosts[newIndex]);
    setCurrentIndex(newIndex);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ minRating: 0, sortBy: 'newest', tags: [], likedByMe: false, myPosts: false });
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      {loading && <LoadingBar />}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm shadow-sm border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full py-3 pl-10 pr-4 rounded-lg bg-neutral-100 text-neutral-800 placeholder-neutral-500 border border-transparent focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                placeholder="Search for recipes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={18} />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium shadow-sm"
            >
              <FaSlidersH size={16} />
              <span>Filters</span>
              {showFilters ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
            </button>
          </div>
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="mt-4 p-6 bg-white rounded-xl border border-neutral-200 overflow-hidden"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="text-neutral-700 font-medium">Minimum Rating</label>
                    <div className="flex items-center gap-1 mt-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button 
                          key={star} 
                          onClick={() => handleFilterChange('minRating', filters.minRating === star ? 0 : star)} 
                          className={`p-1 rounded transition-colors ${filters.minRating >= star ? 'text-yellow-400' : 'text-neutral-300 hover:text-yellow-300'}`}
                        >
                          <FaStar size={24} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-neutral-700 font-medium">Sort By</label>
                    <select 
                      value={filters.sortBy} 
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)} 
                      className="w-full mt-2 p-3 rounded-lg bg-neutral-100 border border-neutral-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="oldest">Oldest First</option>
                      <option value="mostLiked">Most Liked</option>
                      <option value="highestRated">Highest Rated</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6">
                  <label className="text-neutral-700 font-medium block mb-3">Filter by Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.map(tag => (
                      <button 
                        key={tag} 
                        onClick={() => { 
                          const newTags = filters.tags.includes(tag) 
                            ? filters.tags.filter(t => t !== tag) 
                            : [...filters.tags, tag]; 
                          handleFilterChange('tags', newTags); 
                        }} 
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${filters.tags.includes(tag) ? 'bg-emerald-500 text-white shadow-sm' : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'}`}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-6 flex justify-end border-t border-neutral-200 pt-4">
                  <button 
                    onClick={clearFilters} 
                    className="px-6 py-2.5 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors font-medium shadow-sm"
                  >
                    Clear All Filters
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, index) => <PostCardSkeleton key={index} />)}
          </div>
        ) : error ? (
          <div className="text-red-600 text-center p-6 bg-red-50 rounded-xl border border-red-100">{error}</div>
        ) : (
          <>
            <div className="mb-6 text-neutral-600 font-medium">
              Showing {filteredPosts.length} of {posts.length} recipes
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredPosts.map((post, index) => (
                <PostCard
                  key={post.id}
                  post={post}
                  profileData={profileData}
                  // FIX: Use the recipe's user ID to find the correct profile
                  // userProfile={userProfiles[post.recipe.user] || { username: 'Unknown User' }}
                  onLike={handleLike}
                  onOpenModal={() => openModal(post, index)}
                  index={index}
                />
              ))}
            </div>
          </>
        )}
      </main>

      <AnimatePresence>
        {selectedPost && (
          <Suspense fallback={<div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"><Oval color="#fff" /></div>}>
          <PostDetails
            post={selectedPost}
            posts={filteredPosts}
            currentIndex={currentIndex}
            onClose={closeModal}
            onNavigate={handleArrowClick}
            onRate={handleRate}
            onComment={handleComment}
            rating={rating}
            setRating={setRating}
            commentText={commentText}
            setCommentText={setCommentText}
          />
          </Suspense>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AllPostsPage;