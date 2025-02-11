import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import Avatar from "react-avatar";
import { FaStar, FaRegStar, FaStarHalfAlt, FaCheck,  FaHeart, FaRegHeart, FaComment, FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";


const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [rating, setRating] = useState(0);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/posts/", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const profileResponse = await axios.get("http://127.0.0.1:8000/profile/", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        setProfileData(profileResponse.data);
        setPosts(response.data);
  
        // Check localStorage for liked posts and update the state
        const likedPosts = JSON.parse(localStorage.getItem("likedPosts")) || [];
        const updatedPosts = response.data.map((post) => {
          if (likedPosts.includes(post.id)) {
            return {
              ...post,
              likes: [...post.likes, profileData.id], // Assuming the user has liked this post
            };
          }
          return post;
        });
  
        setPosts(updatedPosts);
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
        `http://127.0.0.1:8000/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Update the likes state
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
  
      // Save the liked post in localStorage
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
        `http://127.0.0.1:8000/posts/${postId}/rate/`,
        { value },
        { headers: { Authorization: `Bearer ${token}` } }
      );
  
      // Update both posts and selectedRecipe with the new rating
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
  
      // Update the posts state
      setPosts(updatedPosts);
  
      // Update the selectedRecipe state to reflect the new rating
      setSelectedRecipe({
        ...selectedRecipe,
        average_rating: response.data.average_rating
      });
  
      // Reset the rating input
      setRating(0);
  
    } catch (err) {
      console.error("Error rating post:", err);
      if (err.response) {
        console.error("Error response:", err.response);
        console.error("Error details:", err.response.data);
      } else {
        console.error("Error without response:", err.message);
      }
    }
  };
  

  const handleComment = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `http://127.0.0.1:8000/posts/${postId}/comment/`,
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
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
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

  const renderRatingStars = (averageRating) => {
    const fullStars = Math.floor(averageRating); // Count full stars
    const halfStar = averageRating % 1 >= 0.5 ? 1 : 0; // Check if there should be a half star
    const emptyStars = 5 - fullStars - halfStar; // Remaining empty stars
  
    const stars = [];
  
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={`full-${i}`} size={20} className="text-yellow-500" />);
    }
  
    // Half star (if applicable)
    if (halfStar) {
      stars.push(<FaStarHalfAlt key="half" size={20} className="text-yellow-500" />);
    }
  
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaRegStar key={`empty-${i}`} size={20} className="text-gray-400" />);
    }
  
    return stars;
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      
      <header className="relative flex items-center justify-center overflow-hidden py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 z-0"></div>
        <div className="z-10 text-center">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent animate-gradient">
                Welcome to Recipe Paradise 🍴
            </h1>
            <p className="mt-4 text-xl text-white">
                Find, share, and enjoy delicious recipes from around the world.
            </p><br />
            <a href="#" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-full transition-colors inline-block">
              Explore All
             </a>
        </div>
    </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-emerald-500">Loading...</div>
          </div>
        ) : error ? (
          <div className="text-red-500 text-center p-4 bg-red-900/20 rounded-lg">
            {error}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {posts.map((post, index) => (
              <div
                key={post.id}
                onClick={() => openModal(post.recipe, index)}
                className="bg-gray-800 rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
              >
                {/* Card Header */}
                <div className="p-4 border-b border-gray-700">
                  <div className="flex items-center space-x-3">
                    <Avatar name={post.user} size="40" round={true} />
                    <p className="text-gray-300 font-medium">{post.user}</p>
                  </div>
                </div>

                {/* Card Image */}
                <div className="relative aspect-video">
                  <img
                    src={post.recipe.image}
                    alt={post.recipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Card Content */}
                <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-100">
                    {post.recipe.name}
                  </h3>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(post.recipe.created_at), { addSuffix: true })}
                  </span>
                </div>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.recipe.tags?.split(",").map((tag, idx) => (
                      <span key={idx} className="px-2 py-1 bg-gray-700 rounded-full text-xs text-emerald-400">
                        #{tag.trim()}
                      </span>
                    ))}
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center justify-between text-gray-400">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLike(post.id);
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

                    <div className="flex items-center">
                      {renderRatingStars(post.average_rating)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative">
            {/* Modal Header */}
            <div className="p-4 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-100">{selectedRecipe.name}</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
              {/* Left Column - Image */}
              <div className="lg:w-1/2 p-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Rating Section */}
                <div className="mt-4 p-4 bg-gray-700/50 rounded-lg">
                  <h3 className="text-lg font-semibold text-gray-200 mb-2">Rate this Recipe</h3>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setRating(star)}
                        className="hover:scale-110 transition-transform"
                      >
                        {star <= rating ? (
                          <FaStar size={24} className="text-yellow-500" />
                        ) : (
                          <FaRegStar size={24} className="text-gray-400" />
                        )}
                      </button>
                    ))}
                    <button
                      onClick={() => handleRate(selectedRecipe.id, rating)}
                      className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Column - Details */}
              <div className="lg:w-1/2 p-4 overflow-y-auto">
                {/* Recipe Info */}
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Ingredients</h3>
                    <ul className="list-disc list-inside text-gray-300 space-y-1">
                      {selectedRecipe.ingredients?.split(",").map((ingredient, idx) => (
                        <li key={idx}>{ingredient.trim()}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-emerald-400 mb-2">Instructions</h3>
                    <p className="text-gray-300 whitespace-pre-line">{selectedRecipe.instructions}</p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm">
                      ⏳ {selectedRecipe.prep_time} min
                    </span>
                    <span className="px-3 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-sm">
                      🍽️ {selectedRecipe.servings} servings
                    </span>
                  </div>

                  {/* Comments Section */}
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold text-emerald-400 mb-4">Comments</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                      {posts[currentIndex]?.comments.map((comment, idx) => (
                        <div key={idx} className="bg-gray-700/50 p-3 rounded-lg">
                          <div className="flex items-center space-x-3 mb-2">
                            <Avatar name={comment.user} size="32" round={true} />
                            <p className="font-medium text-gray-200">{comment.user}</p>
                          </div>
                          <p className="text-gray-300">{comment.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* Comment Input */}
                    <div className="mt-4 flex items-center space-x-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => handleComment(posts[currentIndex].id)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <FaCheck size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={() => handleArrowClick("left")}
            className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:block bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
          >
            <FaChevronLeft size={24} />
          </button>
          <button
            onClick={() => handleArrowClick("right")}
            className="fixed right-4 top-1/2 -translate-y-1/2 hidden lg:block bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
          >
            <FaChevronRight size={24} />
          </button>
        </div>
      )}
    </div>
  );
};

export default HomePage;
