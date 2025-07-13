const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = 3000;

app.post('/api/generate-automaton', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are an automata generator.' },
          { role: 'user', content: `Generate a DFA or NFA for: ${prompt}. Return states, transitions, initialState, and finalStates in JSON format.` }
        ]
      })
    });

    const json = await openaiRes.json();
    const text = json.choices[0].message.content;

    const automaton = JSON.parse(text); // assumes OpenAI returns a clean JSON object
    res.json(automaton);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to generate automaton.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});
