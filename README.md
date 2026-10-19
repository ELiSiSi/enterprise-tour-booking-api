# Enterprise Tour Booking API

![Node.js](https://img.shields.io/badge/Node.js-22%2B-green)
![TypeScript](https://img.shields.io/badge/TypeScript-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-brightgreen)
![License](https://img.shields.io/badge/License-ISC-blue)

A TypeScript REST API and server-rendered application for tour management and bookings. It includes JWT authentication, role-based permissions, TOTP MFA, MongoDB persistence, Stripe Checkout, and a BullMQ email worker.

## Features

- Modular user, tour, review, booking, and view routes.
- Access/refresh JWTs, database-backed sessions, password reset, account lockout, and TOTP MFA.
- Role-based authorization and ownership checks for reviews.
- Tour search, filtering, pagination, and geospatial queries.
- Stripe Checkout with a signature-verified webhook; bookings are created only after confirmed payment and duplicate session deliveries are idempotent.
- Image uploads and resizing with Multer and Sharp.
- Welcome and password-reset emails processed by a BullMQ worker backed by Redis.
- OpenAPI documentation at `/api-docs`.
- Liveness and readiness endpoints for container orchestrators.
- Request IDs on responses to connect client reports with server logs.
- GitHub Actions build, test, and Docker image checks on Node.js 22 and 24.

## Requirements

- Node.js 22.12 or later (CI also checks Node.js 24).
- MongoDB.
- Redis for queued email processing.
- Stripe test or live keys for checkout and webhook handling.
- SMTP credentials for email delivery.
- Docker Compose is optional for running MongoDB, Redis, the API, and the worker together.

## Local setup

1. Install dependencies:

   ```sh
   npm ci
   ```

2. Create a local environment file and fill in the required values:

   ```sh
   cp .env.example .env
   ```

   Keep `.env` private and do not commit real credentials. `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `JWT_SECRET`, MongoDB settings, and SMTP settings must be configured for the features you use.

3. Start MongoDB and Redis, then run the API and email worker in separate terminals:

   ```sh
   npm run dev
   npm run dev:worker
   ```

4. Visit `http://localhost:3000` for the web app and `http://localhost:3000/api-docs` for the OpenAPI UI.

The service exposes `GET /health/live` for process liveness and `GET /health/ready` for MongoDB readiness. API error responses include a request ID; use that ID when correlating a report with application logs.

### Stripe webhook for local development

Configure Stripe to send `checkout.session.completed` events to:

```text
http://localhost:3000/webhook-checkout
```

For local testing, forward Stripe CLI events to that URL and set the CLI-provided signing secret as `STRIPE_WEBHOOK_SECRET`. The webhook expects the raw request body; do not place JSON body parsing before its route.

## Docker Compose

After creating and configuring `.env`, build and start the services:

```sh
npm run docker:up
```

Compose starts the API, a separate email worker, MongoDB, and Redis. Stop the services with:

```sh
npm run docker:down
```

The worker is a persistent process and must be deployed alongside the API for queued emails to be delivered. The Compose setup is the supported bundled deployment; a serverless-only deployment does not run the worker automatically.

## Build and tests

```sh
npm run build
npm test
```

Tests use Vitest and an in-memory MongoDB instance. They cover selected model and validation behavior, Stripe webhook signature/payment/idempotency handling, review ownership, administrative page access, and OpenAPI route definitions; they are not an exhaustive end-to-end suite.

GitHub Actions runs `npm ci`, `npm run build`, and `npm test` against Node.js 22 and 24.

## API overview

API routes require a bearer access token unless noted otherwise. The full route and parameter list is available from `/api-docs`.

### Users

- `POST /api/v1/users/signup` and `POST /api/v1/users/login` (public)
- `POST /api/v1/users/login/mfa` and `POST /api/v1/users/refresh-token` (public)
- `GET /api/v1/users/logout` (public)
- `POST /api/v1/users/forgotPassword` and `PATCH /api/v1/users/resetPassword/:token` (public)
- `PATCH /api/v1/users/updatePassword`
- `GET /api/v1/users/me`, `PATCH /api/v1/users/updateMe`, and `DELETE /api/v1/users/deleteMe`
- `GET /api/v1/users/logout-all`
- `GET /api/v1/users/sessions` and `DELETE /api/v1/users/sessions/:id`
- `POST /api/v1/users/mfa/setup`, `/mfa/enable`, and `/mfa/disable`
- `GET/POST /api/v1/users` and `GET/PATCH/DELETE /api/v1/users/:id` (admin or lead guide)

### Tours and reviews

- `GET/POST /api/v1/tours`; creating tours requires admin or lead-guide access.
- `GET/PATCH/DELETE /api/v1/tours/:id`; mutation requires admin or lead-guide access.
- `GET /api/v1/tours/tour-within/:distance/center/:latlng/unit/:unit`
- `GET /api/v1/tours/distances/:latlng/unit/:unit`
- `GET/POST /api/v1/tours/:tourId/reviews`
- `GET/PATCH/DELETE /api/v1/tours/:tourId/reviews/:id`
- `GET/POST /api/v1/reviews` and `GET/PATCH/DELETE /api/v1/reviews/:id`
- Review creation uses the authenticated user ID; nested review routes take the tour ID from the URL. Users can only edit or delete their own reviews, except administrators.

### Bookings and payments

- `GET /api/v1/bookings/checkout-session/:tourID` creates a Stripe Checkout Session for the authenticated user.
- `GET/POST /api/v1/bookings` and `GET/PATCH/DELETE /api/v1/bookings/:id` require admin or lead-guide access.
- `POST /webhook-checkout` is called by Stripe, not by clients. It verifies the Stripe signature, paid status, metadata, currency, and tour price before creating a booking. Repeated delivery for a Checkout Session does not create another booking.

## License

ISC. See `package.json`.
