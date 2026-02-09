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
require('dotenv').config();

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

// Serve static files from public directory
app.use(express.static('public'));

const JWT_SECRET = process.env.JWT_SECRET || 'your_super_secret_key';

app.post('/api/auth/token', (req, res) => {
  const { grant_type, client_id, client_secret } = req.body;

  const AUTH_CLIENT = process.env.AUTH_CLIENT || 'client';
  const AUTH_SECRET = process.env.AUTH_SECRET || 'secret';

  if (grant_type === 'client_credentials' && client_id === AUTH_CLIENT && client_secret === AUTH_SECRET) {
    const payload = { sub: client_id };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' });
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

const keyFile = process.env.KEY_FILE || 'certs/key.pem';
const certFile = process.env.CERT_FILE || 'certs/cert.pem';

if (!fs.existsSync(keyFile) || !fs.existsSync(certFile)) {
  console.error('Certificate or private key file not found.\nPlease provide required certificate and private key files in PEM format.\nAlternatively run "npm run generate-certs" to generate default self-signed certificates.');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(keyFile),
  cert: fs.readFileSync(certFile),
};

const port = process.env.PORT && process.env.PORT.trim() !== '' ? parseInt(process.env.PORT) : 9090;
const host = process.env.HOST || 'localhost';

https.createServer(options, app).listen(port, host, () => {
  console.log(`Book API listening on https://${host}:${port}`);
  console.log(`OpenAPI specification: https://${host}:${port}/openapi.yaml`);
});
