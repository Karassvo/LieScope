const API_BASE_URL = '/api';

export const fetchCaseData = async (): Promise<{
  caseText: string;
  agents: Array<{
    name: string;
    audioUrl: string;
    textResponse: string;
  }>;
}> => {
  try {
    const response = await fetch(`${API_BASE_URL}/case`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching case data:', error);
    throw error;
  }
};

export const submitGuess = async (agentChosen: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/guess`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ agentChosen }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error submitting guess:', error);
    throw error;
  }
};