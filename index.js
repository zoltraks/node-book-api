/*

░████████     ░██████     ░██████   ░██     ░██          ░███    ░█████████  ░██████
░██    ░██   ░██   ░██   ░██   ░██  ░██    ░██          ░██░██   ░██     ░██   ░██
░██    ░██  ░██     ░██ ░██     ░██ ░██   ░██          ░██  ░██  ░██     ░██   ░██
░████████   ░██     ░██ ░██     ░██ ░███████          ░█████████ ░█████████    ░██
░██     ░██ ░██     ░██ ░██     ░██ ░██   ░██         ░██    ░██ ░██           ░██
░██     ░██  ░██   ░██   ░██   ░██  ░██    ░██        ░██    ░██ ░██           ░██
░█████████    ░██████     ░██████   ░██     ░██       ░██    ░██ ░██         ░██████                                                                                   

*/

const express = require('express');
const https = require('https');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const app = express();

app.use(express.json());

const logRequest = (req, res, next) => {
  console.log(`Request Path: ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    const payload = JSON.stringify(req.body);
    console.log(`Request Payload: ${payload.substring(0, 100)}${payload.length > 100 ? '...' : ''}`);
  }
  next();
};

app.use(logRequest);

const JWT_SECRET = 'your_super_secret_key'; // In a real app, use an environment variable

app.post('/api/auth/token', (req, res) => {
  const { grant_type, client_id, client_secret } = req.body;

  if (grant_type === 'client_credentials' && client_id === 'client_id' && client_secret === 'client_secret') {
    const token = jwt.sign({ client_id }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ access_token: token, token_type: 'bearer', expires_in: 3600 });
  } else {
    res.status(400).json({ error: 'invalid_grant' });
  }
});

const router = express.Router();

let books = [
  { id: 1, title: 'The Lord of the Rings', author: 'J.R.R. Tolkien' },
  { id: 2, title: 'Pride and Prejudice', author: 'Jane Austen' },
];

router.get('/books', (req, res) => {
  res.status(200).json({ value: books });
});

router.post('/books', (req, res) => {
  const { title, author } = req.body;
  if (!title || !author) {
    return res.status(400).send('Title and author are required');
  }
  const newBook = {
    id: books.length + 1,
    title,
    author,
  };
  books.push(newBook);
  res.status(201).json(newBook);
});

const authenticateJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (authHeader) {
        const token = authHeader.split(' ')[1];
        jwt.verify(token, JWT_SECRET, (err, user) => {
            if (err) {
                return res.sendStatus(403);
            }
            req.user = user;
            next();
        });
    } else {
        res.sendStatus(401);
    }
};


app.use('/api', authenticateJWT, router);

const options = {
  key: fs.readFileSync('certs/key.pem'),
  cert: fs.readFileSync('certs/cert.pem'),
};

const port = 9090;

https.createServer(options, app).listen(port, () => {
  console.log(`BookAPI listening on https://localhost:${port}`);
});
