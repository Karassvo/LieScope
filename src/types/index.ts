// src/types.ts

export interface Agent {
  id: string;
  name: string;
  textResponse: string | null; // Текстовый ответ агента (может быть null до получения)
  audioUrl: string | null;     // URL для аудио ответа (может быть null до получения)
  isSsmlResponse: boolean;     // <--- ДОБАВЬТЕ ЭТУ СТРОКУ (или убедитесь, что она есть)
}

export interface Case {
  id: string;
  title: string;
  description: string;
  questions: string[];
}

export interface GameData {
  caseData: Case;
  agents: Agent[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  loading: boolean;
}

export interface AccusationResult {
  result: string;
  is_correct: boolean;
  actual_liar: string;
}

export interface AskQuestionApiResponse {
  response_text: string;
  is_ssml: boolean;
}