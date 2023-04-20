const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const fs = require('fs');
const { spawn } = require('child_process');
const axios = require('axios');
const openaiApiKey = process.env.OPENAI_API_KEY;
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'Public')));
app.use('/Images', express.static('Images'));
app.use(express.json());

app.post('/execute', (req, res) => {
  console.log('Received POST request');
  const { code, language, stdin } = req.body;

  console.log('stdin:', stdin);

  if (language === 'python') {
    fs.writeFileSync('test.py', code);

    const pythonProcess = spawn('python', ['test.py'], { stdio: ['pipe', 'pipe', 'pipe'] });
    pythonProcess.stdin.write(stdin);
    pythonProcess.stdin.end();
    let outputData = '';
    let errorData = '';

    pythonProcess.stdout.on('data', (data) => {
      outputData += data.toString();
    });

    pythonProcess.stderr.on('data', (data) => {
      errorData += data.toString();
    });

    pythonProcess.on('close', (code) => {
      if (errorData) {
        console.log('Python script error:', errorData);
        res.json({ error: errorData });
      } else {
        console.log('Python script executed');
        res.json({ output: outputData });
      }
    });

    pythonProcess.on('error', (error) => {
      res.json({ error: error.message });
    });
  }
});

app.post('/openai', async (req, res) => {
  const prompt = req.body.prompt;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci-codex/completions',
      {
        prompt: prompt,
        max_tokens: 50,
        n: 1,
        stop: null,
        temperature: 0.5,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openaiApiKey}`,
        },
      }
    );

    const generatedText = response.data.choices[0].text.trim();
    res.json({ text: generatedText });
  } catch (error) {
    console.error('Error calling OpenAI API: ', error.message);
    res.status(500).json({ error: 'Error calling OpenAI API' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Public', 'index.html'));
});

app.use(express.static(path.join(__dirname, 'Public')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'Public', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

