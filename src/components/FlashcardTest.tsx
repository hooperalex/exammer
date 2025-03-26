import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, RotateCcw, FileText } from 'lucide-react';
import { Flashcard } from '../types';
import ExamSummary from './ExamSummary';

interface FlashcardTestProps {
  cards: Flashcard[];
}

const FlashcardTest: React.FC<FlashcardTestProps> = ({ cards }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);
  const [answered, setAnswered] = useState<Set<number>>(new Set());
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);

  const currentCard = cards[currentIndex];

  useEffect(() => {
    if (currentCard) {
      // Ensure we have at least 4 options if possible
      let options = [...(currentCard.options || [currentCard.answer])];
      
      // If we don't have enough options, add some from other cards
      if (options.length < 4) {
        const additionalOptions = cards
          .filter(card => card.id !== currentCard.id)
          .map(card => card.answer)
          .slice(0, 4 - options.length);
        
        options = [...options, ...additionalOptions];
      }
      
      // Make sure the correct answer is included
      if (!options.includes(currentCard.answer)) {
        options.push(currentCard.answer);
      }
      
      // Shuffle options
      setShuffledOptions(shuffleArray(options));
    }
  }, [currentIndex, cards]);

  const shuffleArray = (array: string[]): string[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null) return; // Already answered
    
    setSelectedOption(option);
    const correct = option === currentCard.answer;
    setIsCorrect(correct);
    
    if (correct) {
      setScore(score + 1);
    }
    
    const newAnswered = new Set(answered);
    newAnswered.add(currentIndex);
    setAnswered(newAnswered);
    
    // Store user's answer
    setUserAnswers(prev => ({
      ...prev,
      [currentCard.id]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsCorrect(null);
    } else {
      // End of exam, show summary
      setShowSummary(true);
    }
  };

  const resetQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsCorrect(null);
    setScore(0);
    setAnswered(new Set());
    setUserAnswers({});
    setShowSummary(false);
  };

  const progress = Math.round((answered.size / cards.length) * 100);
  const isLastQuestion = currentIndex === cards.length - 1;

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Test Mode</h2>
        <div className="text-sm text-gray-600">
          Question {currentIndex + 1} of {cards.length}
        </div>
      </div>

      <div className="mb-2 w-full bg-gray-200 rounded-full h-2.5">
        <div 
          className="bg-green-600 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 mb-6">
        <div className="text-base sm:text-xl font-medium text-gray-800 mb-4 overflow-auto max-h-[30vh]">
          {currentCard.question}
        </div>
        
        <div className="space-y-3">
          {shuffledOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => handleOptionSelect(option)}
              disabled={selectedOption !== null}
              className={`w-full text-left p-3 rounded-lg transition-colors ${
                selectedOption === option
                  ? option === currentCard.answer
                    ? 'bg-green-100 border border-green-500'
                    : 'bg-red-100 border border-red-500'
                  : selectedOption !== null && option === currentCard.answer
                  ? 'bg-green-100 border border-green-500'
                  : 'bg-gray-100 hover:bg-gray-200 border border-transparent'
              }`}
            >
              <div className="flex items-center">
                <span className="mr-2">{String.fromCharCode(65 + index)}.</span>
                <span className="flex-1 text-sm sm:text-base">{option}</span>
                {selectedOption === option && option === currentCard.answer && (
                  <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                )}
                {selectedOption === option && option !== currentCard.answer && (
                  <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                )}
              </div>
            </button>
          ))}
        </div>

        {selectedOption && (
          <div className="mt-4">
            {isCorrect ? (
              <div className="p-3 rounded-md bg-green-50 text-green-800">
                <div className="flex items-center mb-2">
                  <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="font-medium">Correct! Well done.</span>
                </div>
                {currentCard.correctReasoning && (
                  <p className="text-sm">{currentCard.correctReasoning}</p>
                )}
              </div>
            ) : (
              <div className="p-3 rounded-md bg-red-50 text-red-800">
                <div className="flex items-center mb-2">
                  <XCircle className="w-5 h-5 mr-2 flex-shrink-0" />
                  <span className="font-medium text-sm sm:text-base">Incorrect. The correct answer is: {currentCard.answer}</span>
                </div>
                {currentCard.incorrectReasoning && (
                  <p className="text-sm">{currentCard.incorrectReasoning}</p>
                )}
                {currentCard.correctReasoning && (
                  <div className="mt-2 pt-2 border-t border-red-200">
                    <p className="text-sm font-medium">Why the correct answer works:</p>
                    <p className="text-sm">{currentCard.correctReasoning}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div className="text-base sm:text-lg font-medium">
          Score: {score}/{answered.size} ({answered.size > 0 ? Math.round((score / answered.size) * 100) : 0}%)
        </div>

        <div className="flex flex-wrap gap-2 justify-end">
          <button
            onClick={resetQuiz}
            className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
          >
            <RotateCcw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            Reset
          </button>

          {answered.size > 0 && (
            <button
              onClick={() => setShowSummary(true)}
              className="flex items-center px-3 py-1.5 sm:px-4 sm:py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
            >
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
              View Summary
            </button>
          )}

          {selectedOption && (
            <button
              onClick={handleNextQuestion}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-sm ${
                isLastQuestion
                  ? 'bg-green-600 text-white hover:bg-green-700'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isLastQuestion ? 'Finish Exam' : 'Next Question'}
            </button>
          )}
        </div>
      </div>

      {showSummary && (
        <ExamSummary 
          cards={cards} 
          userAnswers={userAnswers} 
          onClose={() => setShowSummary(false)} 
        />
      )}
    </div>
  );
};

export default FlashcardTest;
