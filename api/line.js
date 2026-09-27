export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('LINE Bot Endpoint');
  }

  const events = req.body.events || [];

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userText = event.message.text.trim();
      let replyText = '';

      if (userText === 'クイズ' || userText === '1' || userText === '2' || userText === '3' || userText === '4') {
        if (userText === '2') {
          replyText = '🎉 正解です！\nabandon = 捨てる、見捨てる\n\n【イメージ・音楽で記憶を定着】\nhttps://imetan.vercel.app';
        } else if (userText === 'クイズ') {
          replyText = '【今日のいめたんクイズ】\n「abandon」の意味として最も適切なものはどれ？\n\n1. 蓄える\n2. 捨てる・見捨てる\n3. 強く主張する\n4. 観察する\n\n番号で答えてね！';
        } else {
          replyText = '❌ 残念！不正解です。\n正解は「2. 捨てる・見捨てる」でした！\n\n【解説・音楽を見る】\nhttps://imetan.vercel.app';
        }
      } else {
        replyText = `「${userText}」ですね！\n「クイズ」と送信すると本日の英単語クイズに挑戦できます！`;
      }

      await fetch('https://api.line.me/v2/bot/message/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`
        },
        body: JSON.stringify({
          replyToken: event.replyToken,
          messages: [{ type: 'text', text: replyText }]
        })
      });
    }
  }

  return res.status(200).json({ status: 'ok' });
}
