// src/hooks/useGameState.ts

import { useState, useEffect } from 'react';
import { Agent, ApiResponse, GameData, AccusationResult } from '../types';

export const useGameState = () => {
  const [gameData, setGameData] = useState<ApiResponse<GameData>>({ loading: true });
  const [currentLiarId, setCurrentLiarId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false); // Для кнопки "Обвинить"
  const [result, setResult] = useState<ApiResponse<AccusationResult>>({ loading: false }); // Типизируем результат обвинения
  const [askingQuestion, setAskingQuestion] = useState(false); // Для состояния загрузки при вопросе

  // Функция для начала новой игры
  const startGame = async () => {
    setGameData({ loading: true });
    setResult({ loading: false }); // Сброс результата при старте новой игры
    setSelectedAgent(null);       // Сброс выбранного агента
    try {
      // ЗАПРОС К VERCEL SERVERLESS FUNCTION
      const response = await fetch('/api/start_game'); // Относительный путь для Vercel
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Устанавливаем данные игры
      setGameData({
        loading: false,
        data: {
          caseData: {
            id: 'case-' + Date.now(), // Генерируем уникальный ID дела
            title: 'Загадочная кража', // Или любой другой заголовок
            description: data.case_description,
            questions: data.questions || [] // Массив вопросов, если бэкенд его возвращает
          },
          agents: data.suspects.map((s: any) => ({
            id: s.id,
            name: s.name,
            textResponse: null, // Сбрасываем ответы агентов
            isSsmlResponse: false,
            audioUrl: null,     // Сбрасываем аудио
          }))
        }
      });
      // Сохраняем ID лжеца. ВНИМАНИЕ: Это выставляет ID лжеца на сторону клиента!
      // Это временное решение для прототипа без базы данных.
      setCurrentLiarId(data.liar_id_for_this_game_only_for_dev);
    } catch (error: any) {
      console.error('Error starting game:', error);
      setGameData({ error: error.message, loading: false });
    } finally {
      setGameData(prevState => ({ ...prevState, loading: false }));
    }
  };

  // Функция для задания вопроса агенту
  const askQuestion = async (agentId: string, userQuestionText: string) => { // Принимает текст вопроса
    if (!gameData.data || !currentLiarId) return; // Проверяем наличие данных
    setAskingQuestion(true); // Устанавливаем состояние загрузки вопроса
    try {
      // ЗАПРОС К VERCEL SERVERLESS FUNCTION
      const response = await fetch('/api/ask_question', { // Относительный путь для Vercel
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspect_id: agentId,
          user_question_text: userQuestionText, // Передаем текст вопроса
          liar_id_for_this_game_only_for_dev: currentLiarId // Передаем ID лжеца
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Обновляем состояние с ответом агента
      setGameData(prevState => ({
        ...prevState,
        data: prevState.data ? {
          ...prevState.data,
          agents: prevState.data.agents.map(agent =>
            agent.id === agentId
              ? { ...agent, textResponse: data.response_text, isSsmlResponse: data.is_ssml }
              : agent
          )
        } : undefined
      }));
    } catch (error: any) {
      console.error('Error asking question:', error);
    } finally {
      setAskingQuestion(false); // Снимаем состояние загрузки вопроса
    }
  };

  // Функция для отправки обвинения
  const submitSelection = async () => {
    if (!selectedAgent || !currentLiarId) return; // Проверяем, что агент выбран
    setSubmitting(true); // Устанавливаем состояние отправки
    setResult({ loading: true }); // Устанавливаем состояние загрузки результата

    try {
      // ЗАПРОС К VERCEL SERVERLESS FUNCTION
      const response = await fetch('/api/make_accusation', { // Относительный путь для Vercel
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accused_id: selectedAgent,
          liar_id_for_this_game_only_for_dev: currentLiarId // Передаем ID лжеца
        }),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setResult({ data: data, loading: false }); // Устанавливаем результат
    } catch (error: any) {
      console.error('Error making accusation:', error);
      setResult({ error: error.message, loading: false });
    } finally {
      setSubmitting(false); // Снимаем состояние отправки
    }
  };

  // Эффект для автоматического старта игры при загрузке страницы
  useEffect(() => {
    if (!gameData.data && !gameData.loading && !gameData.error) {
      startGame();
    }
  }, [gameData]); // Зависимость от gameData, чтобы не вызывать бесконечно

  return {
    gameData,
    selectedAgent,
    setSelectedAgent,
    submitSelection,
    submitting,
    result,
    startGame, // Возвращаем для кнопки "Новая игра"
    askQuestion, // Возвращаем для кнопки "Задать вопрос"
    askingQuestion, // Возвращаем для состояния загрузки
  };
};