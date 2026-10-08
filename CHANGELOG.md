# Changes

## Version 1.1.2

- Renamed credential environment variables to `CLIENT`, `SECRET`, and `JWT` (from `AUTH_CLIENT`, `AUTH_SECRET`, `JWT_SECRET`).
- Renamed certificate path variables to `KEY` and `CERTIFICATE` (from `KEY_FILE`, `CERT_FILE`). `KEY` is now optional - set it to an empty value when the `CERTIFICATE` file already contains the private key.
- `docker-compose.yml` now declares every supported environment variable explicitly.
- Dockerfile now copies only the runtime file set (`index.js`, `public/`, package files) and installs production dependencies via `npm ci --omit=dev`.
- Moved certificate-generation packages (`node-forge`, `pem`, `self-signed`) to `devDependencies`, out of the production image.
- Renamed `generate-certs.js` and its npm script to `generate-certificate`.
- Added `.env.example` as a configuration template.
- Added engineering standards under `docs/standard/`.
- Updated dependencies: express 5.2.1, dotenv 17.4.2, jsonwebtoken 9.0.3, nodemon 3.1.14.

## Version 1.1.1

- Added timestamp with milliseconds to request logs for better debugging.
- Added `PUT`, `PATCH`, and `DELETE` endpoints for full CRUD support on `/books/:id`.

## Version 1.1.0

Development workflow improvements and API documentation since 1.0.0.

- Added `dev` script using `nodemon` for automatic server reloading during development, improving developer experience.
- Created comprehensive OpenAPI 3.0 specification (`openapi.yaml`) documenting all API endpoints, authentication flow, request/response schemas, and security requirements.
- Configured Express to serve static files from `public` directory, making the OpenAPI specification publicly accessible.
- Updated server startup message to display the OpenAPI specification download URL (`https://localhost:9090/openapi.yaml`).
- Added `nodemon` as a development dependency for file watching and automatic restarts.

## Version 1.0.0

Initial release of Book API.

- RESTful API for managing books with CRUD operations (GET and POST endpoints).
- JWT-based authentication using client credentials flow via `POST /api/auth/token`.
- HTTPS server support with self-signed certificate generation script.
- Request logging middleware for debugging and monitoring.
- In-memory data storage for books collection.
- Environment variable configuration for port, host, authentication credentials, and certificate paths.
- Express.js web framework with JSON body parsing.
- Docker support with Dockerfile and docker-compose configuration.
- Certificate generation utility using `node-forge`, `pem`, and `self-signed` packages.
