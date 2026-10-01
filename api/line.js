import { createClient } from '@supabase/supabase-js'

// Vercelに設定した環境変数からSupabaseに接続するクライアントを作成
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
)

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(200).send('LINE Bot Endpoint');
  }

  const events = req.body.events || [];
  if (events.length === 0) {
    return res.status(200).json({ status: 'ok' });
  }

  for (const event of events) {
    if (event.type === 'message' && event.message.type === 'text') {
      const userText = event.message.text.trim();
      let replyText = '';

      // ユーザーが「クイズ」と送信した場合
      if (userText === 'クイズ') {
        
        // Supabaseの 'words' テーブルからデータをすべて取得する
        const { data: wordsList, error } = await supabase
          .from('words')
          .select('*');

        if (error || !wordsList || wordsList.length === 0) {
          replyText = '現在、データベースに単語が登録されていないか、接続に失敗しています。';
        } else {
          // 登録されている単語の中からランダムに1つ選ぶ
          const randomWord = wordsList[Math.floor(Math.random() * wordsList.length)];
          
          // クイズ形式のメッセージを作成
          replyText = `【今日のいめたんクイズ】\n「${randomWord.word}」の意味として最も適切なものはどれ？\n\n（ヒント/答えの確認: ${randomWord.meaning}）`;
        }
      } else {
        replyText = `「${userText}」ですね！「クイズ」と送信すると、データベースから英単語クイズが出題されます。`;
      }

      // LINEへ返信を送信
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
