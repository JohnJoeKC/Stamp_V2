const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const { PythonShell } = require('python-shell'); // Make sure to add this at the beginning of the server.js file.
const corsOptions = {
  origin: 'https://stamp-v2.herokuapp.com',
  optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, 'Public')));

app.use(express.json());

app.post('/execute', (req, res) => {
  const { code, language } = req.body;

  if (language === 'python') {
    PythonShell.runString(code, null, null, (err, output) => {
      if (err) {
        console.error('Error:', err.message);
        console.error('Traceback:', err.traceback);

        res.status(500).json({ error: 'An error occurred while executing the code.' });
      } else {
        res.json({ output: output.join('\n') });
      }
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
