export interface Agent {
  id: string;
  name: string;
  audioUrl: string;
  textResponse: string;
}

export interface Case {
  id: string;
  title: string;
  description: string;
  questions: string[];
  customQuestions?: string[];
}

export interface GameData {
  caseData: Case;
  agents: Agent[];
}

export interface GuessPayload {
  agentChosen: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}