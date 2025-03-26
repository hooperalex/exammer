import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Flashcard } from '../types';

interface FlashcardLearnProps {
  cards: Flashcard[];
}

const FlashcardLearn: React.FC<FlashcardLearnProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [completed, setCompleted] = useState<Set<string>>(new Set());

  const currentCard = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (!isFlipped) {
      // Mark as completed when flipped to answer
      const newCompleted = new Set(completed);
      newCompleted.add(currentCard.id);
      setCompleted(newCompleted);
    }
  };

  const progress = Math.round((completed.size / cards.length) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Learn Mode</h2>
        <div className="text-sm text-gray-600">
          Card {currentIndex + 1} of {cards.length}
        </div>
      </div>

      <div className="mb-2 w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="relative w-full h-[400px] mb-6">
        {/* Front of card (Question) */}
        <div 
          onClick={handleFlip}
          className={`absolute inset-0 w-full h-full rounded-xl shadow-lg p-4 sm:p-6 bg-white cursor-pointer transition-all duration-500 ${
            isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          <div className="flex flex-col h-full">
            <h3 className="text-lg sm:text-xl font-medium text-gray-800 mb-2 text-center">Question</h3>
            <div className="flex-1 overflow-y-auto text-center">
              <p className="text-gray-700 text-base sm:text-lg px-2">
                {currentCard.question}
              </p>
            </div>
            <div className="mt-4 text-sm text-gray-500 text-center">Click to reveal answer</div>
          </div>
        </div>

        {/* Back of card (Answer) */}
        <div 
          onClick={handleFlip}
          className={`absolute inset-0 w-full h-full rounded-xl shadow-lg p-4 sm:p-6 bg-indigo-50 cursor-pointer transition-all duration-500 ${
            isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        >
          <div className="flex flex-col h-full">
            <h3 className="text-lg sm:text-xl font-medium text-indigo-700 mb-2 text-center">Answer</h3>
            <div className="flex-1 overflow-y-auto text-center">
              <p className="text-gray-800 text-base sm:text-lg px-2">
                {currentCard.answer}
              </p>
            </div>
            
            {currentCard.correctReasoning && (
              <div className="mt-4 p-3 bg-green-50 rounded-lg text-left">
                <h4 className="font-medium text-green-800 mb-1">Why this is correct:</h4>
                <p className="text-green-700 text-sm">{currentCard.correctReasoning}</p>
              </div>
            )}
            
            <div className="mt-4 text-sm text-gray-500 text-center">Click to see question</div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={`flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
            currentIndex === 0
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
          Previous
        </button>

        <button
          onClick={() => {
            setIsFlipped(false);
            setCurrentIndex(0);
          }}
          className="flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm sm:text-base"
        >
          <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
          Reset
        </button>

        <button
          onClick={handleNext}
          disabled={currentIndex === cards.length - 1}
          className={`flex items-center px-3 py-2 sm:px-4 sm:py-2 rounded-md text-sm sm:text-base ${
            currentIndex === cards.length - 1
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 ml-1" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardLearn;
