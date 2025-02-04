import { useEffect, useState } from "react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import Avatar from "react-avatar"; // Import Avatar component

const HomePage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get("http://127.0.0.1:8000/posts/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const profileResponse = await axios.get("http://127.0.0.1:8000/profile/", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfileData(profileResponse.data);
        setPosts(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching posts:", err);
        setError("Failed to load posts.");
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleViewDetails = (recipe) => {
    setSelectedRecipe(recipe);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="w-full bg-[#233554] px-0 md:px-[10%]">
      <div className="w-full min-h-screen bg-[#1e293b] text-white py-10">
        {loading ? (
          <p className="text-center text-gray-400">Loading posts...</p>
        ) : error ? (
          <p className="text-center text-red-500">{error}</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
            {posts.map((post) => (
              <div key={post.id} className="bg-[#1e2a47] rounded-xl shadow-lg p-6">
                {/* Username with Avatar */}
                <div className="flex items-center space-x-2">
                  <Avatar name={profileData.username} size="40" round={true} />
                  <p className="text-gray-400 text-sm font-semibold">
                    <span className="text-blue-300">{profileData.username}</span>
                  </p>
                </div>

                {/* Recipe Image */}
                <img
                  src={post.recipe.image}
                  alt={post.recipe.name}
                  className="w-full h-48 object-cover rounded-lg mt-3"
                />

                <div className="flex justify-between mt-3">
                  <h2 className="text-xl font-semibold">{post.recipe.name}</h2>
                  <p className="text-gray-400 text-sm">
                    Created {formatDistanceToNow(new Date(post.recipe.created_at), { addSuffix: true })}
                  </p>
                </div>

                <div className="mt-3 flex justify-between text-gray-400 text-sm">
                  <span>👍 {post.average_rating} Likes</span>
                  <span>💬 {post.recipe.comments} Comments</span>
                </div>

                <div className="mt-3">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded-md"
                    onClick={() => handleViewDetails(post.recipe)}
                  >
                    View Full Details
                  </button>
                </div>
                
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal for Full Recipe Details */}
      {selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-[#1e2a47] rounded-xl p-6 w-96">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold text-blue-500">{selectedRecipe.name}</h2>
              <button onClick={closeModal} className="text-gray-400 text-xl">
                ✖
              </button>
            </div>

            <div className="mt-2 flex items-center space-x-2">
              <Avatar name={profileData.username} size="40" round={true} />
              <p className="text-gray-300 text-sm font-semibold">
                Posted by: <span className="text-blue-300">{profileData.username}</span>
              </p>
            </div>
            <p className="text-gray-300 text-sm">
              Created {formatDistanceToNow(new Date(selectedRecipe.created_at), { addSuffix: true })}
            </p>

            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-300">Ingredients:</h3>
              <ul className="list-disc list-inside text-gray-300">
                {selectedRecipe.ingredients && selectedRecipe.ingredients.trim().length > 0 ? (
                  selectedRecipe.ingredients.split(",").map((ingredient, index) => (
                    <li key={index} className="ml-4">{ingredient.trim()}</li>
                  ))
                ) : (
                  <li className="text-gray-400">No ingredients listed</li>
                )}
              </ul>
            </div>

            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-300">Instructions:</h3>
              <p className="text-gray-300 whitespace-pre-line">{selectedRecipe.instructions}</p>
            </div>

            <div className="mt-3 flex flex-wrap gap-2">
              <span className="bg-blue-600 text-white px-2 py-1 text-xs rounded">
                ⏳ Prep Time: {selectedRecipe.prep_time} min
              </span>
              <span className="bg-green-600 text-white px-2 py-1 text-xs rounded">
                🍽️ Servings: {selectedRecipe.servings}
              </span>
            </div>

            <div className="mt-3">
              <h3 className="text-lg font-semibold text-gray-300">Tags:</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedRecipe.tags && selectedRecipe.tags.trim().length > 0 ? (
                  selectedRecipe.tags.split(",").map((tag, index) => (
                    <span key={index} className="bg-gray-700 px-2 py-1 text-xs rounded">
                      #{tag.trim()}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">No tags</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
