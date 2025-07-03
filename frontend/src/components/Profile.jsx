import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Avatar from "react-avatar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaClock, FaEdit, FaUtensils, FaPlus, FaHeart, FaShoppingCart, FaFilePdf, FaTimes, FaSpinner, FaCalendar, FaSearch, FaMagic, FaMapMarkerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import PostDetails from "./forms/PostDetails";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userCache = {};

// New Card Component for Recipes, styled like PostCard.js
const ProfileRecipeCard = ({ recipe, index, onOpenModal, profileData }) => {

  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user details using the endpoint
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = recipe.user; // Assuming recipe.user contains the email
        if (!email) {
          setError('No user email provided');
          setIsLoading(false);
          return;
        }

        // Check cache first
        if (userCache[email]) {
          setUserData(userCache[email]);
          setIsLoading(false);
          return;
        }

        // Retrieve the JWT token from localStorage
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No access token found');
        }
        const headers = { Authorization: `Bearer ${token}` };

        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/profile/${email}/`,
          { headers }
        );
        const data = response.data;
        // Store in cache
        userCache[email] = data;
        setUserData(data);
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError(err.message || 'Failed to fetch user data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [recipe.user]); // Dependency array includes recipe.user

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            onClick={() => onOpenModal(recipe, index)}
            className="bg-white rounded-xl shadow-sm hover:shadow-lg border border-neutral-200 
            transition-all duration-300 overflow-hidden cursor-pointer group hover:transform 
            hover:scale-105"
        >
            <div className="relative aspect-[4/3]">
                <img
                    src={recipe.image || 'https://via.placeholder.com/400x300?text=No+Image'}
                    alt={recipe.name}
                    className="w-full h-full object-cover transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                <div className="absolute bottom-0 left-0 p-4 w-full">
                    <h3 className="text-xl font-semibold text-white mb-2 truncate">
                        {recipe.name}
                    </h3>
                    <div className="flex items-center justify-between">
                        <span className="text-white/90 text-sm">
                          by {isLoading ? 'Loading...' : error ? 'Unknown User' : userData?.username || 'Unknown User'}
                        </span>
                    </div>
                </div>
            </div>
            <div className="p-4 border-t border-neutral-200">
                <p className="text-neutral-600 text-sm line-clamp-2 h-10">
                    {recipe.description}
                </p>
                <div className="mt-3 flex items-center justify-between text-sm text-neutral-500">
                    <span className="flex items-center">
                        <FaClock className="inline mr-1" /> {recipe.prep_time || 'N/A'} mins
                    </span>
                    <div className="flex items-center space-x-2 text-neutral-600">
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const Profile = () => {
  const [profileData, setProfileData] = useState(null);
  const [userRecipes, setUserRecipes] = useState([]);
  const [favouriteRecipes, setFavouriteRecipes] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [checkedIngredients, setCheckedIngredients] = useState([]);
  const [showIngredients, setShowIngredients] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingIngredients, setLoadingIngredients] = useState(false);
  const [loadingPdf, setLoadingPdf] = useState({});
  const [activeSection, setActiveSection] = useState("recipes");
  const [searchQuery, setSearchQuery] = useState("");
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyStores, setNearbyStores] = useState([]);
  const navigate = useNavigate();

  // State for Recipe Modal
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(null);
  const [activePostList, setActivePostList] = useState([]);
  const [activeRecipeList, setActiveRecipeList] = useState([]);
  const [showLocationConsent, setShowLocationConsent] = useState(false);
  const sectionRefs = useRef([]);

  useEffect(() => {
    const fetchProfileData = async () => {
      const token = localStorage.getItem("token");
      try {
        const [profileResponse, recipesResponse, favouritesResponse, mealPlansResponse] = await Promise.all([
          axios.get(`${process.env.REACT_APP_API_URL}/profile/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/recipes/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/favourites/`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${process.env.REACT_APP_API_URL}/features/mealplans/`, { headers: { Authorization: `Bearer ${token}` } }),
        ]);
        setProfileData(profileResponse.data);
        setUserRecipes(recipesResponse.data);
        setFavouriteRecipes(favouritesResponse.data);
        setMealPlans(mealPlansResponse.data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  // Handlers for Recipe Modal
  const openModal = (recipe, index, list) => {
    const transformedList = list.map(r => ({
      id: r.post?.id || null,
      recipe: r,
      comments: [], // No comments needed
      average_rating: 0, // No rating needed
      likes_count: 0, // No likes needed
      user: r.post?.user || profileData?.id,
    }));

    // Create a post-like object for the selected recipe
    const selectedPost = {
      id: recipe.post?.id || null,
      recipe: recipe,
      comments: [], // No comments needed
      average_rating: 0, // No rating needed
      likes_count: 0, // No likes needed
      user: recipe.post?.user || profileData?.id,
    };

    setSelectedRecipe(selectedPost);
    setCurrentIndex(index);
    setActivePostList(transformedList);
    setActiveRecipeList(list);
  };

  const closeModal = () => {
    setSelectedRecipe(null);
    setCurrentIndex(null);
    setActivePostList([]);
    setActiveRecipeList([]);
  };

  const handleArrowClick = (direction) => {
    if (!activeRecipeList.length) return;
    const newIndex = direction === "left"
      ? (currentIndex - 1 + activeRecipeList.length) % activeRecipeList.length
      : (currentIndex + 1) % activeRecipeList.length;
    const selectedRecipe = activeRecipeList[newIndex];
    const selectedPost = {
      id: selectedRecipe.post?.id || null,
      recipe: selectedRecipe,
      comments: [], // No comments needed
      average_rating: 0, // No rating needed
      likes_count: 0, // No likes needed
      user: selectedRecipe.post?.user || profileData?.id,
    };
    setSelectedRecipe(selectedPost);
    setCurrentIndex(newIndex);
  };

  const fetchUserLocation = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        fetchNearbyStores(latitude, longitude);
      },
      () => {
        setUserLocation({ lat: 40.7128, lng: -74.0060 });
        fetchNearbyStores(40.7128, -74.0060);
      }
    );
  };

  const handleLocationConsent = (allow) => {
    localStorage.setItem("locationConsent", allow ? "granted" : "denied");
    setShowLocationConsent(false);
    fetchUserLocation();
  };

  useEffect(() => {
    const consent = localStorage.getItem("locationConsent");
    if (showIngredients && showMap) {
      if (consent === "granted") {
        fetchUserLocation();
      } else if (!consent) {
        setShowLocationConsent(true);
      } else {
        setUserLocation({ lat: 40.7128, lng: -74.0060 });
        fetchNearbyStores(40.7128, -74.0060);
      }
    }
  }, [showIngredients, showMap]);

  const fetchNearbyStores = async (lat, lng) => {
    try {
      const overpassQuery = `[out:json];node["shop"="supermarket"](around:5000,${lat},${lng});out body;`;
      const response = await axios.post("https://overpass-api.de/api/interpreter", overpassQuery);
      setNearbyStores(response.data.elements.map(el => ({ id: el.id, lat: el.lat, lng: el.lon, name: el.tags.name || "Supermarket" })));
    } catch (error) {
      console.error("Error fetching nearby stores:", error);
      setNearbyStores([]);
    }
  };

  const fetchIngredients = async (planId) => {
    const token = localStorage.getItem("token");
    setLoadingIngredients(true);
    setShowIngredients(true);
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/features/mealplans/${planId}/ingredients/`, { headers: { Authorization: `Bearer ${token}` } });
      setIngredients(response.data.items);
      setCheckedIngredients(response.data.items.map(() => false));
    } catch (error) {
      console.error("Error fetching ingredients:", error);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const downloadPdf = async (planId) => {
    const token = localStorage.getItem("token");
    setLoadingPdf((prev) => ({ ...prev, [planId]: true }));
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/features/mealplans/${planId}/pdf/`, { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `shopping_list_${planId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error downloading PDF:", error);
    } finally {
      setLoadingPdf((prev) => ({ ...prev, [planId]: false }));
    }
  };

  const handleCheckboxChange = (index) => {
    setCheckedIngredients((prev) =>
      prev.map((checked, i) => (i === index ? !checked : checked))
    );
  };

  const handleSelectAll = () => {
    const allChecked = checkedIngredients.every((checked) => checked);
    setCheckedIngredients(ingredients.map(() => !allChecked));
  };

  const handlePrint = () => {
    const selectedItems = ingredients.filter((_, index) => checkedIngredients[index]);
    if (selectedItems.length === 0) {
      alert("Please select at least one ingredient to print.");
      return;
    }

    const printContent = `
      <html>
        <head>
          <title>Shopping List</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #2dd4bf; text-align: center; }
            ul { list-style: none; padding: 0; }
            li { padding: 10px 0; font-size: 16px; border-bottom: 1px solid #eee; }
            .item { display: flex; justify-content: space-between; }
          </style>
        </head>
        <body>
          <h1>Shopping List</h1>
          <ul>
            ${selectedItems
              .map(
                (item) =>
                  `<li><div class="item"><span>${item.name}</span><span>${item.quantity} ${item.unit}</span></div></li>`
              )
              .join("")}
          </ul>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const sections = [
    { id: "recipes", label: "Recipes", icon: <FaUtensils /> },
    { id: "favourites", label: "Favourites", icon: <FaHeart /> },
    { id: "mealplans", label: "Meal Plans", icon: <FaCalendar /> }
  ];
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const modalVariants = { hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } }, exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } } };
  const mapContainerStyle = { width: "100%", height: "300px", borderRadius: "16px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton height={250} className="rounded-3xl mb-8" />
          <Skeleton height={40} width={200} className="mb-6 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill().map((_, i) => <Skeleton key={i} height={350} className="rounded-2xl" />)}
          </div>
        </div>
      </div>
    );
  }

  const filteredRecipes = userRecipes.filter((recipe) => recipe.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredFavourites = favouriteRecipes.filter((recipe) => recipe.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredMealPlans = mealPlans.filter((plan) => plan.name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      <motion.aside
        className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-6 hidden lg:block"
        initial={{ x: "-100%" }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center gap-3 mb-8">
          <Avatar
            name={profileData?.username}
            src={profileData?.profile_image}
            size="40"
            round={true}
            className="border-2 border-teal-500"
          />
          <h2 className="text-lg font-semibold text-gray-900">{profileData?.username || "User"}</h2>
        </div>
        <nav className="space-y-2">
          {sections.map((section) => (
            <motion.button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeSection === section.id
                  ? "bg-teal-500 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {section.icon}
              {section.label}
            </motion.button>
          ))}
        </nav>
      </motion.aside>
      <main className="lg:ml-64 p-4 sm:p-6 min-h-screen pb-[80px] lg:pb-0">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="bg-white rounded-3xl shadow-sm p-6 sm:p-8 mb-8"
        >
          <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
            <div className="relative">
              <Avatar
                name={profileData?.username}
                src={profileData?.profile_image}
                size="100"
                round={true}
                className="border-4 border-teal-500 shadow-lg transition-transform duration-300 hover:scale-105"
              />
              <motion.button
                className="absolute -bottom-2 -right-2 bg-teal-500 text-white rounded-full p-2"
                whileHover={{ scale: 1.1 }}
                aria-label="Edit profile"
              >
                <FaEdit size={16} />
              </motion.button>
            </div>
            <div className="text-center sm:text-left flex-1">
              <h2 className="text-2xl font-bold text-gray-900">{profileData?.username || "User"}</h2>
              <p className="text-gray-600 text-sm mt-1">{profileData?.email || "No email"}</p>
              <div className="grid grid-cols-3 gap-4 mt-4 text-gray-600 text-sm">
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center gap-1.5">
                    <FaUtensils className="text-teal-500" />
                    <span>{userRecipes.length}</span>
                  </div>
                  <span>Recipes</span>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center gap-1.5">
                    <FaHeart className="text-red-400" />
                    <span>{favouriteRecipes.length}</span>
                  </div>
                  <span>Favorites</span>
                </div>
                <div className="flex flex-col items-center sm:items-start">
                  <div className="flex items-center gap-1.5">
                    <FaCalendar className="text-teal-500" />
                    <span>{mealPlans.length}</span>
                  </div>
                  <span>Plans</span>
                </div>
              </div>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Link
                  to="/submit-recipe"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
                  aria-label="Add a new recipe"
                >
                  <FaPlus /> Add Recipe
                </Link>
                <Link
                  to="/recipe-generator"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition-all duration-300"
                  aria-label="Generate a custom recipe"
                >
                  <FaMagic /> Generate Recipe
                </Link>
              </div>
            </div>
          </div>
        </motion.section>

        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeSection}...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        <section>
          {activeSection === "recipes" && (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left"
              >
                Your Recipes
              </motion.h2>
              {filteredRecipes.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="text-center bg-white rounded-3xl p-12 text-gray-600 shadow-sm border border-gray-200"
                >
                  <FaUtensils className="text-teal-500 text-4xl mx-auto mb-4" />
                  <p className="text-lg">{searchQuery ? "No recipes match your search." : "You haven’t shared any recipes yet."}</p>
                  <Link
                    to="/submit-recipe"
                    className="mt-4 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
                  >
                    Create Your First Recipe
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredRecipes.map((recipe, index) => (
                    <ProfileRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={index}
                      profileData={profileData}
                      onOpenModal={() => openModal(recipe, index, filteredRecipes)}
                    />
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
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left"
              >
                Your Favourites
              </motion.h2>
              {filteredFavourites.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="text-center bg-white rounded-3xl p-12 text-gray-600 shadow-sm border border-gray-200"
                >
                  <FaHeart className="text-red-400 text-4xl mx-auto mb-4" />
                  <p className="text-lg">{searchQuery ? "No favorites match your search." : "No favorite recipes yet."}</p>
                  <Link
                    to="/posts"
                    className="mt-4 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
                  >
                    Discover Recipes
                  </Link>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredFavourites.map((recipe, index) => (
                    <ProfileRecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      index={index}
                      profileData={profileData}
                      onOpenModal={() => openModal(recipe, index, filteredFavourites)}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {activeSection === "mealplans" && (
            <>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-2xl font-bold text-gray-900 mb-6 text-center sm:text-left"
              >
                Your Meal Plans
              </motion.h2>
              {filteredMealPlans.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8 }}
                  className="text-center bg-white rounded-3xl p-12 text-gray-600 shadow-sm border border-gray-200"
                >
                  <FaCalendar className="text-teal-500 text-4xl mx-auto mb-4" />
                  <p className="text-lg">
                    {searchQuery ? "No meal plans match your search." : "No meal plans yet."}
                  </p>
                  <Link
                    to="/meal-planner"
                    className="mt-4 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
                  >
                    Add Meal Plan
                  </Link>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  <div className="flex justify-end mb-4">
                    <Link
                      to="/meal-planner"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-lg font-medium hover:bg-teal-600 transition-all duration-300"
                    >
                      <FaPlus /> Add Meal Plan
                    </Link>
                  </div>
                  <motion.div
                    className="space-y-6"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    {filteredMealPlans.map((plan) => (
                      <motion.div
                        key={plan.id}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 hover:border-teal-200 transition-all duration-300"
                        variants={itemVariants}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                            <p className="text-gray-600 text-sm mt-1">
                              {new Date(plan.start_date).toLocaleDateString()} -{" "}
                              {new Date(plan.end_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <motion.button
                              onClick={() => setSelectedPlan(plan)}
                              className="px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Plan
                            </motion.button>
                            <motion.button
                              onClick={() => fetchIngredients(plan.id)}
                              className="px-4 py-2 bg-indigo-500 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-indigo-600 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <FaShoppingCart /> List
                            </motion.button>
                            <motion.button
                              onClick={() => downloadPdf(plan.id)}
                              className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium flex items-center gap-1 hover:bg-purple-600 transition-colors"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              disabled={loadingPdf[plan.id]}
                            >
                              {loadingPdf[plan.id] ? (
                                <FaSpinner className="animate-spin" />
                              ) : (
                                <>
                                  <FaFilePdf /> PDF
                                </>
                              )}
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl"
              variants={modalVariants}
            >
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showIngredients && (
          <motion.div
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-3xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 shadow-2xl"
              variants={modalVariants}
            >
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg p-4 flex justify-around lg:hidden">
        {sections.map((section) => (
          <motion.button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`flex flex-col items-center text-sm ${
              activeSection === section.id ? "text-teal-500" : "text-gray-600"
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            aria-label={section.label}
          >
            {section.icon}
            <span className="mt-1">{section.label}</span>
          </motion.button>
        ))}
      </nav>

      <AnimatePresence>
        {selectedRecipe && (
          <PostDetails
            post={selectedRecipe}
            posts={activePostList}
            currentIndex={currentIndex}
            onClose={closeModal}
            onNavigate={handleArrowClick}
            hideCommentsAndRating={true} // New prop to hide comments and rating
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Profile;