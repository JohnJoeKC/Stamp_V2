const express = require('express');
const Docker = require('dockerode');
const path = require('path');
const app = express();
const cors = require('cors');
const docker = new Docker({ host: 'localhost', port: 2375 });

app.use(cors({
  origin: 'http://127.0.0.1:5500',
  methods: ['POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));
app.use(express.json());

app.post('/execute', async (req, res) => {
    try {
      // Extract code and language from the request (assumes JSON format)
      const { code, language } = req.body;
  
      if (language !== 'python') {
        res.status(400).json({ error: 'Unsupported language' });
        return;
      }
  
      // Create an isolated Docker container to run the code
      const container = await docker.createContainer({
        Image: 'python:3.8', // Use the official Python 3.8 image
        Cmd: ['python', '-c', code], // Run the provided code
        Tty: false,
        AttachStdout: true,
        AttachStderr: true,
      });
  
      // Start the container
      await container.start();
  
      // Attach a stream to collect the output
      const stream = await container.attach({ stdout: true, stderr: true, stream: true });
      let output = '';
  
      // Listen for data events and collect the output
      stream.on('data', (chunk) => {
        output += chunk.toString('utf-8');
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