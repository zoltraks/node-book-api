# Book API

A simple RESTful API for managing a collection of books, built with Node.js and Express.js.

Features JWT authentication and HTTPS support.

## Features

- JWT-based authentication using client credentials flow
- CRUD operations for books (currently supports GET and POST)
- HTTPS server with self-signed certificates
- Request logging middleware
- In-memory data storage

## Prerequisites

- Node.js (v14 or higher)
- npm

## Environment Variables

The application uses the following environment variables:

- `JWT_SECRET`: Secret key for JWT token signing (default: 'your_super_secret_key')
- `AUTH_CLIENT`: Client ID for authentication (default: 'client')
- `AUTH_SECRET`: Client secret for authentication (default: 'secret')
- `PORT`: Port number for the HTTPS server (default: 9090)
- `HOST`: Host address for the server (default: 'localhost')
- `KEY_FILE`: Path to the private key file for HTTPS (default: 'certs/key.pem')
- `CERT_FILE`: Path to the certificate file for HTTPS (default: 'certs/cert.pem')

## Installation

1. Clone the repository:

```bash
git clone git@github.com:zoltraks/node-book-api.git
cd node-book-api
```

2. Install dependencies:

```bash
npm install
```

3. Generate SSL certificates (for HTTPS):

```bash
npm run generate-certs
```

## Usage

1. Ensure SSL certificates are present (see Installation step 3).

2. Start the server:
```bash
npm start
```

The API will be available at `https://localhost:9090`

## Authentication

The API uses JWT authentication. Obtain an access token by making a POST request to `/api/auth/token`:

```bash
curl -X POST https://localhost:9090/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"grant_type": "client_credentials", "client_id": "client_id", "client_secret": "client_secret"}'
```

Use the returned `access_token` in the Authorization header for subsequent requests:

```
Authorization: Bearer <access_token>
```

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

## Development

The server includes request logging that outputs to the console, showing request paths and payloads (truncated to 100 characters).

## Security Notes

- This is a demo application with hardcoded credentials
- Uses a simple secret key for JWT signing (should use environment variables in production)
- Self-signed certificates are used for HTTPS (use proper certificates in production)
- Data is stored in memory and will be lost on server restart

## Certificate Generation

The `generate-certs.js` script generates self-signed SSL certificates for HTTPS support. It creates a private key and certificate pair in PEM format, valid for 10 years. The script checks if certificates already exist and exits with an error if they do, preventing accidental overwrites.

To generate certificates:

```bash
npm run generate-certs
```

This will create `certs/key.pem` and `certs/cert.pem` files.

## Dependencies

- express: Web framework
- jsonwebtoken: JWT implementation
- https: Built-in Node.js module for HTTPS
- fs: Built-in Node.js module for file system operations
- node-forge: For certificate generation
- pem: For PEM format handling
- self-signed: For self-signed certificate utilities

## Credits

This project was created by Filip Golewski with Kilo Code assistance.
