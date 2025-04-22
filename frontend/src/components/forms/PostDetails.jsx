import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaTimes, FaCheck, FaChevronLeft, FaChevronRight, FaStar, FaRegStar, FaAppleAlt, FaComment, FaClock } from "react-icons/fa";
import Avatar from "react-avatar";
import { Oval } from "react-loader-spinner";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "../../context/TranslationContext";
import TranslatedText from "../../context/TranslatedText";
import { motion, AnimatePresence } from "framer-motion";

const RecipeModal = ({
  selectedRecipe,
  currentIndex,
  posts,
  onClose,
  onNavigate,
  onRate,
  onComment,
  rating,
  setRating,
  commentText,
  setCommentText,
}) => {
  const [isLeaving, setIsLeaving] = useState(false);
  const [slideDirection, setSlideDirection] = useState(null);
  const [isImageFullScreen, setIsImageFullScreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [imageHeight, setImageHeight] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const modalRef = useRef(null);
  const imageRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;
  const scrollableRef = useRef(null);

  const [nutrition, setNutrition] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");

  const { currentLanguage, translateRecipe } = useTranslation();
  const [translatedRecipe, setTranslatedRecipe] = useState(null);
  const detailsRef = useRef(null); // New ref for details section

  useEffect(() => {
    const fetchTranslation = async () => {
      if (selectedRecipe && currentLanguage !== "en") {
        const translated = await translateRecipe(selectedRecipe.id, currentLanguage);
        if (translated) {
          setTranslatedRecipe(translated);
        }
      } else {
        setTranslatedRecipe(null);
      }
    };
    fetchTranslation();
  }, [selectedRecipe, currentLanguage]);

  useEffect(() => {
    const img = imageRef.current;
    if (img) {
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const maxWidth = window.innerWidth >= 1024 ? window.innerWidth * 0.5 : window.innerWidth - 32;
        const calculatedHeight = Math.min(maxWidth / aspectRatio, window.innerHeight * 0.4);
        setImageHeight(calculatedHeight);
      };
      if (img.complete) {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const maxWidth = window.innerWidth >= 1024 ? window.innerWidth * 0.5 : window.innerWidth - 32;
        const calculatedHeight = Math.min(maxWidth / aspectRatio, window.innerHeight * 0.4);
        setImageHeight(calculatedHeight);
      }
    }
  }, [selectedRecipe]);

  const recipeContent = translatedRecipe || selectedRecipe;

  useEffect(() => {
    document.body.classList.add("no-scroll");
    return () => document.body.classList.remove("no-scroll");
  }, []);

  useEffect(() => {
  if (detailsRef.current) {
    detailsRef.current.scrollTop = 0;
  }
}, [selectedRecipe]);

  const fetchNutrition = async () => {
    setShowNutritionModal(true);
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/nutrition/`,
        { ingredients: selectedRecipe.ingredients, recipeName: selectedRecipe.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const nutritionData = response.data;
      setNutrition(nutritionData);

      const recommendationResponse = await axios.post(
        `${process.env.REACT_APP_API_URL}/recommendation/`,
        { nutrition: nutritionData, recipeName: selectedRecipe.name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRecommendation(recommendationResponse.data.recommendation);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching nutritional information:", error);
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose();
      setIsLeaving(false);
    }, 300);
  };

  const handleNavigation = (direction) => {
    setSlideDirection(direction);
    onNavigate(direction);
    setTimeout(() => setSlideDirection(null), 300);
  };

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) handleNavigation("right");
    else if (isRightSwipe) handleNavigation("left");

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleImageClick = () => setIsImageFullScreen(true);
  const handleImageClose = () => setIsImageFullScreen(false);

  const handleRateSubmit = () => {
    setIsRatingSubmitted(true);
    onRate(selectedRecipe.id, rating);
    setTimeout(() => setIsRatingSubmitted(false), 1000);
  };

  const handleCommentSubmit = () => {
    setIsCommentSubmitting(true);
    onComment(posts[currentIndex].id);
    setCommentText("");
    setTimeout(() => setIsCommentSubmitting(false), 800);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } },
  };

  const slideVariants = {
    enter: (direction) => ({
      x: direction === "right" ? 1000 : -1000,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction) => ({
      x: direction === "right" ? -1000 : 1000,
      opacity: 0,
    }),
  };

  const buttonVariants = {
    initial: { scale: 1 },
    animate: { scale: 1.1, transition: { duration: 0.2 } },
    exit: { scale: 1, transition: { duration: 0.2 } },
  };

  const checkVariants = {
    initial: { scale: 1, rotate: 0 },
    animate: { scale: 1.2, rotate: 360, transition: { duration: 0.4 } },
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 sm:p-6"
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={modalVariants}
    >
      <motion.div
        className="relative bg-neutral-900 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl border border-neutral-700"
        ref={modalRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        custom={slideDirection}
        variants={slideVariants}
        initial="enter"
        animate="center"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 bg-neutral-800/95 backdrop-blur-sm border-b border-neutral-700">
          <h2 className="text-xl sm:text-2xl font-bold text-emerald-300 truncate">{recipeContent.name}</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={fetchNutrition}
              className="text-neutral-300 hover:text-emerald-400 transition-colors flex items-center gap-2"
            >
              <FaAppleAlt size={20} className="text-emerald-400" />
              <span className="hidden sm:inline text-neutral-200">Nutrition</span>
            </button>
            <button onClick={handleClose} className="text-neutral-300 hover:text-emerald-400 transition-colors">
              <FaTimes size={24} />
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-72px)] overflow-hidden">
          <div className="lg:w-1/2 flex flex-col">
            <div
              className="relative overflow-hidden transition-all duration-300"
              style={{ height: isExpanded ? "auto" : "280px" }}
            >
              <img
                ref={imageRef}
                src={recipeContent.image}
                alt={recipeContent.name}
                className="w-full h-full object-contain cursor-pointer"
                onClick={() => setIsExpanded(true)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/70 to-transparent" />
              <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-emerald-700/90 px-3 py-1 rounded-full text-sm text-neutral-100">
                <FaClock className="text-emerald-300" /> {recipeContent.prep_time || "N/A"} mins
              </div>
              {!isExpanded && imageHeight && (
                <button
                  onClick={() => setIsExpanded(true)}
                  className="absolute bottom-4 right-4 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 transition-colors"
                >
                  <FaChevronRight className="text-emerald-400" /> Full Image
                </button>
              )}
              {isExpanded && (
                <button
                  onClick={() => setIsExpanded(false)}
                  className="absolute top-4 right-4 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-100 p-2 rounded-full transition-colors"
                >
                  <FaTimes size={20} className="text-emerald-400" />
                </button>
              )}
            </div>
            <div className="p-4 bg-neutral-800 border-t border-neutral-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 bg-neutral-900 p-2 rounded-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="hover:scale-110 transition-transform duration-200"
                    >
                      {star <= rating ? (
                        <FaStar size={20} className="text-yellow-400" />
                      ) : (
                        <FaRegStar size={20} className="text-neutral-500" />
                      )}
                    </button>
                  ))}
                </div>
                <motion.button
                  onClick={handleRateSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-neutral-100 px-4 py-1 rounded-full text-sm transition-colors"
                  variants={buttonVariants}
                  initial="initial"
                  animate={isRatingSubmitted ? "animate" : "initial"}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {isRatingSubmitted ? (
                    <span className="flex items-center gap-2">
                      <FaCheck className="text-neutral-100" /> Rated!
                    </span>
                  ) : (
                    "Rate"
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          <div className="lg:w-1/2 p-4 sm:p-6 overflow-y-auto custom-scrollbar bg-neutral-900 " ref={detailsRef}>
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Ingredients</h3>
                <ul className="list-disc list-inside text-neutral-200 space-y-1 text-sm sm:text-base">
                  {recipeContent.ingredients?.split(",").map((ingredient, idx) => (
                    <li key={idx}>{ingredient.trim()}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-400 mb-2">Instructions</h3>
                <p className="text-neutral-200 whitespace-pre-line text-sm sm:text-base">{recipeContent.instructions}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <span className="px-3 py-1 bg-emerald-700/30 text-emerald-300 rounded-full text-sm">
                  🍽️ {recipeContent.servings || "N/A"} servings
                </span>
              </div>
              <button
                onClick={() => setShowComments(true)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-100 rounded-lg transition-colors"
              >
                <FaComment size={20} className="text-emerald-400" /> View Comments ({posts[currentIndex]?.comments.length || 0})
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={() => handleNavigation("left")}
          className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-100 shadow-lg p-2 sm:p-3 rounded-full transition-colors"
        >
          <FaChevronLeft size={20} className="text-emerald-400" />
        </button>
        <button
          onClick={() => handleNavigation("right")}
          className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-neutral-800/80 hover:bg-neutral-700 text-neutral-100 p-2 sm:p-3 rounded-full transition-colors"
        >
          <FaChevronRight size={20} className="text-emerald-400" />
        </button>
      </motion.div>

      <AnimatePresence>
        {isImageFullScreen && (
          <motion.div
            className="fixed inset-0 bg-black/95 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              onClick={handleImageClose}
              className="absolute top-4 right-4 text-neutral-100 bg-neutral-800/80 hover:bg-neutral-700 p-2 rounded-full transition-colors"
            >
              <FaTimes size={24} className="text-emerald-400" />
            </button>
            <img
              src={recipeContent.image}
              alt={recipeContent.name}
              className="w-full h-auto max-h-[90vh] object-contain"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showComments && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-neutral-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl border border-emerald-500/30">
              <div className="p-4 border-b border-neutral-700 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-emerald-400">Comments</h3>
                <button
                  onClick={() => setShowComments(false)}
                  className="text-neutral-300 hover:text-emerald-400 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="p-4 max-h-[50vh] overflow-y-auto custom-scrollbar space-y-4">
                {posts[currentIndex]?.comments.length === 0 ? (
                  <p className="text-neutral-400 text-center">No comments yet. Be the first!</p>
                ) : (
                  posts[currentIndex]?.comments.map((comment, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <Avatar name={comment.user} size="36" round={true} className="flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-neutral-100">{comment.user}</p>
                        <p className="text-sm text-neutral-300 break-words">{comment.text}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="p-4 border-b border-neutral-700 flex items-center gap-3">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className={`flex-1 bg-neutral-800 text-neutral-100 border border-neutral-600 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 transition-all ${
                    isCommentSubmitting ? "ring-2 ring-emerald-500" : "focus:ring-emerald-500"
                  }`}
                />
                <motion.button
                  onClick={handleCommentSubmit}
                  className="bg-emerald-600 hover:bg-emerald-700 text-neutral-100 p-2 rounded-full transition-colors"
                  variants={checkVariants}
                  initial="initial"
                  animate={isCommentSubmitting ? "animate" : "initial"}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <FaCheck size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showNutritionModal && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-neutral-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-y-auto custom-scrollbar">
              <div className="p-4 sm:p-6 border-b border-neutral-700 flex justify-between items-center">
                <h2 className="text-xl sm:text-2xl font-bold text-emerald-400">Nutrition Info</h2>
                <button
                  onClick={() => setShowNutritionModal(false)}
                  className="text-neutral-300 hover:text-emerald-400 transition-colors"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="flex flex-col items-center justify-center py-8">
                    <Oval
                      height={60}
                      width={60}
                      color="#10B981"
                      visible={true}
                      ariaLabel="oval-loading"
                      secondaryColor="#10B981"
                      strokeWidth={3}
                      strokeWidthSecondary={3}
                    />
                    <p className="text-neutral-300 mt-4 text-sm text-center">
                      Analyzing nutrition...
                    </p>
                  </div>
                ) : (
                  nutrition && (
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {Object.entries({
                          Calories: nutrition.calories,
                          Carbohydrates: `${nutrition.carbohydrates}g`,
                          Protein: `${nutrition.protein}g`,
                          Fat: `${nutrition.fat}g`,
                          Fiber: `${nutrition.fiber}g`,
                          Vitamins: `${nutrition.vitamins}g`,
                        }).map(([key, value]) => (
                          parseFloat(value) > 0 && (
                            <div key={key} className="bg-neutral-800 p-3 rounded-lg border border-neutral-600">
                              <p className="text-neutral-400 text-xs">{key}</p>
                              <p className="text-neutral-100 font-semibold">{value}</p>
                            </div>
                          )
                        ))}
                      </div>
                      {recommendation && (
                        <div>
                          <h3 className="text-lg font-semibold text-emerald-400 mb-2">Recommendation</h3>
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p className="text-neutral-300 text-sm mb-2" {...props} />,
                              ul: ({ node, ...props }) => (
                                <ul className="list-disc list-inside text-neutral-300 space-y-1" {...props} />
                              ),
                              li: ({ node, ...props }) => <li className="text-neutral-300" {...props} />,
                              strong: ({ node, ...props }) => (
                                <strong className="text-emerald-400 font-semibold" {...props} />
                              ),
                            }}
                          >
                            {recommendation}
                          </ReactMarkdown>
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default RecipeModal;

const customScrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #1f2937;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #10B981;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #059669;
  }
`;
const styleSheet = document.createElement("style");
styleSheet.textContent = customScrollbarStyles;
document.head.appendChild(styleSheet);