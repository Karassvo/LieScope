import React from 'react';
import { useGameState } from '../hooks/useGameState';
import AgentCard from './AgentCard';
import CaseDetails from './CaseDetails';
import SubmitGuess from './SubmitGuess';
import { Agent } from '../types';

const GameContainer: React.FC = () => {
  const { 
    gameData, 
    selectedAgent, 
    setSelectedAgent, 
    submitSelection,
    submitting,
    result
  } = useGameState();

  if (gameData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Loading investigation data...</p>
        </div>
      </div>
    );
  }

  if (gameData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
          <p className="text-red-500 text-lg mb-4">Error loading game data</p>
          <p className="text-gray-700 dark:text-gray-300">{gameData.error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-3xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Investigation Result
          </h2>
          
          {result.error ? (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mb-6">
              <p>{result.error}</p>
            </div>
          ) : (
            <div className={`p-6 rounded-lg mb-6 text-center ${result.correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h3 className="text-xl font-bold mb-2">
                {result.correct ? 'Correct! You caught the liar!' : 'Incorrect. You didn\'t identify the liar.'}
              </h3>
              <p>{result.message}</p>
            </div>
          )}
          
          <div className="flex justify-center">
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              New Investigation
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { caseData, agents } = gameData.data!;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Detective's Dilemma
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Listen to each suspect's testimony and identify the liar
          </p>
        </header>

        <CaseDetails caseData={caseData} />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {agents.map((agent: Agent) => (
            <AgentCard
              key={agent.id}
              agent={agent}
              isSelected={selectedAgent === agent.id}
              onSelect={setSelectedAgent}
            />
          ))}
        </div>

        <SubmitGuess
          onSubmit={submitSelection}
          disabled={!selectedAgent}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default GameContainer;