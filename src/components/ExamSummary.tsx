import React, { useState } from 'react';
import { X, Download, CheckCircle, XCircle } from 'lucide-react';
import { Flashcard } from '../types';

interface ExamSummaryProps {
  cards: Flashcard[];
  userAnswers: Record<string, string[]>;
  onClose: () => void;
}

const ExamSummary: React.FC<ExamSummaryProps> = ({ cards, userAnswers, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');

  // Get array of correct answers for a card
  const getCorrectAnswers = (card: Flashcard) => {
    return card.answer.split(';').map(ans => ans.trim());
  };

  // Check if user's answer for a card is correct
  const isAnswerCorrect = (card: Flashcard) => {
    const userAns = userAnswers[card.id] || [];
    const correctAns = getCorrectAnswers(card);
    
    if (correctAns.length > 1) {
      // For multiple correct answers, check if all selected options are correct
      // and if all correct answers are selected
      const allSelectedAreCorrect = userAns.every(opt => correctAns.includes(opt));
      const allCorrectAreSelected = correctAns.every(ans => userAns.includes(ans));
      return allSelectedAreCorrect && allCorrectAreSelected;
    } else {
      // For single answer
      return correctAns.includes(userAns[0]);
    }
  };

  const answeredCards = cards.filter(card => userAnswers[card.id]);
  const correctCards = answeredCards.filter(card => isAnswerCorrect(card));
  const incorrectCards = answeredCards.filter(card => !isAnswerCorrect(card));

  const filteredCards = filter === 'all' 
    ? answeredCards 
    : filter === 'correct' 
      ? correctCards 
      : incorrectCards;

  const score = correctCards.length;
  const total = answeredCards.length;
  const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

  const exportWrongAnswers = () => {
    // Create CSV content
    let csvContent = "question,answer,incorrect_answers,correct_reasoning,incorrect_reasoning\n";
    
    incorrectCards.forEach(card => {
      // Format the card data for CSV
      const question = card.question.replace(/"/g, '""'); // Escape quotes
      const answer = card.answer.replace(/"/g, '""');
      const incorrectAnswers = (card.options || [])
        .filter(opt => !getCorrectAnswers(card).includes(opt))
        .map(opt => opt.replace(/"/g, '""'))
        .join(';');
      const correctReasoning = card.correctReasoning ? card.correctReasoning.replace(/"/g, '""') : '';
      const incorrectReasoning = card.incorrectReasoning ? card.incorrectReasoning.replace(/"/g, '""') : '';
      
      // Add row to CSV
      csvContent += `"${question}","${answer}","${incorrectAnswers}","${correctReasoning}","${incorrectReasoning}"\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'wrong_answers.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Exam Summary</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-2xl font-bold">{percentage}%</div>
              <div className="text-sm text-gray-500">Score: {score}/{total} correct</div>
            </div>
            
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                All ({answeredCards.length})
              </button>
              <button 
                onClick={() => setFilter('correct')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'correct' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Correct ({correctCards.length})
              </button>
              <button 
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1 rounded-md text-sm ${
                  filter === 'incorrect' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                Incorrect ({incorrectCards.length})
              </button>
            </div>
            
            {incorrectCards.length > 0 && (
              <button 
                onClick={exportWrongAnswers}
                className="flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 text-sm"
              >
                <Download className="w-4 h-4 mr-1" />
                Export Wrong
              </button>
            )}
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          {filteredCards.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No questions to display
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCards.map((card, index) => {
                const isCorrect = isAnswerCorrect(card);
                const userAns = userAnswers[card.id] || [];
                const correctAns = getCorrectAnswers(card);
                
                return (
                  <div key={card.id} className="border rounded-lg overflow-hidden">
                    <div className={`p-3 flex items-start gap-3 ${
                      isCorrect ? 'bg-green-50' : 'bg-red-50'
                    }`}>
                      <div className="flex-shrink-0 mt-1">
                        {isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <XCircle className="w-5 h-5 text-red-600" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium mb-1">
                          {index + 1}. {card.question}
                        </div>
                        <div className="text-sm">
                          <span className="font-medium">Your answer: </span>
                          {userAns.length > 0 ? userAns.join(', ') : 'No answer'}
                        </div>
                        {!isCorrect && (
                          <div className="text-sm mt-1">
                            <span className="font-medium">Correct answer: </span>
                            {correctAns.join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {(card.correctReasoning || card.incorrectReasoning) && (
                      <div className="p-3 bg-white text-sm border-t">
                        {isCorrect && card.correctReasoning && (
                          <div>
                            <span className="font-medium">Why it's correct: </span>
                            {card.correctReasoning}
                          </div>
                        )}
                        {!isCorrect && (
                          <>
                            {card.incorrectReasoning && (
                              <div className="mb-2">
                                <span className="font-medium">Why it's incorrect: </span>
                                {card.incorrectReasoning}
                              </div>
                            )}
                            {card.correctReasoning && (
                              <div>
                                <span className="font-medium">Correct explanation: </span>
                                {card.correctReasoning}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExamSummary;
