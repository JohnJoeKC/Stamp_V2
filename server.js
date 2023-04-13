const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const fs = require('fs'); // Add this line
const { spawn } = require('child_process'); // Add this line
const corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors());

app.use(express.static(path.join(__dirname, 'Public')));

app.use(express.json());

app.post('/execute', (req, res) => {
  console.log('Received POST request');
  const { code, language } = req.body;

  if (language === 'python') {
    fs.writeFileSync('test.py', code); // Add this line

    const pythonProcess = spawn('python', ['test.py']); // Add this line

    pythonProcess.stdout.on('data', (data) => {
      console.log('Python script executed');
      res.json({ output: data.toString() });
    });

    pythonProcess.stderr.on('data', (data) => {
      console.log('Python script error:', data.toString());
      res.json({ error: data.toString() });
    });

    pythonProcess.on('error', (error) => {
      res.json({ error: error.message });
    });
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

