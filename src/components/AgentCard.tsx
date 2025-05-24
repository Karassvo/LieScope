import React from 'react';
import { Agent } from '../types';
import AudioPlayer from './AudioPlayer';

interface AgentCardProps {
  agent: Agent;
  isSelected: boolean;
  onSelect: (agentId: string) => void;
}

const AgentCard: React.FC<AgentCardProps> = ({ agent, isSelected, onSelect }) => {
  return (
    <div 
      className={`
        relative flex flex-col p-6 rounded-lg transition-all duration-300 ease-in-out
        ${isSelected 
          ? 'bg-indigo-100 dark:bg-indigo-900/30 border-2 border-indigo-500 shadow-lg' 
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg'
        }
      `}
    >
      <div className="absolute -top-4 left-6 px-4 py-1 bg-indigo-600 text-white rounded-full font-medium text-sm">
        {agent.name}
      </div>

      <div className="mt-4 mb-4">
        <AudioPlayer 
          audioUrl={agent.audioUrl} 
          className="mb-3"
        />
        
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900/50 rounded-md text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-32 overflow-y-auto">
          <p>{agent.textResponse}</p>
        </div>
      </div>

      <button
        onClick={() => onSelect(agent.id)}
        className={`
          mt-auto self-center px-4 py-2 rounded-md font-medium transition-all duration-200
          ${isSelected
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
          }
        `}
      >
        {isSelected ? 'Selected as Liar' : 'Select as Liar'}
      </button>
    </div>
  );
};

export default AgentCard;