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

const getTimestamp = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  const milliseconds = String(now.getMilliseconds()).padStart(3, '0');
  return `${hours}:${minutes}:${seconds}.${milliseconds} `;
};

const limitString = (str, limit) => {
  if (limit === undefined || limit < 1 || str.length <= limit) {
    return str;
  }
  if (limit < 4) {
    return '.'.repeat(limit);
  }
  const show = limit - 3;
  const head = Math.floor(show / 2);
  const tail = Math.ceil(show / 2);
  return str.substring(0, head) + '...' + str.substring(str.length - tail);
};

const logRequest = (req, res, next) => {
  const time = getTimestamp();
  const method = req.method;
  const path = req.path;
  let logMessage = `${time}${method} ${path}`;

  if (req.body && Object.keys(req.body).length > 0) {
    const payload = limitString(JSON.stringify(req.body), 100);
    logMessage += ` ${payload}`;
  }

  console.log(logMessage);
  next();
};

app.use(logRequest);

app.use(express.static('public'));

const JWT = process.env.JWT || 'your_super_secret_key';
const CLIENT = process.env.CLIENT || 'client';
const SECRET = process.env.SECRET || 'secret';

app.post('/api/auth/token', (req, res) => {
  const { grant_type, client_id, client_secret } = req.body;

  if (grant_type === 'client_credentials' && client_id === CLIENT && client_secret === SECRET) {
    const payload = { sub: client_id };
    const token = jwt.sign(payload, JWT, { expiresIn: '1h' });
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

router.put('/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;
  const book = books.find(b => b.id === parseInt(id));

  if (!book) {
    return res.status(404).send('Book not found');
  }

  if (!title || !author) {
    return res.status(400).send('Title and author are required');
  }

  book.title = title;
  book.author = author;

  res.status(200).json(book);
});

router.patch('/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, author } = req.body;
  const book = books.find(b => b.id === parseInt(id));

  if (!book) {
    return res.status(404).send('Book not found');
  }

  if (title) book.title = title;
  if (author) book.author = author;

  res.status(200).json(book);
});

router.delete('/books/:id', (req, res) => {
  const { id } = req.params;
  const bookIndex = books.findIndex(b => b.id === parseInt(id));

  if (bookIndex === -1) {
    return res.status(404).send('Book not found');
  }

  books.splice(bookIndex, 1);
  res.sendStatus(204);
});

const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT, (err, user) => {
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

const certificate = process.env.CERTIFICATE || 'certs/cert.pem';
const key = process.env.KEY !== undefined ? process.env.KEY : 'certs/key.pem';

if (!fs.existsSync(certificate) || (key && !fs.existsSync(key))) {
  console.error('Certificate or private key file not found.\nPlease provide required certificate and private key files in PEM format.\nAlternatively run "npm run generate-certificate" to generate default self-signed certificates.');
  process.exit(1);
}

const options = {
  key: fs.readFileSync(key || certificate),
  cert: fs.readFileSync(certificate),
};

if (!key && !options.key.includes('PRIVATE KEY')) {
  console.error('Certificate file does not contain a private key.\nProvide a private key file via the KEY environment variable or include the key in the certificate PEM file.');
  process.exit(1);
}

const port = process.env.PORT && process.env.PORT.trim() !== '' ? parseInt(process.env.PORT) : 9090;
const host = process.env.HOST || 'localhost';

https.createServer(options, app).listen(port, host, () => {
  console.log(`Book API listening on https://${host}:${port}`);
  console.log(`OpenAPI specification https://${host}:${port}/openapi.yaml`);
});
