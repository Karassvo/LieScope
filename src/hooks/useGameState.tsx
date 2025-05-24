import { useState, useEffect } from 'react';
import { fetchCaseData, submitGuess } from '../services/api';
import { Agent, ApiResponse, GameData } from '../types';

// Mock data for development (will be replaced with API data)
const mockCaseData = {
  id: 'case-001',
  title: 'The Missing Artifact',
  description: 'A valuable artifact has disappeared from the museum. Three security agents were on duty that night, but their stories don\'t match up. One of them is lying.',
  questions: [
  ]
};

const mockAgents: Agent[] = [
  {
    id: 'agent-a',
    name: 'Suspect 1',
    audioUrl: 'https://example.com/audio-a.mp3',
    textResponse: 'I was monitoring the east wing when the alarm went off. I immediately rushed to the scene but saw nothing unusual. The artifact was simply gone. I didn\'t see anyone else in the area except for Agent C who arrived shortly after me.'
  },
  {
    id: 'agent-b',
    name: 'Suspect 2',
    audioUrl: 'https://example.com/audio-b.mp3',
    textResponse: 'I was on my break in the security room when I heard the alarm. The cameras in that section had been disabled for maintenance earlier that day. When I arrived at the scene, both Agent A and Agent C were already there.'
  },
  {
    id: 'agent-c',
    name: 'Suspect 3',
    audioUrl: 'https://example.com/audio-c.mp3',
    textResponse: 'I was patrolling the west wing when the alarm sounded. I hurried to the artifact room and found it empty. Agent A arrived a minute later, looking somewhat flustered. I didn\'t see Agent B until much later.'
  }
];

export const useGameState = (): {
  gameData: ApiResponse<GameData>;
  selectedAgent: string | null;
  setSelectedAgent: (agentId: string) => void;
  submitSelection: () => Promise<void>;
  submitting: boolean;
  result: any;
} => {
  const [gameData, setGameData] = useState<ApiResponse<GameData>>({
    loading: true,
  });
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const loadGameData = async () => {
      try {
        // In a real app, we would use the API:
        // const data = await fetchCaseData();
        
        // Using mock data for now
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setGameData({
          data: {
            caseData: mockCaseData,
            agents: mockAgents
          },
          loading: false
        });
      } catch (error) {
        setGameData({
          error: 'Failed to load game data',
          loading: false
        });
      }
    };

    loadGameData();
  }, []);

  const submitSelection = async () => {
    if (!selectedAgent) return;
    
    setSubmitting(true);
    try {
      // In a real app, we would use the API:
      // const result = await submitGuess(selectedAgent);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock result
      const mockResult = {
        correct: Math.random() > 0.5,
        message: 'Your guess has been recorded.',
        actualLiar: mockAgents[Math.floor(Math.random() * 3)].id
      };
      
      setResult(mockResult);
    } catch (error) {
      setResult({ error: 'Failed to submit your guess' });
    } finally {
      setSubmitting(false);
    }
  };

  return {
    gameData,
    selectedAgent,
    setSelectedAgent,
    submitSelection,
    submitting,
    result
  };
};