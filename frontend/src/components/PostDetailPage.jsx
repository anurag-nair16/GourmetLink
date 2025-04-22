import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Avatar from "react-avatar";
import { FaHeart, FaRegHeart, FaComment, FaStar, FaRegStar, FaArrowLeft  } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

const theme = {
  primary: {
    main: '#22c55e',  // Green
    dark: '#15803d',
    light: '#f0fdf4'
  },
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    600: '#525252',
    700: '#404040',
    800: '#262626'
  }
};

const PostDetailPage = () => {
  const { postId } = useParams(); 
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    const fetchPostDetails = async () => {
      try {
        const token = localStorage.getItem("token");

        // Fetch post details
        const postResponse = await axios.get(`${process.env.REACT_APP_API_URL}/posts/${postId}/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch profile details
        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setPost(postResponse.data);
        console.log(postResponse.data);
        setProfileData(profileResponse.data);
        console.log(profileResponse.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching post details:", err);
        setError("Failed to load post.");
        setLoading(false);
      }
    };

    fetchPostDetails();
  }, [postId]);

  const handleLike = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/like/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPost((prevPost) => ({
        ...prevPost,
        likes_count: response.data.total_likes,
        likes: response.data.liked
          ? [...prevPost.likes, profileData.id]
          : prevPost.likes.filter((id) => id !== profileData.id),
      }));
    } catch (err) {
      console.error("Error liking post:", err);
    }
  };

  const handleComment = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/posts/${postId}/comment/`,
        { text: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setPost((prevPost) => ({
        ...prevPost,
        comments: [...prevPost.comments, response.data],
      }));
      setCommentText(""); // Clear the input field
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="animate-pulse text-primary-main font-medium text-lg">
          Loading recipe...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-100">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-light to-white">
      {/* Navigation */}
      <div className="bg-white/95 backdrop-blur-sm border-b border-neutral-200 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-neutral-600 hover:text-primary-main transition-colors"
          >
            <FaArrowLeft size={16} />
            <span className="font-medium">Back to Recipes</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Recipe Card */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 overflow-hidden">
            {/* Recipe Image */}
            <div className="aspect-video bg-neutral-100 relative">
              <img 
                src={post.recipe.image} 
                alt={post.recipe.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                <h1 className="text-3xl font-bold mb-2">{post.recipe.name}</h1>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar 
                      name={post.user} 
                      size="32" 
                      round={true}
                      className="border-2 border-white/50"
                    />
                    <span className="font-medium">{post.user}</span>
                  </div>
                  <span className="text-white/80">
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Recipe Details */}
            <div className="p-6 space-y-8">
              {/* Quick Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-neutral-50 rounded-lg">
                <div className="text-center">
                  <span className="block text-neutral-500 text-sm">Prep Time</span>
                  <span className="block text-lg font-medium text-neutral-800">
                    {post.recipe.prep_time} mins
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-neutral-500 text-sm">Servings</span>
                  <span className="block text-lg font-medium text-neutral-800">
                    {post.recipe.servings}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-neutral-500 text-sm">Likes</span>
                  <span className="block text-lg font-medium text-neutral-800">
                    {post.likes_count}
                  </span>
                </div>
                <div className="text-center">
                  <span className="block text-neutral-500 text-sm">Comments</span>
                  <span className="block text-lg font-medium text-neutral-800">
                    {post.comments.length}
                  </span>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold text-neutral-800">Instructions</h2>
                <p className="text-neutral-600 leading-relaxed whitespace-pre-wrap">
                  {post.recipe.instructions}
                </p>
              </div>

              {/* Tags */}
              {post.recipe.tags && (
                <div className="space-y-3">
                  <h2 className="text-xl font-semibold text-neutral-800">Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {post.recipe.tags.split(',').map((tag, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 bg-primary-main/10 text-primary-main 
                          rounded-full text-sm font-medium"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Engagement Section */}
              <div className="flex items-center gap-6 pt-6 border-t border-neutral-200">
                <button 
                  onClick={handleLike}
                  className="flex items-center gap-2 text-neutral-600 hover:text-primary-main transition-colors"
                >
                  {post.likes.includes(profileData.id) ? (
                    <FaHeart className="text-primary-main" size={24} />
                  ) : (
                    <FaRegHeart size={24} />
                  )}
                  <span className="font-medium">{post.likes_count}</span>
                </button>
              </div>

              {/* Comments Section */}
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-neutral-800">Comments</h2>
                
                {/* Comment Input */}
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Share your thoughts..."
                    className="flex-1 px-4 py-3 rounded-lg bg-neutral-50 border border-neutral-200 
                      focus:outline-none focus:ring-2 focus:ring-primary-main/20 
                      focus:border-primary-main transition-all"
                  />
                  <button
                    onClick={handleComment}
                    disabled={!commentText.trim()}
                    className="px-6 py-3 bg-primary-main text-white rounded-lg font-medium
                      hover:bg-primary-dark transition-colors disabled:opacity-50
                      disabled:cursor-not-allowed"
                  >
                    Post Comment
                  </button>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                  {post.comments.map((comment, idx) => (
                    <div 
                      key={idx} 
                      className="bg-neutral-50 rounded-lg p-4 space-y-3"
                    >
                      <p className="text-neutral-700">{comment.text}</p>
                      <div className="flex items-center gap-2">
                        <Avatar 
                          name={comment.user} 
                          size="24" 
                          round={true}
                        />
                        <p className="text-sm text-neutral-500">
                          {comment.user}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetailPage;