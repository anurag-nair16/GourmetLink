import { useEffect, useState } from "react";
import axios from "axios";
import { FaSearch, FaSlidersH } from "react-icons/fa";
import PostCard from "./forms/PostCard";
import PostDetails from "./forms/PostDetails";
import { FaStar, FaRegStar, FaStarHalfAlt, FaChevronUp, FaChevronDown } from "react-icons/fa";

const theme = {
  primary: {
    light: '#f0fdf4', // Light green background
    main: '#22c55e',  // Main green
    dark: '#15803d'   // Dark green
  },
  neutral: {
    50: '#fafafa',
    100: '#f4f4f5',
    200: '#e4e4e7',
    700: '#3f3f46',
    800: '#27272a'
  }
};

const PostCardSkeleton = () => (
  <div className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse border border-neutral-100">
    <div className="aspect-video bg-neutral-100"></div>
    <div className="p-4 space-y-4">
      <div className="h-6 bg-neutral-100 rounded-md w-3/4"></div>
      <div className="flex space-x-1">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-5 h-5 bg-neutral-100 rounded-md"></div>
        ))}
      </div>
      <div className="flex justify-between items-center">
        <div className="h-5 w-16 bg-neutral-100 rounded-md"></div>
        <div className="h-5 w-24 bg-neutral-100 rounded-md"></div>
      </div>
    </div>
  </div>
);

const AllPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/posts/`, {
          // const response = await axios.get("http://127.0.0.1:8000/posts/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setProfileData(profileResponse.data);
        
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        const updatedPosts = response.data.map((post) => {
          if (likedPosts.includes(post.id)) {
            return {
              ...post,
              likes: [...post.likes, profileResponse.data.id],
            };
          }
          return post;
        });
  
        setPosts(updatedPosts);
        setFilteredPosts(updatedPosts);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts.");
        setLoading(false);
      }
    };
  
    fetchPosts();
  }, []);

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            likes_count: response.data.total_likes,
            likes: response.data.liked
              ? [...post.likes, profileData.id]
              : post.likes.filter((id) => id !== profileData.id),
          };
        }
        return post;
      });
  
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
  
      const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
      if (response.data.liked) {
        likedPosts.push(postId);
      } else {
        const index = likedPosts.indexOf(postId);
        if (index !== -1) likedPosts.splice(index, 1);
      }
  
      localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleRate = async (postId, value) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/rate/`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      const updatedPosts = posts.map((post) => {
        if (post.recipe.id === selectedRecipe.id) {
          return {
            ...post,
            recipe: {
              ...post.recipe,
              average_rating: response.data.average_rating
            }
          };
        }
        return post;
      });
  
      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
      setSelectedRecipe({
        ...selectedRecipe,
        average_rating: response.data.average_rating
      });
      setRating(0);
  
    } catch (err) {
      console.error("Error rating post:", err);
    }
  };

  const handleComment = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/comment/`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: [...post.comments, response.data],
          };
        }
        return post;
      });

      setPosts(updatedPosts);
      setFilteredPosts(updatedPosts);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  const renderRatingStars = (averageRating) => {
    const fullStars = Math.floor(averageRating);
    const halfStar = averageRating % 1 >= 0.5 ? 1 : 0;
    const emptyStars = 5 - fullStars - halfStar;
  
    const stars = [];
  
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} size={20} className="text-yellow-500" />);
    }
  
    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" size={20} className="text-yellow-500" />);
    }
  
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} size={20} className="text-gray-400" />);
    }
  
    return stars;
  };

  const openModal = (recipe, index) => {
    setSelectedRecipe(recipe);
    setCurrentIndex(index);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    setCurrentIndex(null);
  };

  const handleArrowClick = (direction) => {
    const newIndex =
      direction === "left"
        ? (currentIndex - 1 + posts.length) % posts.length
        : (currentIndex + 1) % posts.length;
    setSelectedRecipe(posts[newIndex].recipe);
    setCurrentIndex(newIndex);
  };

  const handleSearch = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query === "") {
      setFilteredPosts(posts);
    } else {
      const filtered = posts.filter((post) =>
        post.recipe.name && post.recipe.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredPosts(filtered);
    }
  };

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minRating: 0,
    maxRating: 5,
    dateRange: 'all', // all, today, week, month
    sortBy: 'newest', // newest, oldest, mostLiked, highestRated
    tags: [],
    likedByMe: false,
    myPosts: false
  });
  const [availableTags, setAvailableTags] = useState([
    'Vegetarian', 'Vegan', 'Sugar', 'Quick & Easy',
    'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Sweet', 'Snack'
  ]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    applyFilters(searchQuery, { ...filters, [key]: value });
  };

  const applyFilters = (search, currentFilters) => {
    let filtered = [...posts];

    // Search filter
    if (search) {
      filtered = filtered.filter((post) =>
        post.recipe.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Rating filter
    if (currentFilters.minRating > 0) {
      filtered = filtered.filter(
        (post) => post.average_rating >= currentFilters.minRating
      );
      console.log(filtered);
    }

    // Date filter
    const now = new Date();
    switch (currentFilters.dateRange) {
      case 'today':
        filtered = filtered.filter(post => 
          new Date(post.created_at).toDateString() === now.toDateString()
        );
        break;
      case 'week':
        const weekAgo = new Date(now.setDate(now.getDate() - 7));
        filtered = filtered.filter(post => 
          new Date(post.created_at) >= weekAgo
        );
        break;
      case 'month':
        const monthAgo = new Date(now.setMonth(now.getMonth() - 1));
        filtered = filtered.filter(post => 
          new Date(post.created_at) >= monthAgo
        );
        break;
    }

    // Tags filter
    if (currentFilters.tags.length > 0) {
      filtered = filtered.filter(post =>
        currentFilters.tags.every(tag => 
          post.recipe.tags && post.recipe.tags.toLowerCase().includes(tag.toLowerCase())
        )
      );
    }

    // Liked by me filter
    if (currentFilters.likedByMe) {
      filtered = filtered.filter(post =>
        post.likes.includes(profileData.id)
      );
    }

    // Sort
    switch (currentFilters.sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'mostLiked':
        filtered.sort((a, b) => b.likes.length - a.likes.length);
        break;
      case 'highestRated':
        filtered.sort((a, b) => b.recipe.average_rating - a.recipe.average_rating);
        break;
    }

    setFilteredPosts(filtered);
  };

  const clearFilters = () => {
    setFilters({
      minRating: 0,
      maxRating: 5,
      dateRange: 'all',
      sortBy: 'newest',
      tags: [],
      likedByMe: false,
      myPosts: false
    });
    setFilteredPosts(posts);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white">
    {/* Search and Filter Controls */}
    {/* Search and Filter Controls */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm shadow-md border-b border-neutral-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <input
                type="text"
                className="w-full py-3 px-4 rounded-lg bg-neutral-50 text-neutral-800 
                  placeholder-neutral-400 border border-neutral-200 focus:outline-none 
                  focus:ring-2 focus:ring-primary-main/20 focus:border-primary-main 
                  transition-all"
                placeholder="Search for recipes..."
                value={searchQuery}
                onChange={handleSearch}
              />
              <FaSearch className="absolute right-4 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 bg-primary-main text-white 
                rounded-lg bg-emerald-500 hover:bg-emerald-600 transition-colors font-medium shadow-sm"
            >
              <FaSlidersH size={16} />
              <span>Filters</span>
              {showFilters ? (
                <FaChevronUp className="ml-2" size={14} />
              ) : (
                <FaChevronDown className="ml-2" size={14} />
              )}
            </button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 p-6 bg-white rounded-xl border border-neutral-200 shadow-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Rating Filter */}
                <div className="space-y-2">
                  <label className="text-neutral-700 font-medium">Minimum Rating</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => handleFilterChange('minRating', star)}
                        className={`p-1 rounded transition-colors ${
                          filters.minRating >= star ? 'text-yellow-400' : 'text-neutral-300'
                        }`}
                      >
                        <FaStar size={24} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort By */}
                <div className="space-y-2">
                  <label className="text-neutral-700 font-medium">Sort By</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    className="w-full p-3 rounded-lg bg-neutral-50 text-neutral-800 
                      border border-neutral-200 focus:outline-none focus:ring-2 
                      focus:ring-primary-main/20 focus:border-primary-main"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="mostLiked">Most Liked</option>
                    <option value="highestRated">Highest Rated</option>
                  </select>
                </div>

                {/* Additional Filters */}
                <div className="space-y-2 col-span-2">
                  <label className="text-neutral-700 font-medium">Additional Filters</label>
                  <div className="flex flex-wrap gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.likedByMe}
                        onChange={(e) => handleFilterChange('likedByMe', e.target.checked)}
                        className="w-4 h-4 rounded text-primary-main focus:ring-primary-main/20"
                      />
                      <span className="text-neutral-700">Liked by me</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.myPosts}
                        onChange={(e) => handleFilterChange('myPosts', e.target.checked)}
                        className="w-4 h-4 rounded text-primary-main focus:ring-primary-main/20"
                      />
                      <span className="text-neutral-700">My recipes</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tags */}
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
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all
                        ${filters.tags.includes(tag)
                          ? 'bg-primary-main text-white shadow-sm'
                          : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                        }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              <div className="mt-6 flex justify-end border-t border-neutral-200 pt-4">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 text-white bg-red-500 hover:bg-red-600 
                    rounded-lg transition-colors font-medium shadow-sm"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
    <main className="container mx-auto px-4 py-8">
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, index) => (
            <PostCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="text-red-600 text-center p-6 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
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
                onLike={handleLike}
                onOpenModal={openModal}
                renderRatingStars={renderRatingStars}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </main>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <PostDetails
          selectedRecipe={selectedRecipe}
          currentIndex={currentIndex}
          posts={posts}
          onClose={closeModal}
          onNavigate={handleArrowClick}
          onRate={handleRate}
          onComment={handleComment}
          rating={rating}
          setRating={setRating}
          commentText={commentText}
          setCommentText={setCommentText}
        />
      )}
    </div>
  );
};

export default AllPostsPage;