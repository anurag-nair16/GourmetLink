import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import Avatar from "react-avatar";
import { FaHeart, FaRegHeart, FaComment, FaStar, FaRegStar } from "react-icons/fa";
import { formatDistanceToNow } from "date-fns";

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
    return <p>Loading post...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="post-detail-page">
      <div className="post-header">
        <Avatar name={post.user} size="50" round={true} />
        <h2 className="post-user">{post.user}</h2>
        <p className="post-date">
          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
        </p>
      </div>

      <div className="post-image">
        <img src={post.recipe.image} alt={post.recipe.name} className="w-full h-auto" />
      </div>

      <div className="post-info">
        <h3 className="post-name">{post.recipe.name}</h3>
        <p>{post.recipe.instructions}</p>
        <div className="post-tags">
          <h4>Tags:</h4>
          <div>{post.recipe.tags}</div>
        </div>

        <div className="post-likes">
          {post.likes.includes(profileData.id) ? (
            <FaHeart onClick={handleLike} className="text-red-500" />
          ) : (
            <FaRegHeart onClick={handleLike} />
          )}
          <span>{post.likes_count}</span>
        </div>

        <div className="post-comments">
          <h4>Comments:</h4>
          {post.comments.map((comment, idx) => (
            <div key={idx} className="comment">
              <p>{comment.text}</p>
              <p>- {comment.user}</p>
            </div>
          ))}
        </div>

        <div className="comment-input">
          <input
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
          />
          <button onClick={handleComment}>Add Comment</button>
        </div>
      </div>

      <Link to="/" className="back-to-home">Back to Home</Link>
    </div>
  );
};

export default PostDetailPage;
