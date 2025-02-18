import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Avatar from "react-avatar";
import { FaClock, FaUtensils, FaCalendarAlt } from "react-icons/fa";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [userRecipes, setUserRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/profile/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const recipesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfileData(profileResponse.data);
        setUserRecipes(recipesResponse.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile or recipes data:", error);
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-emerald-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 py-6 px-4 shadow-lg">
        <h1 className="text-3xl font-bold text-center text-gray-100">
          Profile
          <span className="text-emerald-500 ml-2">👤</span>
        </h1>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Profile Section */}
        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-start gap-6">
            <Avatar
              name={profileData.username}
              src={profileData.profile_image}
              size="120"
              round={true}
              className="border-4 border-emerald-500"
            />
            <div className="text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                {profileData.username}
              </h2>
              <p className="text-gray-400">{profileData.email}</p>
            </div>
          </div>
        </div>

        {/* Recipes Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-100 mb-6 text-center">
            Your Recipes
          </h2>
          
          {userRecipes.length === 0 ? (
            <div className="text-center text-gray-400 bg-gray-800 rounded-xl p-8">
              You haven't added any recipes yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {userRecipes.map((recipe) => (
                <div
                  key={recipe.id}
                  onClick={() => handleRecipeClick(recipe.id)}
                  className="bg-gray-800 rounded-xl shadow-lg hover:shadow-emerald-500/10 transition-all duration-300 overflow-hidden cursor-pointer"
                >
                  {/* Recipe Image */}
                  <div className="relative aspect-video">
                    {recipe.image && (
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  {/* Recipe Content */}
                  <div className="p-4">
                    <h3 className="text-xl font-semibold text-gray-100 mb-4">
                      {recipe.name}
                    </h3>

                    {/* Recipe Metrics */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-gray-400">
                        <FaCalendarAlt className="mr-2" />
                        <span>{new Date(recipe.created_at).toLocaleDateString()}</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400">
                        <FaUtensils className="mr-2" />
                        <span>{recipe.servings || "N/A"} servings</span>
                      </div>
                      
                      <div className="flex items-center text-gray-400">
                        <FaClock className="mr-2" />
                        <span>{recipe.prep_time || "N/A"} mins</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {recipe.tags?.split(",").map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-emerald-600/20 text-emerald-400 rounded-full text-xs"
                        >
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Profile;