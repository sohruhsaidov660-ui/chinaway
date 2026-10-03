function clean(value, max = 1000) {
  return String(value ?? '').trim().slice(0, max);
}

function makeApplicationId() {
  return `CW-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function sendTelegram(chatId, text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token || !chatId) return false;

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text })
  });

  return response.ok;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const applicationId = makeApplicationId();

    const fields = {
      name: clean(body.name),
      age: clean(body.age, 20),
      country: clean(body.country, 100),
      phone: clean(body.phone, 100),
      messenger: clean(body.messenger, 150),
      institution: clean(body.institution, 250),
      graduation_year: clean(body.graduation_year, 20),
      chinese: clean(body.chinese, 100),
      english: clean(body.english, 100),
      level: clean(body.level, 100),
      direction: clean(body.direction, 200),
      scholarship: clean(body.scholarship, 150),
      university: clean(body.university, 250),
      comment: clean(body.comment, 1500)
    };

    if (!fields.name || !fields.phone || !fields.country || !fields.institution || !fields.graduation_year || !fields.direction) {
      return res.status(400).json({ error: 'Заполните обязательные поля.' });
    }

    const message = [
      `🆕 НОВАЯ ЗАЯВКА CHINAWAY`,
      `ID: ${applicationId}`,
      ``,
      `👤 Имя: ${fields.name}`,
      `🎂 Возраст: ${fields.age || '—'}`,
      `🌍 Страна: ${fields.country}`,
      `📞 Телефон/WhatsApp: ${fields.phone}`,
      `💬 Telegram/WhatsApp: ${fields.messenger || '—'}`,
      ``,
      `🎓 Учебное заведение: ${fields.institution}`,
      `📅 Год окончания: ${fields.graduation_year}`,
      `🇨🇳 Китайский: ${fields.chinese}`,
      `🇬🇧 Английский: ${fields.english}`,
      `📚 Уровень: ${fields.level}`,
      `🎯 Специальность: ${fields.direction}`,
      `💰 Стипендия: ${fields.scholarship}`,
      `🏫 Город/университет: ${fields.university || '—'}`,
      ``,
      `📝 Комментарий: ${fields.comment || '—'}`
    ].join('\n');

    const ownerIds = [
      process.env.TELEGRAM_OWNER_CHAT_ID,
      process.env.TELEGRAM_OWNER_CHAT_ID_2
    ].filter(Boolean);

    if (!process.env.TELEGRAM_BOT_TOKEN || ownerIds.length === 0) {
      return res.status(500).json({ error: 'Telegram не настроен на сервере.' });
    }

    const results = await Promise.all(ownerIds.map(id => sendTelegram(id, message))); 
    console.log("Telegram results:", results);
    if (!results.some(Boolean)) {
      return res.status(502).json({ error: 'Telegram не принял сообщение.' });
    }

    return res.status(200).json({ ok: true, applicationId });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Внутренняя ошибка сервера.' });
  }
}
