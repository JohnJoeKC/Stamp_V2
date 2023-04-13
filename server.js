const express = require('express');
const path = require('path');
const app = express();
const cors = require('cors');
const PythonShell = require('python-shell').PythonShell;

app.use(cors({
  origin: process.env.NODE_ENV === 'production' ? 'https://stamp-v2.herokuapp.com' : 'http://127.0.0.1:5500',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.static(path.join(__dirname, 'Public')));

app.use(express.json());

app.post('/execute', (req, res) => {
  const { code, language } = req.body;

  if (language === 'python') {
    const pythonShell = new PythonShell('python-script.py', { mode: 'text' });
    pythonShell.send(code);

    pythonShell.on('message', (output) => {
      res.json({ output: output });
    });

    pythonShell.end((err) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'An error occurred while executing the code.' });
      }
    });
  } else {
    res.status(400).json({ error: 'Unsupported language.' });
  }
});

      // Wait for the container to finish executing the code
      await container.wait();
  
      // Clean up the container
      await container.remove();
  
      // Send the output back to the client
      res.json({ output });
    } catch (error) {
      console.error('Error details:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  
  });

  app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
  
  app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});