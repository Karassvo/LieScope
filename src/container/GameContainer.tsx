// src/components/GameContainer.tsx

import React, { useState } from 'react';
import { useGameState } from '../hooks/useGameState'; // ПУТЬ ИЗМЕНЕН: теперь '../hooks/useGameState'
import AgentCard from '../components/AgentCard';                 // ПУТЬ ИЗМЕНЕН: теперь './AgentCard'
import CaseDetails from '../components/CaseDetails';             // ПУТЬ ИЗМЕНЕН: теперь './CaseDetails'
import SubmitGuess from '../components/SubmitGuess';             // ПУТЬ ИЗМЕНЕН: теперь './SubmitGuess'
import { Agent } from '../types';                     // ПУТЬ ИЗМЕНЕН: теперь '../types'

const GameContainer: React.FC = () => {
  const {
    gameData,
    selectedAgent,
    setSelectedAgent,
    submitSelection,
    submitting,
    result,
    startGame,
    askQuestion,
    askingQuestion,
  } = useGameState();

  const [userQuestionInput, setUserQuestionInput] = useState(''); // Состояние для ввода вопроса пользователя

  // --- UI Блок 1: Состояние загрузки игры ---
  if (gameData.loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-700 dark:text-gray-300">Загрузка данных расследования...</p>
        </div>
      </div>
    );
  }

  // --- UI Блок 2: Состояние ошибки при загрузке игры ---
  if (gameData.error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md max-w-md">
          <p className="text-red-500 text-lg mb-4">Ошибка при загрузке данных игры</p>
          <p className="text-gray-700 dark:text-gray-300">{gameData.error}</p>
          <button
            onClick={startGame} // Повторная попытка начать игру
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  // --- UI Блок 3: Отображение результата игры (после обвинения) ---
  if (result.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        <div className="w-full max-w-3xl p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900 dark:text-white">
            Результат расследования
          </h2>

          {result.error ? (
            <div className="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 mb-6">
              <p>{result.error}</p>
            </div>
          ) : (
            <div className={`p-6 rounded-lg mb-6 text-center ${result.data.is_correct ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              <h3 className="text-xl font-bold mb-2">
                {result.data.is_correct ? 'Правильно! Вы поймали лжеца!' : 'Неправильно. Вы не опознали лжеца.'}
              </h3>
              <p>{result.data.result}</p>
            </div>
          )}

          <div className="flex justify-center">
            <button
              onClick={startGame}
              className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              Новое расследование
            </button>
          </div>
        </div>
      </div>
    );
  }

  // --- UI Блок 4: Кнопка "Начать новую игру" (когда gameData.data еще не заполнено) ---
  if (!gameData.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <button
          onClick={startGame}
          className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
        >
          Начать новую игру
        </button>
      </div>
    );
  }

  // --- UI Блок 5: Основной игровой макет (когда игра активна) ---
  const { caseData, agents } = gameData.data;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 py-8">
      <div className="container mx-auto max-w-6xl">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Дилемма Детектива
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Выслушайте показания каждого подозреваемого и вычислите лжеца
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

        {/* --- Секция для ввода вопроса пользователем --- */}
        <div className="mb-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-white">Задать свой вопрос:</h2>
          <textarea
            className="w-full p-3 mb-4 rounded-md bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder={
              selectedAgent
                ? `Введите ваш вопрос для ${agents.find(a => a.id === selectedAgent)?.name || 'выбранного агента'}...`
                : 'Выберите подозреваемого, чтобы задать вопрос...'
            }
            value={userQuestionInput}
            onChange={(e) => setUserQuestionInput(e.target.value)}
            disabled={!selectedAgent || askingQuestion}
          ></textarea>
          <button
            onClick={() => {
              if (userQuestionInput.trim() && selectedAgent) {
                askQuestion(selectedAgent, userQuestionInput.trim());
                setUserQuestionInput('');
              }
            }}
            disabled={askingQuestion || !userQuestionInput.trim() || !selectedAgent}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {askingQuestion
              ? 'Отправка...'
              : `Спросить ${selectedAgent ? agents.find(a => a.id === selectedAgent)?.name : 'выбранного агента'}`}
          </button>
        </div>
        {/* --- Конец секции вопроса пользователя --- */}

        <SubmitGuess
          onSubmit={submitSelection}
          disabled={!selectedAgent || askingQuestion || submitting}
          submitting={submitting}
        />
      </div>
    </div>
  );
};

export default GameContainer;