import React, { useState } from 'react';
import { updateUserRating } from '../services/api';

interface RatingProps {
  userId: string;
  currentRating: number;
  onRatingSubmitted: () => void;
}

const Rating: React.FC<RatingProps> = ({ userId, currentRating, onRatingSubmitted }) => {
  const [hover, setHover] = useState(0);
  const [rating, setRating] = useState(currentRating);

  const handleRating = async (rate: number) => {
    try {
      await updateUserRating(userId, rate);
      setRating(rate);
      onRatingSubmitted();
    } catch (error) {
      console.error("Error submitting rating: ", error);
    }
  };

  return (
    <div className="flex items-center">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            key={starValue}
            onClick={() => handleRating(starValue)}
            onMouseEnter={() => setHover(starValue)}
            onMouseLeave={() => setHover(0)}
            className="focus:outline-none"
          >
            <svg
              className={`w-5 h-5 ${starValue <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
            </svg>
          </button>
        );
      })}
    </div>
  );
};

export default Rating;
