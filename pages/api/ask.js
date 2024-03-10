// pages/api/ask.js
// 调用openai接口
//创建一个API路由来处理与OpenAI的交互
export default async function handler(req, res) {
  if (req.method === 'POST') {
    const openai = require('openai');
    openai.apiKey = process.env.OPENAI_API_KEY;

    try {
      const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: req.body.prompt,
        max_tokens: 150
      });

      res.status(200).json({ response: response.choices[0].text.trim() });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
