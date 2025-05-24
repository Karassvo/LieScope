import React from 'react';
import { ArrowRight } from 'lucide-react';

interface SubmitGuessProps {
  onSubmit: () => void;
  disabled: boolean;
  submitting: boolean;
}

const SubmitGuess: React.FC<SubmitGuessProps> = ({ 
  onSubmit, 
  disabled, 
  submitting 
}) => {
  return (
    <div className="mt-8 flex justify-center">
      <button
        onClick={onSubmit}
        disabled={disabled || submitting}
        className={`
          flex items-center justify-center gap-2 px-8 py-3 rounded-lg font-semibold text-white
          transition-all duration-300 transform
          ${disabled 
            ? 'bg-gray-400 cursor-not-allowed opacity-50' 
            : 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 shadow-md hover:shadow-lg'
          }
        `}
      >
        {submitting ? (
          <>
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Submitting...
          </>
        ) : (
          <>
            Submit Guess
            <ArrowRight size={18} />
          </>
        )}
      </button>
    </div>
  );
};

export default SubmitGuess;