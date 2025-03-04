import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Avatar from "react-avatar";
import { FaClock, FaEdit, FaUtensils, FaStar, FaPlus, FaHeart, FaThumbsUp } from "react-icons/fa";
import { motion } from "framer-motion";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [userRecipes, setUserRecipes] = useState([]);
  const [favouriteRecipes, setFavouriteRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState("recipes"); // Section state
  const navigate = useNavigate();
  const sectionRefs = useRef([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const profileResponse = await axios.get(`${process.env.REACT_APP_API_URL}/profile/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const recipesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/recipes/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const favouritesResponse = await axios.get(`${process.env.REACT_APP_API_URL}/favourites/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setProfileData(profileResponse.data);
        setUserRecipes(recipesResponse.data);
        setFavouriteRecipes(favouritesResponse.data);
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

  const sections = [
    { id: "recipes", label: "Your Recipes", icon: <FaUtensils /> },
    { id: "favourites", label: "Favourites", icon: <FaHeart /> },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex justify-center items-center">
        <div className="text-emerald-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-teal-900 text-white overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-10 left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-20 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.7, 0.5] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Header */}
      {/* <header className="relative py-12 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-4xl md:text-5xl font-extrabold text-emerald-400 tracking-tight"
        >
          Your Culinary Haven
        </motion.h1>
        <p className="mt-2 text-lg text-gray-300">Showcase your creations and favorites</p>
      </header> */}

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* Profile Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="bg-gray-850 rounded-3xl shadow-2xl p-8 mb-12 border border-emerald-500/20 max-w-4xl mx-auto"
        >
          <div className="flex flex-col items-center md:flex-row md:items-start gap-8">
            <div className="relative">
              <Avatar
                name={profileData.username}
                src={profileData.profile_image}
                size="140"
                round={true}
                className="border-4 border-emerald-400 shadow-lg transform hover:scale-105 transition-all duration-300"
              />
              <motion.div
                className="absolute -bottom-2 -right-2 bg-emerald-500 text-white rounded-full p-2"
                whileHover={{ scale: 1.1 }}
              >
                <FaEdit size={16} />
              </motion.div>
            </div>
            <div className="text-center md:text-left flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{profileData.username}</h2>
              <p className="text-gray-400 mb-4">{profileData.email}</p>
              <div className="flex justify-center md:justify-start gap-6 text-gray-300">
                <div className="flex items-center gap-2">
                  <FaUtensils className="text-emerald-400" />
                  <span>{userRecipes.length} Recipes</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaHeart className="text-red-400" />
                  <span>{favouriteRecipes.length} Favorites</span>
                </div>
              </div>
              <Link
                to="/submit-recipe"
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-full font-semibold hover:bg-emerald-700 transition-all duration-300"
              >
                <FaPlus /> Add New Recipe
              </Link>
            </div>
          </div>
        </motion.section>

        {/* Section Navigation */}
        <div className="relative flex justify-center gap-6 mb-12 max-w-2xl mx-auto">
          {sections.map((section, index) => (
            <motion.button
              key={section.id}
              ref={(el) => (sectionRefs.current[index] = el)}
              onClick={() => setActiveSection(section.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-6 py-3 rounded-full text-base font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? "bg-emerald-600 text-white shadow-md"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              }`}
            >
              {section.icon}
              {section.label}
            </motion.button>
          ))}
          {/* <motion.div
            className="absolute bottom-1 h-1 bg-emerald-400 rounded-full"
            initial={false}
            animate={{
              left: activeSection === "recipes" ? "0%" : "50%",
              width: "50%",
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          /> */}
        </div>

        {/* Recipes Content */}
        <section className="max-w-7xl mx-auto">
          {activeSection === "recipes" && (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-3xl font-bold text-emerald-400 mb-8 text-center"
              >
                Your Recipes
              </motion.h2>
              {userRecipes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-gray-800 rounded-2xl p-12 text-gray-400 shadow-inner"
                >
                  <FaUtensils className="text-emerald-400 text-4xl mx-auto mb-4" />
                  <p className="text-lg">You haven’t shared any recipes yet. Start cooking!</p>
                  <Link
                    to="/submit-recipe"
                    className="mt-4 inline-block px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300"
                  >
                    Create Your First Recipe
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {userRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleRecipeClick(recipe.id)}
                      className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-emerald-500/20 transition-all duration-300"
                    >
                      <div className="relative aspect-video">
                        {recipe.image && (
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        <span className="absolute bottom-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">
                          {recipe.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{recipe.description}</p>
                        <div className="flex justify-between items-center text-gray-300">
                          <span className="flex items-center gap-2">
                            <FaThumbsUp className="text-emerald-400" />
                            {recipe.post?.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            {recipe.post?.average_rating || "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "favourites" && (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-3xl font-bold text-emerald-400 mb-8 text-center"
              >
                Your Favourites
              </motion.h2>
              {favouriteRecipes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                  className="text-center bg-gray-800 rounded-2xl p-12 text-gray-400 shadow-inner"
                >
                  <FaHeart className="text-red-400 text-4xl mx-auto mb-4" />
                  <p className="text-lg">No favorite recipes yet. Explore and save some!</p>
                  <Link
                    to="/posts"
                    className="mt-4 inline-block px-6 py-3 bg-emerald-500 text-white rounded-full hover:bg-emerald-600 transition-all duration-300"
                  >
                    Discover Recipes
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {favouriteRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => handleRecipeClick(recipe.id)}
                      className="bg-gray-800 rounded-2xl shadow-lg overflow-hidden cursor-pointer transform hover:scale-105 hover:shadow-emerald-500/20 transition-all duration-300"
                    >
                      <div className="relative aspect-video">
                        {recipe.image && (
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                        <span className="absolute bottom-2 right-2 bg-emerald-600 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                        <span className="absolute top-2 right-2 bg-red-500/20 text-red-300 p-1 rounded-full">
                          <FaHeart size={16} />
                        </span>
                      </div>
                      <div className="p-5 space-y-3">
                        <h3 className="text-lg font-semibold text-white line-clamp-1">
                          {recipe.name}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2">{recipe.description}</p>
                        <div className="flex justify-between items-center text-gray-300">
                          <span className="flex items-center gap-2">
                            <FaThumbsUp className="text-emerald-400" />
                            {recipe.post?.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-2">
                            <FaStar className="text-yellow-400" />
                            {recipe.post?.average_rating || "N/A"}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Profile;