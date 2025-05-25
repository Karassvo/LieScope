// src/hooks/useGameState.ts

import { useState, useEffect, useCallback } from 'react';
import { Agent, ApiResponse, GameData, AccusationResult, AskQuestionApiResponse } from '../types';

export const useGameState = () => {
  // Состояния для управления игрой
  // ИЗМЕНЕНО: Изначально loading установлено в false, чтобы useEffect мог инициировать startGame()
  const [gameData, setGameData] = useState<ApiResponse<GameData>>({ loading: false }); // Данные игры: дело, агенты
  const [currentLiarId, setCurrentLiarId] = useState<string | null>(null); // ID настоящего лжеца (только для Dev/Proto)
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null); // ID выбранного агента
  const [submitting, setSubmitting] = useState(false); // Флаг для состояния отправки обвинения
  const [result, setResult] = useState<ApiResponse<AccusationResult>>({ loading: false }); // Результат обвинения
  const [askingQuestion, setAskingQuestion] = useState(false); // Флаг для состояния запроса вопроса

  // --- Функции для взаимодействия с игрой ---

  // Функция для запуска новой игры
  const startGame = useCallback(async () => {
    // Сброс всех состояний для чистой новой игры
    setGameData({ loading: true }); // Устанавливаем загрузку СРАЗУ ПОСЛЕ ВЫЗОВА startGame()
    setResult({ loading: false }); // Сбрасываем предыдущий результат
    setSelectedAgent(null);       // Сбрасываем выбранного агента
    setCurrentLiarId(null);       // Сбрасываем ID лжеца

    console.log("--> startGame() function called!"); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

    try {
      // Запрос к Vercel Serverless Function: /api/start_game
      const response = await fetch('/api/start_game');
      console.log("Response from /api/start_game:", response); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

      if (!response.ok) {
        const errorText = await response.text();
        console.error("API Error Response for start_game:", errorText); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }
      const data = await response.json(); // Получаем данные от бэкенда
      console.log("API Data received for start_game:", data); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ

      // Обновляем состояние игры после успешной загрузки
      setGameData({
        data: {
          caseData: {
            id: 'case-' + Date.now(), // Генерируем уникальный ID для дела
            title: 'Загадочная кража', // Или динамический заголовок от бэкенда
            description: data.case_description, // Описание дела от бэкенда
            questions: data.questions || [] // Пример вопросов (если есть)
          },
          agents: data.suspects.map((s: any) => ({
            id: s.id,
            name: s.name,
            textResponse: null, // Ответы пока пустые
            isSsmlResponse: false,
            audioUrl: null,     // Аудио пока отсутствует
          }) as Agent) // Явное приведение к типу Agent для корректной типизации
        },
        loading: false // Загрузка завершена
      });
      // Сохраняем ID лжеца, полученный от бэкенда (только для Dev/Proto)
      setCurrentLiarId(data.liar_id_for_this_game_only_for_dev);
    } catch (error: any) {
      console.error('Ошибка при старте игры:', error);
      // Устанавливаем ошибку и завершаем загрузку при неудаче
      setGameData({ error: error.message, loading: false });
    }
  }, []); // Пустой массив зависимостей: функция создается один раз

  // Функция для задания вопроса агенту
  const askQuestion = useCallback(async (agentId: string, userQuestionText: string) => {
    // Проверяем наличие данных игры, ID лжеца и текста вопроса
    if (!gameData.data || !currentLiarId) {
      console.warn("Невозможно задать вопрос: данные игры не загружены или ID лжеца отсутствует.");
      return;
    }
    if (!userQuestionText.trim()) {
      console.warn("Невозможно задать пустой вопрос.");
      return;
    }

    setAskingQuestion(true); // Устанавливаем флаг запроса

    try {
      // Запрос к Vercel Serverless Function: /api/ask_question
      const response = await fetch('/api/ask_question', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          suspect_id: agentId,
          user_question_text: userQuestionText,
          liar_id_for_this_game_only_for_dev: currentLiarId // Передаем ID лжеца
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      // Явно типизируем данные ответа
      const data: AskQuestionApiResponse = await response.json();

      // Обновляем состояние агента с его ответом
      setGameData(prevState => {
        if (!prevState.data) return prevState; // Если данных нет, возвращаем текущее состояние

        return {
          ...prevState,
          data: {
            ...prevState.data,
            agents: prevState.data.agents.map(agent =>
              agent.id === agentId
                ? ({ // Явно приводим объект к типу Agent
                    ...agent, // Копируем существующие свойства агента
                    textResponse: data.response_text, // Обновляем текстовый ответ
                    isSsmlResponse: data.is_ssml,     // Обновляем флаг SSML
                    audioUrl: null // Обнуляем audioUrl, т.к. аудио будет сгенерировано новое
                  } as Agent)
                : agent // Остальных агентов оставляем без изменений
            )
          }
        };
      });
    } catch (error: any) {
      console.error('Ошибка при задании вопроса:', error);
      // Здесь можно добавить логику для отображения ошибки пользователю
    } finally {
      setAskingQuestion(false); // Запрос вопроса завершен
    }
  }, [gameData.data, currentLiarId]); // Зависимости: gameData.data и currentLiarId

  // Функция для отправки обвинения
  const submitSelection = useCallback(async () => {
    // Проверяем, выбран ли агент и доступен ли ID лжеца
    if (!selectedAgent || !currentLiarId) {
      console.warn("Невозможно отправить обвинение: агент не выбран или ID лжеца отсутствует.");
      return;
    }

    setSubmitting(true); // Устанавливаем флаг отправки
    setResult({ loading: true }); // Устанавливаем загрузку результата

    try {
      // Запрос к Vercel Serverless Function: /api/make_accusation
      const response = await fetch('/api/make_accusation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accused_id: selectedAgent,
          liar_id_for_this_game_only_for_dev: currentLiarId // Передаем ID лжеца
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! Status: ${response.status}, Message: ${errorText}`);
      }

      // Явно типизируем данные результата
      const data: AccusationResult = await response.json();

      setResult({ data: data, loading: false }); // Устанавливаем результат и завершаем загрузку
    } catch (error: any) {
      console.error('Ошибка при отправке обвинения:', error);
      setResult({ error: error.message, loading: false }); // Устанавливаем ошибку и завершаем загрузку
    } finally {
      setSubmitting(false); // Флаг отправки сброшен
    }
  }, [selectedAgent, currentLiarId]); // Зависимости: selectedAgent и currentLiarId

  // --- Эффекты ---

  // Эффект для автоматического старта игры при монтировании компонента
  useEffect(() => {
    console.log("--> useEffect in useGameState running. gameData state:", gameData); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
    // Начинаем игру только если данные еще не загружены, нет активной загрузки и нет ошибки
    // Условие теперь будет true при первом рендере, так как gameData.loading = false
    if (!gameData.data && !gameData.loading && !gameData.error) {
      console.log("--> Condition met: Calling startGame()"); // ДОБАВЛЕНО ДЛЯ ОТЛАДКИ
      startGame();
    }
  }, [gameData.data, gameData.loading, gameData.error, startGame]); // Зависимости для useEffect

  // --- Возвращаемые значения хука ---
  return {
    gameData,
    selectedAgent,
    setSelectedAgent,
    submitSelection,
    submitting,
    result,
    startGame,
    askQuestion,
    askingQuestion,
  };
};