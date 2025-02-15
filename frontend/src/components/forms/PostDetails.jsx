// RecipeModal.jsx
import { FaTimes, FaCheck, FaChevronLeft, FaChevronRight, FaStar, FaRegStar } from "react-icons/fa";
import Avatar from "react-avatar";
import {  useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

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
  const modalRef = useRef(null);
  const touchStartX = useRef(null);
  const touchEndX = useRef(null);
  const minSwipeDistance = 50;  
  const scrollableRef = useRef(null);

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

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div 
        className="relative bg-gray-900 rounded-lg max-w-4xl w-full mx-4 overflow-y-auto max-h-[90vh]"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      <div className="bg-gray-800 rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden relative">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-100">{selectedRecipe.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <FaTimes size={24} />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-[calc(90vh-80px)]">
          <div className="lg:w-1/2 p-4">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              <img
                src={selectedRecipe.image}
                alt={selectedRecipe.name}
                className="w-full h-full object-cover"
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

          <div className="lg:w-1/2 p-4 overflow-y-auto" ref={scrollableRef}>
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

      <button
        onClick={() => onNavigate("left")}
        className="fixed left-4 top-1/2 -translate-y-1/2 hidden lg:block bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
      >
        <FaChevronLeft size={24} />
      </button>
      <button
        onClick={() => onNavigate("right")}
        className="fixed right-4 top-1/2 -translate-y-1/2 hidden lg:block bg-gray-800 hover:bg-gray-700 text-white p-3 rounded-full transition-colors"
      >
        <FaChevronRight size={24} />
      </button>
      </div>
    </div>
  );
};

export default RecipeModal;