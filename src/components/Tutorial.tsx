import React from 'react';
import { BookOpen, CheckSquare, Download, ChevronRight } from 'lucide-react';

interface TutorialProps {
  onClose: () => void;
}

const Tutorial: React.FC<TutorialProps> = ({ onClose }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-3xl mx-auto mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">How FlashLearn Works</h2>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
          aria-label="Close tutorial"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-6">
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
            <span className="font-bold">1</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <BookOpen className="w-5 h-5 mr-2 text-indigo-600" />
              Start Learning
            </h3>
            <p className="mt-1 text-gray-600">
              Begin by uploading your CSV file with questions and answers. Then use Learn mode to review flashcards by flipping them to see answers.
            </p>
            <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200">
              <p className="text-sm font-medium text-gray-700">Example Question:</p>
              <p className="text-sm text-gray-600 mt-1">A company wants to use a large language model (LLM) to develop a conversational agent. The company needs to prevent the LLM from being manipulated with common prompt engineering techniques to perform undesirable actions or expose sensitive information. Which action will reduce these risks?</p>
            </div>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
            <span className="font-bold">2</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-indigo-600" />
              Test Yourself
            </h3>
            <p className="mt-1 text-gray-600">
              Switch to Test mode to challenge yourself with multiple-choice questions. Select your answer and get immediate feedback.
            </p>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <div className="p-2 rounded-md border border-indigo-200 bg-indigo-50 text-sm">
                Create a prompt template that teaches the LLM to detect attack patterns
              </div>
              <div className="p-2 rounded-md border border-gray-200 text-sm">
                Increase the temperature parameter on invocation requests to the LLM
              </div>
              <div className="p-2 rounded-md border border-gray-200 text-sm">
                Avoid using LLMs that are not listed in Amazon SageMaker
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex">
          <div className="flex-shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
            <span className="font-bold">3</span>
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Download className="w-5 h-5 mr-2 text-indigo-600" />
              Focus on Improvement
            </h3>
            <p className="mt-1 text-gray-600">
              After completing the test, review your results in the summary. Download a CSV file containing only the questions you answered incorrectly to focus your future study.
            </p>
            <div className="mt-2 p-3 bg-red-50 rounded-md border border-red-200">
              <div className="flex justify-between items-start">
                <p className="text-sm font-medium text-red-700">Incorrect Answer:</p>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">Incorrect</span>
              </div>
              <p className="text-sm text-gray-600 mt-1">Your answer: Increase the temperature parameter on invocation requests to the LLM</p>
              <p className="text-sm text-gray-600 mt-1">Correct answer: Create a prompt template that teaches the LLM to detect attack patterns</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 pt-4 border-t border-gray-200">
        <button
          onClick={onClose}
          className="w-full flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Get Started <ChevronRight className="w-4 h-4 ml-2" />
        </button>
      </div>
    </div>
  );
};

export default Tutorial;
