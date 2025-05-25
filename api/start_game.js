// api/start_game.cjs

// Используем require() вместо import для CommonJS
const { VercelRequest, VercelResponse } = require('@vercel/node');

// Используем module.exports вместо export default для CommonJS
module.exports = async function handler(request, response) {
  if (request.method !== 'GET') {
    return response.status(405).send('Method Not Allowed');
  }

  // Ваши данные и логика остаются такими же
  const caseDescription = 'Ценный артект исчез из музея. Три охранника дежурили в ту ночь, но их показания не совпадают. Один из них лжет.';
  const suspects = [
    { id: 'agent-a', name: 'Анна' },
    { id: 'agent-b', name: 'Борис' },
    { id: 'agent-c', name: 'Виктор' }
  ];

  const liarId = suspects[Math.floor(Math.random() * suspects.length)].id;

  try {
    response.status(200).json({
      case_description: caseDescription,
      suspects: suspects.map(s => ({ id: s.id, name: s.name })),
      liar_id_for_this_game_only_for_dev: liarId,
      questions: [
        'Где вы были в 22:00?',
        'Видели ли вы кого-то подозрительного?',
        'Можете ли вы предоставить алиби?'
      ]
    });
  } catch (error) {
    console.error("Error in start_game API:", error);
    response.status(500).json({ error: "Failed to start game due to an internal error." });
  }
}; // Обратите внимание на точку с запятой после закрывающей фигурной скобки функции