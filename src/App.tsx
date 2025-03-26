import React, { useState, useCallback } from 'react';
import { BookOpen, CheckSquare, BrainCircuit, Upload, HelpCircle } from 'lucide-react';
import CSVUploader from './components/CSVUploader';
import FlashcardLearn from './components/FlashcardLearn';
import FlashcardTest from './components/FlashcardTest';
import Tutorial from './components/Tutorial';
import { Flashcard, Mode } from './types';

function App() {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [mode, setMode] = useState<Mode | null>(null);
  const [showTutorial, setShowTutorial] = useState(false);

  const handleCardsLoaded = (loadedCards: Flashcard[]) => {
    console.log("Cards loaded in App:", loadedCards);
    setCards(loadedCards);
    // Default to learn mode when cards are loaded
    setMode('learn');
  };

  const resetApp = useCallback(() => {
    console.log("Resetting app...");
    setCards([]);
    setMode(null);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <button 
              className="flex items-center focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-md p-1" 
              onClick={resetApp}
              aria-label="Reset application"
            >
              <BrainCircuit className="h-8 w-8 text-indigo-600" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">FlashLearn</h1>
            </button>
            
            {cards.length > 0 && (
              <div className="flex space-x-2">
                <button
                  onClick={() => setMode('learn')}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    mode === 'learn'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Learn
                </button>
                <button
                  onClick={() => setMode('test')}
                  className={`px-4 py-2 rounded-md flex items-center ${
                    mode === 'test'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Test
                </button>
                <button
                  onClick={resetApp}
                  className="px-4 py-2 rounded-md flex items-center bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                  aria-label="Start over with new CSV"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  New CSV
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {cards.length === 0 ? (
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to FlashLearn</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
              Upload a CSV file with your questions and answers to get started. 
              The CSV should have at least two columns: question and answer.
            </p>
            
            {showTutorial ? (
              <Tutorial onClose={() => setShowTutorial(false)} />
            ) : (
              <div className="mb-6">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="inline-flex items-center px-4 py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
                >
                  <HelpCircle className="w-4 h-4 mr-2" />
                  How it works
                </button>
              </div>
            )}
            
            <div className="bg-white rounded-xl shadow-lg p-8 max-w-2xl mx-auto">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Get Started</h3>
              <CSVUploader onCardsLoaded={handleCardsLoaded} />
            </div>
            
            <div className="mt-8 max-w-2xl mx-auto">
              <h3 className="text-lg font-medium text-gray-800 mb-2">CSV Format Example:</h3>
              <div className="bg-gray-800 text-gray-200 p-4 rounded-md text-sm font-mono overflow-x-auto">
                <pre>question,answer,option1,option2,option3
What is the capital of France?,Paris,London,Berlin,Madrid
What is 2+2?,4,3,5,6</pre>
              </div>
              <p className="mt-2 text-sm text-gray-600">
                The options columns are optional and only used in Test mode.
              </p>
            </div>
          </div>
        ) : (
          <div>
            {mode === 'learn' && <FlashcardLearn cards={cards} />}
            {mode === 'test' && <FlashcardTest cards={cards} />}
          </div>
        )}
      </main>

      <footer className="bg-white mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-500 text-sm">
            FlashLearn - A simple and effective way to learn and test your knowledge.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;
