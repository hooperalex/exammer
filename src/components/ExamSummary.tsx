import React, { useState } from 'react';
import { CheckCircle, XCircle, Download, X } from 'lucide-react';
import { Flashcard } from '../types';

interface ExamSummaryProps {
  cards: Flashcard[];
  userAnswers: Record<string, string>;
  onClose: () => void;
}

const ExamSummary: React.FC<ExamSummaryProps> = ({ cards, userAnswers, onClose }) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect'>('all');
  
  const results = cards.map(card => ({
    ...card,
    userAnswer: userAnswers[card.id] || '',
    isCorrect: userAnswers[card.id] === card.answer
  }));
  
  const filteredResults = filter === 'all' 
    ? results 
    : filter === 'correct' 
      ? results.filter(r => r.isCorrect) 
      : results.filter(r => !r.isCorrect);
  
  const correctCount = results.filter(r => r.isCorrect).length;
  const score = Math.round((correctCount / results.length) * 100);
  
  const downloadWrongQuestions = () => {
    const wrongQuestions = results.filter(r => !r.isCorrect);
    
    if (wrongQuestions.length === 0) {
      alert('No incorrect answers to download!');
      return;
    }
    
    // Create CSV content
    const headers = ['question', 'answer', 'your_answer'];
    const csvContent = [
      headers.join(','),
      ...wrongQuestions.map(q => 
        [
          `"${q.question.replace(/"/g, '""')}"`, 
          `"${q.answer.replace(/"/g, '""')}"`,
          `"${q.userAnswer.replace(/"/g, '""')}"`
        ].join(',')
      )
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'incorrect_questions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 sm:p-6 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Exam Summary</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close summary"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-4 sm:p-6 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-lg font-medium text-gray-800">Your Score</h3>
              <div className="text-3xl font-bold text-indigo-600">{score}%</div>
              <p className="text-sm text-gray-600">
                {correctCount} correct out of {results.length} questions
              </p>
            </div>
            
            <div className="flex flex-col gap-2">
              <button
                onClick={downloadWrongQuestions}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm"
                disabled={results.filter(r => !r.isCorrect).length === 0}
              >
                <Download className="w-4 h-4 mr-2" />
                Download Incorrect Questions
              </button>
              
              <div className="flex rounded-md shadow-sm">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 text-xs sm:text-sm rounded-l-md border ${
                    filter === 'all'
                      ? 'bg-indigo-100 border-indigo-300 text-indigo-800'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('correct')}
                  className={`px-3 py-1 text-xs sm:text-sm border-t border-b ${
                    filter === 'correct'
                      ? 'bg-green-100 border-green-300 text-green-800'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  Correct
                </button>
                <button
                  onClick={() => setFilter('incorrect')}
                  className={`px-3 py-1 text-xs sm:text-sm rounded-r-md border ${
                    filter === 'incorrect'
                      ? 'bg-red-100 border-red-300 text-red-800'
                      : 'bg-white border-gray-300 text-gray-700'
                  }`}
                >
                  Incorrect
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1 p-4">
          {filteredResults.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No results to display with the current filter.</p>
          ) : (
            <div className="space-y-4">
              {filteredResults.map((result, index) => (
                <div 
                  key={result.id} 
                  className={`p-4 rounded-lg border ${
                    result.isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
                    {result.isCorrect ? (
                      <span className="flex items-center text-green-700 text-sm font-medium">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Correct
                      </span>
                    ) : (
                      <span className="flex items-center text-red-700 text-sm font-medium">
                        <XCircle className="w-4 h-4 mr-1" />
                        Incorrect
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm sm:text-base font-medium text-gray-800 mb-3">{result.question}</p>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <span className="font-medium text-gray-700 w-24 flex-shrink-0">Your answer:</span>
                      <span className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {result.userAnswer}
                      </span>
                    </div>
                    
                    {!result.isCorrect && (
                      <div className="flex items-start">
                        <span className="font-medium text-gray-700 w-24 flex-shrink-0">Correct answer:</span>
                        <span className="text-green-700">{result.answer}</span>
                      </div>
                    )}
                    
                    {result.correctReasoning && (
                      <div className="flex items-start mt-2 pt-2 border-t border-gray-200">
                        <span className="font-medium text-gray-700 w-24 flex-shrink-0">Explanation:</span>
                        <span className="text-gray-600">{result.correctReasoning}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamSummary;
