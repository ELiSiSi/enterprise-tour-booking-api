# Enterprise Tour Booking API

Natours is an enterprise-grade tour booking web application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (User, Guide, Lead Guide, Admin).
- **Multi-Factor Authentication (MFA)**: Enhances security for user accounts.
- **Tours Management**: Complete CRUD operations for tours including geospatial queries.
- **Reviews & Ratings**: Users can leave reviews for tours they've booked.
- **Bookings & Payments**: Secure checkout with Stripe.
- **Security**: Data sanitization against NoSQL query injection & XSS, rate limiting, helmet headers, and parameter pollution prevention.
- **Dockerized**: Fully containerized with Docker and Docker Compose.
- **CI/CD**: GitHub Actions workflow for automated testing and building.

## Technologies Used

- **Backend**: Node.js, Express, TypeScript
- **Database**: MongoDB (Mongoose)
- **Payments**: Stripe
- **Authentication**: JWT, Speakeasy (MFA)
- **Views**: Pug
- **Testing**: Vitest, Supertest
- **Containerization**: Docker, Docker Compose

## Getting Started

### Prerequisites

- Node.js (v18+)
- MongoDB
- Docker (optional)
- Stripe Account (for payments)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/natours.git
   cd natours
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Update the variables with your actual credentials (MongoDB URI, Stripe keys, JWT secrets, Mailtrap).*

4. **Run the Application Locally**
   ```bash
   npm run dev
   ```

### Running with Docker

You can easily run the entire application stack (Node app + MongoDB + Redis) using Docker Compose:

```bash
npm run docker:up
```

*To stop the containers:*
```bash
npm run docker:down
```

## Testing

Run unit and integration tests using Vitest:

```bash
npm test
```

## Deployment

This project is configured for deployment on **Vercel** (`vercel.json` provided). 
Ensure you set your environment variables in the Vercel dashboard.

## Security and Enterprise Readiness
- **Robust Validation**: Enforced via Zod & Mongoose schemas.
- **Strict Typing**: Full TypeScript coverage reduces runtime errors.
- **Proper Permission Checks**: Securing user data and resources.

## License
MIT License
