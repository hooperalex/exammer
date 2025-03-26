import React, { useState } from 'react';
import { Upload } from 'lucide-react';
import { Flashcard } from '../types';

interface CSVUploaderProps {
  onCardsLoaded: (cards: Flashcard[]) => void;
}

const CSVUploader: React.FC<CSVUploaderProps> = ({ onCardsLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processCSV = (text: string) => {
    try {
      setIsProcessing(true);
      setError(null);
      
      // Parse CSV properly handling quoted fields with newlines
      const cards = parseCSVWithQuotedNewlines(text);
      
      if (cards.length === 0) {
        throw new Error('No valid flashcards found in the CSV');
      }
      
      onCardsLoaded(cards);
      setError(null);
    } catch (err) {
      console.error("CSV parsing error:", err);
      setError(err instanceof Error ? err.message : 'Failed to process CSV file');
    } finally {
      setIsProcessing(false);
    }
  };

  // Advanced CSV parser that properly handles quoted fields with newlines
  const parseCSVWithQuotedNewlines = (text: string): Flashcard[] => {
    const cards: Flashcard[] = [];
    
    // Normalize line endings
    const normalizedText = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Split into lines, but we'll handle quoted fields separately
    const lines = normalizedText.split('\n');
    
    // Check if we have a header row
    const firstLine = lines[0].toLowerCase();
    const hasHeader = firstLine.includes('question') && firstLine.includes('answer');
    
    const startIndex = hasHeader ? 1 : 0;
    
    // Process lines, accounting for quoted fields that may contain newlines
    let currentRow: string[] = [];
    let inQuotedField = false;
    let currentField = '';
    let lineIndex = startIndex;
    
    while (lineIndex < lines.length) {
      const line = lines[lineIndex];
      
      // Skip empty lines outside of quoted fields
      if (!inQuotedField && line.trim() === '') {
        lineIndex++;
        continue;
      }
      
      // Process each character in the line
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        const nextChar = i < line.length - 1 ? line[i + 1] : '';
        
        // Handle quotes
        if (char === '"') {
          // Check if this is an escaped quote (i.e., "")
          if (nextChar === '"') {
            currentField += '"';
            i++; // Skip the next quote
          } else {
            // Toggle quoted field state
            inQuotedField = !inQuotedField;
          }
        } 
        // Handle commas
        else if (char === ',' && !inQuotedField) {
          currentRow.push(currentField.trim());
          currentField = '';
        } 
        // Add character to current field
        else {
          currentField += char;
        }
      }
      
      // If we're not in a quoted field, this line is complete
      if (!inQuotedField) {
        // Add the last field of the line
        currentRow.push(currentField.trim());
        currentField = '';
        
        // Process the completed row if it has enough fields
        if (currentRow.length >= 2) {
          const question = currentRow[0];
          const answer = currentRow[1];
          
          // Handle the new format with incorrect answers and reasoning
          let options: string[] = [];
          let correctReasoning: string | undefined;
          let incorrectReasoning: string | undefined;
          
          // Check if we have incorrect answers (column 3)
          if (currentRow.length > 2 && currentRow[2].trim()) {
            // Split by semicolon if multiple incorrect answers are provided
            options = [answer, ...currentRow[2].split(';').map(opt => opt.trim())];
          } else {
            options = [answer];
          }
          
          // Check if we have reasoning for correct answer (column 4)
          if (currentRow.length > 3 && currentRow[3].trim()) {
            correctReasoning = currentRow[3];
          }
          
          // Check if we have reasoning for incorrect answers (column 5)
          if (currentRow.length > 4 && currentRow[4].trim()) {
            incorrectReasoning = currentRow[4];
          }
          
          cards.push({
            id: `card-${cards.length}`,
            question,
            answer,
            options,
            correctReasoning,
            incorrectReasoning
          });
        }
        
        // Reset for next row
        currentRow = [];
      } 
      // If we're in a quoted field, add a newline character
      else {
        currentField += '\n';
      }
      
      lineIndex++;
    }
    
    // Handle any remaining data (should only happen if the file ends with a quoted field)
    if (currentRow.length > 0 || currentField.length > 0) {
      if (currentField.length > 0) {
        currentRow.push(currentField.trim());
      }
      
      if (currentRow.length >= 2) {
        const question = currentRow[0];
        const answer = currentRow[1];
        
        let options: string[] = [];
        let correctReasoning: string | undefined;
        let incorrectReasoning: string | undefined;
        
        if (currentRow.length > 2 && currentRow[2].trim()) {
          options = [answer, ...currentRow[2].split(';').map(opt => opt.trim())];
        } else {
          options = [answer];
        }
        
        if (currentRow.length > 3 && currentRow[3].trim()) {
          correctReasoning = currentRow[3];
        }
        
        if (currentRow.length > 4 && currentRow[4].trim()) {
          incorrectReasoning = currentRow[4];
        }
        
        cards.push({
          id: `card-${cards.length}`,
          question,
          answer,
          options,
          correctReasoning,
          incorrectReasoning
        });
      }
    }
    
    console.log("Parsed cards:", cards);
    return cards;
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
        disabled={isProcessing}
      >
        {isProcessing ? 'Processing...' : 'Try Sample CSV'}
      </button>
      
      {isProcessing && (
        <div className="mt-4 p-3 bg-blue-100 text-blue-700 rounded-md text-sm">
          Processing CSV file... This may take a moment for large files.
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-md text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default CSVUploader;
