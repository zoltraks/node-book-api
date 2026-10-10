# Book API

A simple RESTful API for managing a collection of books, built with Node.js and Express.js.

Features JWT authentication and HTTPS support.

## Features

- JWT-based authentication using client credentials flow
- CRUD operations for books (supports GET, POST, PUT, PATCH, DELETE)
- HTTPS server with self-signed certificates
- Request logging middleware
- In-memory data storage

See [CHANGELOG.md](CHANGELOG.md) for version history and release notes.

## Quick Start

The commands below configure and run the service on port `50505`:

```bash
# install dependencies
npm install

# create the configuration file
cat > .env <<'EOF'
PORT=50505
HOST=localhost
CLIENT=client
SECRET=secret
JWT=your_super_secret_key
CERTIFICATE=certs/cert.pem
KEY=certs/key.pem
EOF

# generate a self-signed certificate pair in certs/
npm run generate-certificate

# start in the foreground
npm start

# or detached, logging to server.log
node index.js > server.log 2>&1 &
```

The API listens at `https://localhost:50505`.

Verify it with a token request and an authenticated call:

```bash
TOKEN=$(curl -sk -X POST https://localhost:50505/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"client_credentials","client_id":"client","client_secret":"secret"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

curl -k https://localhost:50505/api/books -H "Authorization: Bearer $TOKEN"
```

To stop a detached instance on Windows, find its PID and kill it:

```bash
netstat -ano | grep 50505
taskkill //F //PID <pid>
```

Pass `--verbose` or set `VERBOSE=1` to see the dotenv injection notice at startup.

## Prerequisites

- Node.js (v14 or higher)
- npm

## Environment Variables

The application uses the following environment variables, which can be set in a `.env` file (see `.env.example` for a template):

- `PORT`: Port number for the HTTPS server (default: 9090)
- `HOST`: Host address for the server (default: 'localhost')
- `CLIENT`: Client ID for authentication (default: 'client')
- `SECRET`: Client secret for authentication (default: 'secret')
- `CERTIFICATE`: Path to the certificate file for HTTPS, which may also contain the private key (default: 'certs/cert.pem')
- `KEY`: Path to the private key file for HTTPS, optional - set to an empty value when `CERTIFICATE` already contains the key (default: 'certs/key.pem')
- `JWT`: Secret key for JWT token signing (default: 'your_super_secret_key')
- `VERBOSE`: Enables verbose output, including the dotenv injection notice (default: disabled). The values `0`, `false`, `no`, `off`, and empty are treated as disabled, and any other value enables it. Verbose mode can also be enabled with the `--verbose` command line flag.

## Installation

The Quick Start above pins the service to port `50505`.

For the default configuration, install dependencies and copy `.env.example` to `.env` instead of writing it by hand:

```bash
npm install
cp .env.example .env
```

Then generate the certificate and start the server as shown in the Quick Start.

The API will be available at `https://localhost:9090` when `PORT` is left unset.

## Development

For development with automatic reloading on file changes:

```bash
npm run dev
```

This uses `node --watch` to watch for changes and automatically restart the server.

The server includes request logging that outputs to the console, showing request paths and payloads (truncated to 100 characters).

## Docker

The application can also be run using Docker.

1. Generate SSL certificates (for HTTPS):

```bash
npm run generate-certificate
```

2. Run the application with Docker Compose:

```bash
docker-compose up -d
```

The API will be available at `https://localhost:9090`

The Dockerfile is provided for building the Docker image.

## Authentication

The API uses JWT authentication. Obtain an access token by making a POST request to `/api/auth/token`:

```bash
curl -X POST https://localhost:9090/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type": "client_credentials", "client_id": "client", "client_secret": "secret"}'
```

Use the returned `access_token` in the Authorization header for subsequent requests:

```
Authorization: Bearer <access_token>
```

**Note:** Request bodies are logged to the console, including the `client_secret` sent to `/api/auth/token`. This is intentional - the project is an educational and proof-of-concept example where visible credentials aid debugging. Do not reuse this pattern in production services.

## API Endpoints

### GET /api/books

Retrieves all books.

**Response:**

```json
{
  "value": [
    {
      "id": 1,
      "title": "The Lord of the Rings",
      "author": "J.R.R. Tolkien"
    },
    {
      "id": 2,
      "title": "Pride and Prejudice",
      "author": "Jane Austen"
    }
  ]
}
```

### POST /api/books

Creates a new book.

**Request Body:**

```json
{
  "title": "Book Title",
  "author": "Author Name"
}
```

**Response (201 Created):**

```json
{
  "id": 3,
  "title": "Book Title",
  "author": "Author Name"
}
```

### PUT /api/books/:id

Replaces an existing book.

**Request Body:**

```json
{
  "title": "New Title",
  "author": "New Author"
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "New Title",
  "author": "New Author"
}
```

### PATCH /api/books/:id

Updates an existing book.

**Request Body:**

```json
{
  "title": "Updated Title"
}
```

**Response (200 OK):**

```json
{
  "id": 1,
  "title": "Updated Title",
  "author": "J.R.R. Tolkien"
}
```

### DELETE /api/books/:id

Deletes a book.

**Response (204 No Content):**

*(No response body)*

## Smoke Test

A quick manual pass over the API surface - `curl -k` skips certificate verification for the self-signed cert:

```bash
# obtain a token
TOKEN=$(curl -sk -X POST https://localhost:9090/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type":"client_credentials","client_id":"client","client_secret":"secret"}' \
  | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# exercise the routes
curl -k https://localhost:9090/api/books -H "Authorization: Bearer $TOKEN"           # 200 list
curl -k -X POST https://localhost:9090/api/books -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" -d '{"title":"T","author":"A"}'                # 201 created
curl -k -X DELETE https://localhost:9090/api/books/3 -H "Authorization: Bearer $TOKEN" # 204 deleted
curl -k https://localhost:9090/openapi.yaml                                          # 200 spec
```

Negative checks worth a look:

- no `Authorization` header returns `401`, a bad token returns `403`
- wrong `client_id` or `client_secret` returns `400` with `invalid_grant`
- a book body missing `title` or `author` returns `400`, a missing book id returns `404`

## Certificate Generation

The `generate-certificate.js` script generates self-signed SSL certificates for HTTPS support. It creates a private key and certificate pair in PEM format, valid for 10 years. The script checks if certificates already exist and exits with an error if they do, preventing accidental overwrites.

To generate certificates:

```bash
npm run generate-certificate
```

This will create `certs/key.pem` and `certs/cert.pem` files.

## Dependencies

- express: Web framework
- jsonwebtoken: JWT implementation
- https: Built-in Node.js module for HTTPS
- fs: Built-in Node.js module for file system operations
- @peculiar/x509: For self-signed certificate generation (development only)

## Engineering Standards

Rules for code and specification changes live in `docs/standard/`:

- `javascript-general-development.md` - base JavaScript runtime and tooling rules
- `javascript-express-development.md` - conventions for this JavaScript/Express service
- `openapi-general-development.md` - rules for the `public/openapi.yaml` contract

## Versioning

The version lives in `package.json` and is mirrored by a section in `CHANGELOG.md`.

The patch component is incremented by default. Each component is a single decimal digit and overflow carries to the left: `1.1.1` becomes `1.1.2`, `1.0.9` becomes `1.1.0`, `9.9.9` becomes `10.0.0`.

## License

This project is licensed under the MIT License - see [LICENSE.md](LICENSE.md) for the full text.

## Credits

This project was created by Filip Golewski for educational purposes.
