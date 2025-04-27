import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import Avatar from "react-avatar";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FaClock, FaEdit, FaUtensils, FaStar, FaPlus, FaHeart, FaThumbsUp, FaShoppingCart, FaFilePdf, FaTimes, FaSpinner, FaCalendar, FaSearch, FaMagic, FaMapMarkerAlt } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

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
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  useEffect(() => {
    // Fetch user location for map
    if (showIngredients && showMap) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          fetchNearbyStores(latitude, longitude);
        },
        () => {
          // Fallback to New York City if location access is denied
          setUserLocation({ lat: 40.7128, lng: -74.0060 });
          fetchNearbyStores(40.7128, -74.0060);
        }
      );
    }
  }, [showIngredients, showMap]);

  const fetchNearbyStores = async (lat, lng) => {
    try {
      const overpassQuery = `
        [out:json];
        node
          ["shop"="supermarket"]
          (around:5000,${lat},${lng});
        out body;
      `;
      const response = await axios.post("https://overpass-api.de/api/interpreter", overpassQuery);
      const stores = response.data.elements.map((element) => ({
        id: element.id,
        lat: element.lat,
        lng: element.lon,
        name: element.tags.name || "Supermarket",
      }));
      setNearbyStores(stores);
    } catch (error) {
      console.error("Error fetching nearby stores:", error);
      setNearbyStores([]);
    }
  };

  const handleRecipeClick = (recipeId) => {
    navigate(`/recipe/${recipeId}`);
  };

  const fetchIngredients = async (planId) => {
    const token = localStorage.getItem("token");
    setLoadingIngredients(true);
    setShowIngredients(true);
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/features/mealplans/${planId}/ingredients/`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const ingredientsData = response.data.items;
      setIngredients(ingredientsData);
      setCheckedIngredients(ingredientsData.map(() => false));
    } catch (error) {
      console.error("Error fetching ingredients:", error);
      setIngredients([]);
      setCheckedIngredients([]);
    } finally {
      setLoadingIngredients(false);
    }
  };

  const downloadPdf = async (planId) => {
    const token = localStorage.getItem("token");
    setLoadingPdf((prev) => ({ ...prev, [planId]: true }));
    try {
      const response = await axios({
        url: `${process.env.REACT_APP_API_URL}/features/mealplans/${planId}/pdf/`,
        method: "GET",
        responseType: "blob",
        headers: { Authorization: `Bearer ${token}` },
      });
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
            li { padding: 10px 0; font-size: 16px; }
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
    { id: "mealplans", label: "Meal Plans", icon: <FaCalendar /> },
  ];

  // Animation Variants
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
  };

  const mapContainerStyle = {
    width: "100%",
    height: "300px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="max-w-7xl mx-auto">
          <Skeleton height={250} className="rounded-3xl mb-8" />
          <Skeleton height={40} width={200} className="mb-6 mx-auto" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array(6)
              .fill()
              .map((_, i) => (
                <Skeleton key={i} height={350} className="rounded-2xl" />
              ))}
          </div>
        </div>
      </div>
    );
  }

  const filteredRecipes = userRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredFavourites = favouriteRecipes.filter((recipe) =>
    recipe.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredMealPlans = mealPlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
      {/* Sidebar for Desktop */}
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

      {/* Main Content */}
      <main className="lg:ml-64 p-4 sm:p-6 min-h-screen">
        {/* Mobile Header */}
        <header className="lg:hidden flex items-center justify-between mb-6">
          <div className="w-6"></div>
          <div className="w-6"></div>
        </header>

        {/* Profile Section */}
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

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md mx-auto">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${activeSection}...`}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
              aria-label={`Search ${activeSection}`}
            />
          </div>
        </div>

        {/* Content Sections */}
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
                  <p className="text-lg">
                    {searchQuery ? "No recipes match your search." : "You haven’t shared any recipes yet."}
                  </p>
                  <Link
                    to="/submit-recipe"
                    className="mt-4 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
                  >
                    Create Your First Recipe
                  </Link>
                </motion.div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                  {filteredRecipes.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer mb-6 break-inside-avoid"
                    >
                      <div className="relative aspect-[4/3]">
                        {recipe.image ? (
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FaUtensils className="text-gray-400 text-4xl" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-semibold text-white truncate">{recipe.name}</h3>
                          <p className="text-sm text-gray-200 line-clamp-2">{recipe.description}</p>
                        </div>
                        <span className="absolute top-4 right-4 bg-teal-500 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex gap-4 text-gray-600 text-sm">
                          <span className="flex items-center gap-1">
                            <FaThumbsUp className="text-teal-500" />
                            {recipe.post?.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            {recipe.post?.average_rating || "N/A"}
                          </span>
                        </div>
                        <motion.button
                          onClick={() => handleRecipeClick(recipe.id)}
                          className="text-teal-500 hover:text-teal-600"
                          whileHover={{ scale: 1.1 }}
                        >
                          View
                        </motion.button>
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
                  <p className="text-lg">
                    {searchQuery ? "No favorites match your search." : "No favorite recipes yet."}
                  </p>
                  <Link
                    to="/posts"
                    className="mt-4 inline-block px-5 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-all duration-300"
                  >
                    Discover Recipes
                  </Link>
                </motion.div>
              ) : (
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-6">
                  {filteredFavourites.map((recipe, index) => (
                    <motion.div
                      key={recipe.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="bg-white rounded-2xl shadow-sm overflow-hidden cursor-pointer mb-6 break-inside-avoid"
                    >
                      <div className="relative aspect-[4/3]">
                        {recipe.image ? (
                          <img src={recipe.image} alt={recipe.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <FaUtensils className="text-gray-400 text-4xl" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/70 to-transparent" />
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-lg font-semibold text-white truncate">{recipe.name}</h3>
                          <p className="text-sm text-gray-200 line-clamp-2">{recipe.description}</p>
                        </div>
                        <span className="absolute top-4 right-4 bg-teal-500 text-white px-2.5 py-1 rounded-full text-xs flex items-center gap-1">
                          <FaClock /> {recipe.prep_time || "N/A"} mins
                        </span>
                        <span className="absolute top-4 left-4 bg-red-500/30 text-red-400 p-1.5 rounded-full">
                          <FaHeart size={16} />
                        </span>
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex gap-4 text-gray-600 text-sm">
                          <span className="flex items-center gap-1">
                            <FaThumbsUp className="text-teal-500" />
                            {recipe.post?.likes?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FaStar className="text-yellow-400" />
                            {recipe.post?.average_rating || "N/A"}
                          </span>
                        </div>
                        <motion.button
                          onClick={() => handleRecipeClick(recipe.id)}
                          className="text-teal-500 hover:text-teal-600"
                          whileHover={{ scale: 1.1 }}
                        >
                          View
                        </motion.button>
                      </div>
                    </motion.div>
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
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <h3 className="text-2xl font-bold text-gray-900">{selectedPlan.name}</h3>
                        <motion.button
                          onClick={() => setSelectedPlan(null)}
                          className="text-gray-600 hover:text-teal-500 transition-colors"
                          whileHover={{ rotate: 90 }}
                          aria-label="Close modal"
                        >
                          <FaTimes size={24} />
                        </motion.button>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Array.from(
                          {
                            length:
                              Math.ceil(
                                (new Date(selectedPlan.end_date) - new Date(selectedPlan.start_date)) /
                                  (1000 * 60 * 60 * 24)
                              ) + 1,
                          },
                          (_, i) => i + 1
                        ).map((day) => (
                          <motion.button
                            key={day}
                            className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-teal-500 hover:text-white transition-colors text-sm"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            Day {day}
                          </motion.button>
                        ))}
                      </div>
                      <motion.div className="space-y-6" variants={containerVariants} initial="hidden" animate="visible">
                        {Array.from(
                          {
                            length:
                              Math.ceil(
                                (new Date(selectedPlan.end_date) - new Date(selectedPlan.start_date)) /
                                  (1000 * 60 * 60 * 24)
                              ) + 1,
                          },
                          (_, i) => i + 1
                        ).map((day) => (
                          <motion.div
                            key={day}
                            className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-200"
                            variants={itemVariants}
                          >
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">
                              Day {day} -{" "}
                              {new Date(
                                new Date(selectedPlan.start_date).getTime() + (day - 1) * 86400000
                              ).toLocaleDateString()}
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {selectedPlan.entries.filter((e) => e.day === day).map((entry) => (
                                <motion.div
                                  key={entry.meal_type}
                                  className="flex items-center bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:border-teal-200 transition-all duration-300"
                                  initial={{ opacity: 0, x: -20 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.4 }}
                                  whileHover={{ scale: 1.02 }}
                                >
                                  <img
                                    src={entry.recipe?.image || "https://via.placeholder.com/80?text=No+Image"}
                                    alt={entry.recipe?.name || "Recipe"}
                                    className="w-16 h-16 object-cover rounded-lg mr-4 shadow-sm"
                                    onError={(e) => (e.target.src = "https://via.placeholder.com/80?text=No+Image")}
                                  />
                                  <div className="flex-1">
                                    <p className="text-gray-900 text-sm font-medium">
                                      <span className="capitalize text-teal-500">{entry.meal_type}:</span>{" "}
                                      {entry.recipe?.name || "No recipe selected"}
                                    </p>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </motion.div>
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
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                          <FaShoppingCart /> Shopping List
                        </h3>
                        <motion.button
                          onClick={() => setShowIngredients(false)}
                          className="text-gray-600 hover:text-teal-500 transition-colors"
                          whileHover={{ rotate: 90 }}
                          aria-label="Close shopping list"
                        >
                          <FaTimes size={24} />
                        </motion.button>
                      </div>
                      {loadingIngredients ? (
                        <div className="space-y-4">
                          {Array(5)
                            .fill()
                            .map((_, i) => (
                              <Skeleton key={i} height={40} className="rounded-lg" />
                            ))}
                        </div>
                      ) : ingredients.length === 0 ? (
                        <p className="text-gray-600 text-center py-6 text-sm">No ingredients available.</p>
                      ) : (
                        <motion.div
                          className="space-y-4"
                          variants={containerVariants}
                          initial="hidden"
                          animate="visible"
                        >
                          <div className="flex justify-between items-center">
                            <span className="text-gray-600 text-sm">
                              {ingredients.length} items
                            </span>
                            <div className="flex gap-2">
                              <motion.button
                                onClick={handleSelectAll}
                                className="text-teal-500 hover:text-teal-600 text-sm"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {checkedIngredients.every((checked) => checked) ? "Deselect All" : "Select All"}
                              </motion.button>
                              <motion.button
                                onClick={handlePrint}
                                className="text-teal-500 hover:text-teal-600 text-sm"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                Print Selected
                              </motion.button>
                            </div>
                          </div>
                          <motion.ul className="space-y-3">
                            {ingredients.map((item, index) => (
                              <motion.li
                                key={index}
                                className="flex items-center bg-gray-50 p-3 rounded-lg border border-gray-200"
                                variants={itemVariants}
                              >
                                <input
                                  type="checkbox"
                                  checked={checkedIngredients[index]}
                                  onChange={() => handleCheckboxChange(index)}
                                  className="mr-3 h-4 w-4 text-teal-500 focus:ring-teal-500"
                                  aria-label={`Check ${item.name}`}
                                />
                                <span className="flex-1 text-gray-900">{item.name}</span>
                                <span className="text-gray-600 text-sm">
                                  {item.quantity} {item.unit}
                                </span>
                              </motion.li>
                            ))}
                          </motion.ul>
                          <motion.button
                            onClick={() => setShowMap(!showMap)}
                            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg text-sm font-medium hover:bg-teal-600 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <FaMapMarkerAlt /> {showMap ? "Hide Nearby Stores" : "Show Nearby Stores"}
                          </motion.button>
                          {showMap && userLocation && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <MapContainer
                                center={[userLocation.lat, userLocation.lng]}
                                zoom={14}
                                style={mapContainerStyle}
                              >
                                <TileLayer
                                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                  attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                />
                                <Marker position={[userLocation.lat, userLocation.lng]}>
                                  <Popup>You are here</Popup>
                                </Marker>
                                {nearbyStores.map((store) => (
                                  <Marker
                                    key={store.id}
                                    position={[store.lat, store.lng]}
                                  >
                                    <Popup>{store.name}</Popup>
                                  </Marker>
                                ))}
                              </MapContainer>
                            </motion.div>
                          )}
                        </motion.div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </section>
      </main>

      {/* Mobile Bottom Navigation */}
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
    </div>
  );
};

export default Profile;