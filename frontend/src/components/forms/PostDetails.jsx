import { FaTimes, FaCheck, FaChevronLeft, FaChevronRight, FaStar, FaRegStar, FaAppleAlt } from "react-icons/fa";
import Avatar from "react-avatar";
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Oval } from 'react-loader-spinner';
import ReactMarkdown from 'react-markdown';

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
  const modalRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;  
  const scrollableRef = useRef(null);

  const [nutrition, setNutrition] = useState(null);
  const [showNutritionModal, setShowNutritionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState('');

  const fetchNutrition = async () => {
    setShowNutritionModal(true); // Open modal immediately
    setLoading(true);
    const token = localStorage.getItem('token');
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/nutrition/`, 
      { 
        ingredients: selectedRecipe.ingredients,
        recipeName: selectedRecipe.name
       },
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const nutritionData = response.data;
      setNutrition(nutritionData);
      
      const recommendationResponse = await axios.post(`${process.env.REACT_APP_API_URL}/recommendation/`, 
       { 
        nutrition: nutritionData,
        recipeName: selectedRecipe.name
       },
       {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setRecommendation(recommendationResponse.data.recommendation);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching nutritional information:', error);
      setLoading(false);
    }
  };

  const handleCloseNutritionModal = () => {
    setShowNutritionModal(false);
  };

  useEffect(() => {
    // Lock the scroll of the background page
    document.body.classList.add('no-scroll');
    return () => {
      // Unlock the scroll of the background page when the modal is closed
      document.body.classList.remove('no-scroll');
    };
  }, []);

  useEffect(() => {
    if (scrollableRef.current) {
      scrollableRef.current.scrollTop = 0;
    }
  }, [selectedRecipe]);

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
    setTimeout(() => {
      setSlideDirection(null);
    }, 300);
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

    if (isLeftSwipe) {
      handleNavigation('right');
    } else if (isRightSwipe) {
      handleNavigation('left');
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleImageClick = () => {
    setIsImageFullScreen(true);
  };

  const handleImageClose = () => {
    setIsImageFullScreen(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <div 
        className="relative bg-gray-900 rounded-lg w-full h-full max-w-4xl mx-4 overflow-y-auto max-h-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div className="bg-gray-800 rounded-2xl w-full h-full max-w-5xl overflow-hidden relative">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-100">{selectedRecipe.name}</h2>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchNutrition}
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2"
              >
                <FaAppleAlt size={24} />
                <span>Nutritional Analysis</span>
              </button>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <FaTimes size={24} />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-80px)] p-4" ref={scrollableRef}>
            <div className="flex flex-col lg:flex-row">
              <div className="lg:w-1/2">
                <div className="relative w-full max-h-[300px] lg:max-h-[400px] overflow-hidden">
                  <img
                    src={selectedRecipe.image}
                    alt={selectedRecipe.name}
                    className="w-full h-auto object-contain cursor-pointer"
                    onClick={handleImageClick}
                  />
                </div>

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
                      onClick={() => onRate(selectedRecipe.id, rating)}
                      className="ml-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </div>

              <div className="lg:w-1/2 mt-4 lg:mt-0 lg:pl-4">
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

                    <div className="mt-4 flex items-center space-x-3">
                      <input
                        type="text"
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="flex-1 bg-gray-700 text-gray-100 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                      <button
                        onClick={() => onComment(posts[currentIndex].id)}
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
        </div>

        <button
          onClick={() => onNavigate("left")}
          className="absolute left-4 top-1/2 -translate-y-1/2 hidden lg:block bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
        >
          <FaChevronLeft size={24} />
        </button>
        <button
          onClick={() => onNavigate("right")}
          className="absolute right-4 top-1/2 -translate-y-1/2 hidden lg:block bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
        >
          <FaChevronRight size={24} />
        </button>
      </div>

      {isImageFullScreen && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
          <button
            onClick={handleImageClose}
            className="absolute top-4 right-4 text-white bg-gray-800 hover:bg-gray-700 p-2 rounded-full transition-colors"
          >
            <FaTimes size={24} />
          </button>
          <img
            src={selectedRecipe.image}
            alt={selectedRecipe.name}
            className="w-full h-auto max-h-full object-contain"
          />
        </div>
      )}

{showNutritionModal && (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="relative bg-gray-900 rounded-lg w-full max-w-md mx-4">
          <div className="p-4 border-b border-gray-700 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-100">Nutritional Information</h2>
            <button
              onClick={handleCloseNutritionModal}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <FaTimes size={24} />
            </button>
          </div>
          <div className="p-4">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-8">
                <div className="relative">
                  <Oval
                    height={80}
                    width={80}
                    color="#4CAF50"
                    visible={true}
                    ariaLabel="oval-loading"
                    secondaryColor="#4CAF50"
                    strokeWidth={2}
                    strokeWidthSecondary={2}
                  />
                  <FaAppleAlt 
                  size={32} 
                  className="text-emerald-500 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" 
                  />
                  </div>
                  <p className="text-gray-300 mt-4 text-center">
                    Analyzing nutritional content...
                    <br />
                    <span className="text-sm text-gray-400">This may take a few seconds</span>
                  </p>
              </div>
            ) : (
              nutrition && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    {parseFloat(nutrition.calories) > 0 && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Calories</p>
                        <p className="text-gray-200 text-lg font-semibold">{nutrition.calories}</p>
                      </div>
                    )}
                    {parseFloat(nutrition.carbohydrates) > 0 && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Carbohydrates</p>
                        <p className="text-gray-200 text-lg font-semibold">{nutrition.carbohydrates}g</p>
                      </div>
                    )}
                    {parseFloat(nutrition.protein) > 0 && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Protein</p>
                        <p className="text-gray-200 text-lg font-semibold">{nutrition.protein}g</p>
                      </div>
                    )}
                    {parseFloat(nutrition.fat) > 0 && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Fat</p>
                        <p className="text-gray-200 text-lg font-semibold">{nutrition.fat}g</p>
                      </div>
                    )}
                    {parseFloat(nutrition.fiber) > 0 && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Fiber</p>
                        <p className="text-gray-200 text-lg font-semibold">{nutrition.fiber}g</p>
                      </div>
                    )}
                    {parseFloat(nutrition.vitamins) > 0 && (
                      <div className="bg-gray-800 p-3 rounded-lg">
                        <p className="text-gray-400 text-sm">Vitamins</p>
                        <p className="text-gray-200 text-lg font-semibold">{nutrition.vitamins}g</p>
                      </div>
                    )}
                  </div>
                  
                  {recommendation && (
                    <div className="mt-6">
                      {/* <h3 className="text-lg font-semibold text-emerald-400 mb-3">Recommendations</h3> */}
                      <div className="prose prose-invert max-w-none">
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="text-gray-300 mb-2" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1 text-gray-300" {...props} />,
                            li: ({node, ...props}) => <li className="text-gray-300" {...props} />,
                            strong: ({node, ...props}) => <strong className="text-emerald-400 font-semibold" {...props} />
                          }}
                        >
                          {recommendation}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        </div>
      </div>
    )}
    </div>
  );
};


export default RecipeModal;