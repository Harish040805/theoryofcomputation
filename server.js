require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { OpenAI } = require('openai');

const app = express();
const port = process.env.PORT || 3000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

app.use(cors());
app.use(bodyParser.json());

app.post('/api/generate-automaton', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'No prompt provided' });

  try {
    const chat = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are an automata expert that generates valid automaton data structures for DFA/NFA based on a user prompt. Respond only with a JSON object like { states: [...], transitions: [...], initialState: "...", finalStates: [...] }' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
    });

    const reply = chat.choices[0].message.content;
    const data = JSON.parse(reply); // Ensure AI returns valid JSON

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message || 'API error' });
  }
});

app.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

