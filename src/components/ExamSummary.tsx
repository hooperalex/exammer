import React from 'react';
import { Download } from 'lucide-react';
import { Flashcard } from '../types';

interface ExamSummaryProps {
  cards: Flashcard[];
  userAnswers: Record<string, string>;
  onClose: () => void;
}

const ExamSummary: React.FC<ExamSummaryProps> = ({ cards, userAnswers, onClose }) => {
  const exportToCSV = () => {
    // Create CSV content
    const headers = ['question', 'answer', 'incorrect_answers', 'correct_reasoning', 'incorrect_reasoning'];
    
    // Filter to include only wrong questions
    const wrongQuestions = cards.filter(card => {
      const userAnswer = userAnswers[card.id] || '';
      return userAnswer !== card.answer;
    });
    
    const rows = wrongQuestions.map(card => {
      // Get incorrect answers (all options except the correct one)
      const incorrectOptions = (card.options || [])
        .filter(opt => opt !== card.answer)
        .join(';');
      
      // Properly escape CSV values
      const escapeCsvValue = (value: string) => {
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      };
      
      return [
        escapeCsvValue(card.question),
        escapeCsvValue(card.answer),
        escapeCsvValue(incorrectOptions),
        escapeCsvValue(card.correctReasoning || ''),
        escapeCsvValue(card.incorrectReasoning || '')
      ].join(',');
    });
    
    const csvContent = [headers.join(','), ...rows].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'wrong_questions.csv');
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Calculate score
  const answeredQuestions = Object.keys(userAnswers).length;
  const correctAnswers = cards.filter(card => userAnswers[card.id] === card.answer).length;
  const score = answeredQuestions > 0 ? Math.round((correctAnswers / answeredQuestions) * 100) : 0;

  // Count wrong questions
  const wrongQuestionsCount = answeredQuestions - correctAnswers;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-800">Exam Summary</h2>
            <div className="text-xl font-semibold text-indigo-600">
              Score: {correctAnswers}/{answeredQuestions} ({score}%)
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto p-6 flex-grow">
          {cards.map((card, index) => {
            const userAnswer = userAnswers[card.id] || 'Not answered';
            const isCorrect = userAnswer === card.answer;
            
            return (
              <div 
                key={card.id} 
                className={`mb-6 p-4 rounded-lg border ${
                  isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-medium">
                    {index + 1}. {card.question}
                  </h3>
                  <span className={`px-2 py-1 rounded text-sm font-medium ${
                    isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {isCorrect ? 'Correct' : 'Incorrect'}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Your answer:</p>
                    <p className={`text-sm font-medium ${
                      isCorrect ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {userAnswer}
                    </p>
                  </div>
                  
                  {!isCorrect && (
                    <div>
                      <p className="text-sm text-gray-500 mb-1">Correct answer:</p>
                      <p className="text-sm font-medium text-green-700">{card.answer}</p>
                    </div>
                  )}
                </div>
                
                {(isCorrect && card.correctReasoning) || (!isCorrect && card.incorrectReasoning) ? (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-1">Reasoning:</p>
                    <p className="text-sm">
                      {isCorrect ? card.correctReasoning : card.incorrectReasoning || card.correctReasoning}
                    </p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
        
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
          
          <button
            onClick={exportToCSV}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 flex items-center"
            disabled={wrongQuestionsCount === 0}
            title={wrongQuestionsCount === 0 ? "No wrong questions to export" : ""}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Wrong Questions ({wrongQuestionsCount})
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamSummary;
