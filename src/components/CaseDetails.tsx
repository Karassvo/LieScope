import React, { useState } from 'react';
import { Case } from '../types';
import { Send } from 'lucide-react';

interface CaseDetailsProps {
  caseData: Case;
}

const CaseDetails: React.FC<CaseDetailsProps> = ({ caseData }) => {
  const [newQuestion, setNewQuestion] = useState('');
  const [customQuestions, setCustomQuestions] = useState<string[]>([]);

  const handleAddQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (newQuestion.trim()) {
      setCustomQuestions([...customQuestions, newQuestion.trim()]);
      setNewQuestion('');
    }
  };

  return (
    <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
        {caseData.title}
      </h2>
      
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300">
          {caseData.description}
        </p>
      </div>
      
      <div className="space-y-6">
   

        {customQuestions.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
              Your Questions:
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              {customQuestions.map((question, index) => (
                <li 
                  key={index} 
                  className="text-gray-700 dark:text-gray-300"
                >
                  {question}
                </li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleAddQuestion} className="mt-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Ask your own question..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={!newQuestion.trim()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex items-center gap-2"
            >
              <Send size={18} />
              Ask
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CaseDetails;