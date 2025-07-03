import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { FaTimes, FaCheck, FaStar, FaRegStar, FaAppleAlt, FaComment, FaClock, FaImage } from "react-icons/fa";
import Avatar from "react-avatar";
import { Oval } from "react-loader-spinner";
import ReactMarkdown from "react-markdown";
import { motion, AnimatePresence } from "framer-motion";

const PostDetails = ({ post, posts, currentIndex, onClose, onRate, onComment, rating, setRating, commentText, setCommentText, hideCommentsAndRating = false }) => {
  const [showComments, setShowComments] = useState(false);
  const [showImagePopup, setShowImagePopup] = useState(false); // State for image popup
  
  // Rating state
  const [isRating, setIsRating] = useState(false);
  const [ratingSuccess, setRatingSuccess] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  // Commenting state
  const [isCommenting, setIsCommenting] = useState(false);
  
  const detailsRef = useRef(null);
  
  const recipe = post.recipe;

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useEffect(() => {
    if (detailsRef.current) {
      detailsRef.current.scrollTop = 0;
    }
    // Only reset rating if hideCommentsAndRating is false and setRating is provided
    if (!hideCommentsAndRating && setRating) {
      setRating(0);
    }
  }, [post.id, hideCommentsAndRating, setRating]);

  const handleClose = () => onClose();

  const handleRateSubmit = async (newRating) => {
    if (isRating || !onRate) return;
    setIsRating(true);
    if (setRating) {
      setRating(newRating);
    }
    
    await onRate(post.id, newRating);
    
    setIsRating(false);
    setRatingSuccess(true);
    setTimeout(() => setRatingSuccess(false), 2000);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (isCommenting || !commentText?.trim() || !onComment) return;
    setIsCommenting(true);
    await onComment(post.id);
    setIsCommenting(false);
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: "easeOut" } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3, ease: "easeIn" } },
  };

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        initial="hidden" animate="visible" exit="exit" variants={modalVariants}
      >
        <div className="relative bg-white rounded-2xl w-full max-w-5xl h-[90vh] overflow-hidden shadow-2xl flex flex-col">
          {/* Header */}
          <header className="flex-shrink-0 p-4 border-b border-neutral-200 flex justify-between items-center">
            <h2 className="text-2xl font-bold text-neutral-800 truncate">{recipe.name}</h2>
            <button onClick={handleClose} className="text-neutral-500 hover:text-emerald-600 transition-colors p-2 rounded-full">
              <FaTimes size={24} />
            </button>
          </header>

          {/* Content */}
          <div className="flex-grow flex flex-col lg:flex-row overflow-hidden">
            <div className="w-full h-full flex flex-col lg:flex-row">
              {/* Left Side: Image and Rating */}
              <div className="lg:w-1/2 flex flex-col bg-neutral-100">
                <div className="relative flex-grow">
                  <img
                    src={recipe.image}
                    alt={recipe.name}
                    className="absolute inset-0 w-full h-full object-contain max-h-[50vh] lg:max-h-[70vh] max-w-full"
                  />
                  <button
                    onClick={() => setShowImagePopup(true)}
                    className="sm:hidden absolute bottom-4 right-4 bg-emerald-600 text-white rounded-lg px-4 py-2 flex items-center gap-2 font-semibold hover:bg-emerald-700 transition"
                  >
                    <FaImage /> View Image
                  </button>
                </div>
                {!hideCommentsAndRating && (
                  <div className="flex-shrink-0 p-4 border-t border-neutral-200 bg-white">
                    <h3 className="font-semibold text-neutral-700 mb-2">Rate this recipe</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            disabled={isRating || ratingSuccess}
                            onClick={() => handleRateSubmit(star)}
                            onMouseEnter={() => setHoverRating(star)}
                            className="transition-transform duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <FaStar size={28} className={
                              (hoverRating || rating) >= star ? 'text-yellow-400' : 'text-neutral-300'
                            }/>
                          </button>
                        ))}
                      </div>
                      {isRating && <Oval height={24} width={24} color="#10B981" strokeWidth={4} secondaryColor="#a7f3d0"/>}
                      {ratingSuccess && <motion.div initial={{scale:0}} animate={{scale:1}} className="flex items-center gap-2 text-emerald-600 font-semibold"><FaCheck /> Rated!</motion.div>}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Side: Details and Comments */}
              <div ref={detailsRef} className="lg:w-1/2 p-6 overflow-y-auto custom-scrollbar flex flex-col">
                <div className="space-y-6 flex-grow">
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">Ingredients</h3>
                    <ul className="list-disc list-inside text-neutral-600 space-y-1.5 marker:text-emerald-500">
                      {recipe.ingredients?.split(",").map((ing, idx) => <li key={idx}>{ing.trim()}</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">Instructions</h3>
                    <div className="prose prose-sm text-neutral-600 whitespace-pre-line">{recipe.instructions}</div>
                  </div>
                </div>

                {/* Comments Section */}
                {!hideCommentsAndRating && (
                  <div className="flex-shrink-0 mt-8 pt-6 border-t border-neutral-200">
                    <h3 className="text-xl font-bold text-neutral-800 mb-4">Comments ({post.comments?.length || 0})</h3>
                    <div className="space-y-4 max-h-48 overflow-y-auto pr-2 mb-4">
                      {post.comments?.length > 0 ? post.comments.map(c => (
                        <div key={c.id} className="flex items-start gap-3">
                          <Avatar name={c.user} size="36" round={true} className="flex-shrink-0" />
                          <div className="flex-1 bg-neutral-100 p-3 rounded-lg">
                            <p className="text-sm font-semibold text-neutral-800">{c.user}</p>
                            <p className="text-sm text-neutral-600">{c.text}</p>
                          </div>
                        </div>
                      )) : <p className="text-neutral-500 text-sm">No comments yet. Be the first!</p>}
                    </div>
                    <form onSubmit={handleCommentSubmit} className="flex flex-col gap-2">
                      <textarea
                        value={commentText || ''} // Fallback to empty string if undefined
                        onChange={(e) => setCommentText && setCommentText(e.target.value)}
                        placeholder="Add a public comment..."
                        rows="3"
                        className="w-full p-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
                      />
                      <button type="submit" disabled={isCommenting} className="self-end px-6 py-2 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition disabled:bg-emerald-300">
                        {isCommenting ? 'Posting...' : 'Post Comment'}
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Image Popup for Small Devices */}
      <AnimatePresence>
        {showImagePopup && (
          <motion.div
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowImagePopup(false)}
          >
            <motion.div
              className="relative bg-white rounded-lg p-4 max-w-[90vw] max-h-[90vh]"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowImagePopup(false)}
                className="absolute top-2 right-2 text-neutral-500 hover:text-emerald-600 transition-colors p-2 rounded-full"
              >
                <FaTimes size={24} />
              </button>
              <img
                src={recipe.image}
                alt={recipe.name}
                className="w-full h-auto max-h-[80vh] max-w-[80vw] object-contain"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default PostDetails;