// api/start_game.js
module.exports = async (req, res) => {
    if (req.method !== 'GET') {
      return res.status(405).send('Method Not Allowed');
    }
  
    const caseDescription = 'Ценный артект исчез из музея. Три охранника дежурили в ту ночь, но их показания не совпадают. Один из них лжет.';
    const suspects = [
      { id: 'agent-a', name: 'Анна' },
      { id: 'agent-b', name: 'Борис' },
      { id: 'agent-c', name: 'Виктор' }
    ];
  
    const liarId = suspects[Math.floor(Math.random() * suspects.length)].id;
  
    // Возвращаем ID лжеца на фронтенд.
    // !!! ВНИМАНИЕ: Это выставляет ID лжеца на сторону клиента.
    // Для реальной игры, где лжец должен быть секретом, потребуется база данных
    // или более сложная система токенов для управления состоянием на сервере.
    res.status(200).json({
      case_description: caseDescription,
      suspects: suspects.map(s => ({ id: s.id, name: s.name })),
      liar_id_for_this_game_only_for_dev: liarId, // Временное решение для прототипа
      questions: [ // Чтобы фронтенд знал, какие вопросы задавать
        'Где вы были в 22:00?',
        'Видели ли вы кого-то подозрительного?',
        'Можете ли вы предоставить алиби?'
      ]
    });
  };