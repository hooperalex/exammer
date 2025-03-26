import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Flashcard } from '../types';

interface CSVUploaderProps {
  onCardsLoaded: (cards: Flashcard[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onCardsLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processCSV = (text: string) => {
    try {
      // Split by newlines and filter out empty lines
      const lines = text.split('\n').filter(line => line.trim() !== '');
      
      if (lines.length === 0) {
        throw new Error('CSV file is empty');
      }
      
      console.log("CSV content:", text);
      console.log("Lines detected:", lines);
      
      // Check if we have a header row
      const firstLine = lines[0].toLowerCase();
      const hasHeader = firstLine.includes('question') && firstLine.includes('answer');
      
      const startIndex = hasHeader ? 1 : 0;
      
      const cards: Flashcard[] = [];
      
      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        // Handle quoted CSV values properly
        let values: string[] = [];
        let currentValue = '';
        let inQuotes = false;
        
        for (let j = 0; j < line.length; j++) {
          const char = line[j];
          
          if (char === '"' && (j === 0 || line[j-1] !== '\\')) {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
          } else {
            currentValue += char;
          }
        }
        
        // Add the last value
        values.push(currentValue.trim());
        
        // Remove quotes from values
        values = values.map(val => {
          if (val.startsWith('"') && val.endsWith('"')) {
            return val.substring(1, val.length - 1);
          }
          return val;
        });
        
        console.log(`Line ${i} values:`, values);
        
        if (values.length < 2) {
          console.warn(`Line ${i + 1} doesn't have enough values:`, values);
          continue;
        }
        
        const question = values[0];
        const answer = values[1];
        
        // Handle the new format with incorrect answers and reasoning
        let options: string[] = [];
        let correctReasoning: string | undefined;
        let incorrectReasoning: string | undefined;
        
        // Check if we have incorrect answers (column 3)
        if (values.length > 2 && values[2].trim()) {
          // Split by semicolon if multiple incorrect answers are provided
          options = [answer, ...values[2].split(';').map(opt => opt.trim())];
        } else {
          options = [answer];
        }
        
        // Check if we have reasoning for correct answer (column 4)
        if (values.length > 3 && values[3].trim()) {
          correctReasoning = values[3];
        }
        
        // Check if we have reasoning for incorrect answers (column 5)
        if (values.length > 4 && values[4].trim()) {
          incorrectReasoning = values[4];
        }
        
        cards.push({
          id: `card-${i}`,
          question,
          answer,
          options,
          correctReasoning,
          incorrectReasoning
        });
      }
      
      console.log("Parsed cards:", cards);
      
      if (cards.length === 0) {
        throw new Error('No valid flashcards found in the CSV');
      }
      
      onCardsLoaded(cards);
      setError(null);
    } catch (err) {
      console.error("CSV parsing error:", err);
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processCSV(event.target.result as string);
        }
      };
      reader.readAsText(file);
    } else {
      setError('Please upload a CSV file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          processCSV(event.target.result as string);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleSampleClick = () => {
    fetch('/sample.csv')
      .then(response => response.text())
      .then(text => processCSV(text))
      .catch(err => {
        console.error("Error loading sample CSV:", err);
        setError('Failed to load sample CSV');
      });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-700">Upload CSV File</h3>
        <p className="mt-1 text-sm text-gray-500">
          Drag and drop your CSV file here, or click to browse
        </p>
        <p className="mt-2 text-xs text-gray-400">
          Format: question,answer,incorrect_answers,correct_reasoning,incorrect_reasoning
        </p>
        <input
          id="file-upload"
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
      
      <button
        onClick={handleSampleClick}
        className="mt-4 w-full py-2 bg-indigo-100 text-indigo-700 rounded-md hover:bg-indigo-200 transition-colors"
      >
        Try Sample CSV
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
