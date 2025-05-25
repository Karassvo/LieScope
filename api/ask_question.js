// api/ask_question.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  // !!! Изменено: теперь ожидаем user_question_text !!!
  const { suspect_id, user_question_text, liar_id_for_this_game_only_for_dev } = req.body;

  if (!suspect_id || !user_question_text || !liar_id_for_this_game_only_for_dev) {
    return res.status(400).json({ error: 'Missing suspect_id, user_question_text, or liar_id_for_this_game_only_for_dev' });
  }

  const isLiar = (suspect_id === liar_id_for_this_game_only_for_dev);
  let promptText;
  let isSsmlResponse = false;

  const caseDescription = 'Ценный артект исчез из музея. Три охранника дежурили в ту ночь, но их показания не совпадают. Один из них лжет.';

  if (isLiar) {
    isSsmlResponse = true;
    promptText = `
      Вы подозреваемый в деле о краже музейного артефакта. Описание дела: "${caseDescription}".
      Вам задан вопрос: "${user_question_text}".
      Вы ЛЖЕЦ и пытаетесь скрыть правду. Ваш ответ должен звучать нервно и по-человечески.
      Включите:
      - Легкие несостыковки или чрезмерно детализированные, ненужные описания.
      - Используйте SSML для пауз (<break time="Xms"/>) и легкого повышения тона (<prosody pitch="+X%">).
      - Начните и закончите свой ответ тегами <speak> и </speak>.
      - НЕ упоминайте, что вы лжете. Просто ведите себя как лгущий человек.
      Пример желаемого формата ответа: <speak>Эмм... <break time="500ms"/> Я был дома, <prosody pitch="+3%">абсолютно точно</prosody> дома.</speak>
      Отвечайте на русском языке.
    `;
  } else {
    promptText = `
      Вы честный подозреваемый в деле о краже музейного артефакта. Описание дела: "${caseDescription}".
      Вам задан вопрос: "${user_question_text}".
      Дайте прямой и честный ответ без лжи или SSML-тегов.
      Ваш ответ должен быть в виде простого текста на русском языке.
    `;
  }

  try {
    const result = await model.generateContent(promptText);
    const response = await result.response;
    const textResponse = response.text();

    res.status(200).json({
      response_text: textResponse,
      is_ssml: isSsmlResponse,
    });

  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to generate suspect response.' });
  }
};