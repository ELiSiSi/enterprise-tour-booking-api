# Enterprise Tour Booking API

![Node.js](https://img.shields.io/badge/Node.js-18.x-green)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue)
![Express](https://img.shields.io/badge/Express-4.x-lightgrey)
![MongoDB](https://img.shields.io/badge/MongoDB-6.x-brightgreen)
![Docker](https://img.shields.io/badge/Docker-Ready-blue)
![License](https://img.shields.io/badge/License-MIT-green)

An enterprise-grade, highly secure, and fully typed RESTful API for tour management and booking. Built with **Node.js, Express, TypeScript, and MongoDB**, this architecture serves as a solid foundation for scaleable booking platforms.

---

## 🌟 Key Features

- **Advanced Authentication**: JWT-based authentication (Access & Refresh tokens), session management, password resets via email, and **Multi-Factor Authentication (MFA)** using TOTP (Speakeasy).
- **Role-Based Access Control (RBAC)**: Fine-grained permissions for `user`, `guide`, `lead-guide`, and `admin`.
- **Complex Data Modeling**: Geospatial data for tour locations, referencing and populating, virtual properties, and document/query middlewares in Mongoose.
- **Geospatial Queries**: Find tours within a certain radius and calculate distances to tour start locations.
- **Payment Gateway Integration**: Secure checkout sessions utilizing **Stripe**.
- **Security First**: Protection against NoSQL Injection, XSS attacks, HTTP Parameter Pollution, brute force attacks (rate limiting, account locking), and secure HTTP headers via Helmet.
- **Validation**: Strict schema validation using **Zod** and Mongoose validators.
- **File Uploads & Image Processing**: Using `multer` and `sharp` to upload, resize, and format images on the fly.
- **Dockerized**: Contains Dockerfile and docker-compose for seamless setup.
- **CI/CD Pipeline**: Integrated GitHub Actions for automated unit testing (Vitest).

---

## 💻 Tech Stack

- **Backend Logic**: Node.js, Express.js, TypeScript
- **Database**: MongoDB, Mongoose
- **Security**: bcryptjs, jsonwebtoken, speakeasy, helmet, express-mongo-sanitize, xss-clean, hpp, express-rate-limit
- **Payments**: Stripe API
- **Emails**: Nodemailer, Mailtrap
- **Testing**: Vitest, Supertest
- **DevOps**: Docker, Docker Compose, GitHub Actions

---

## 🚀 API Documentation

The API endpoints are prefixed with `/api/v1`. 

### 🔐 Authentication & Users
- `POST /users/signup` - Register a new user
- `POST /users/login` - Login user (Returns JWT & checks MFA if enabled)
- `GET /users/logout` - Clear cookies and invalidate session
- `POST /users/forgotPassword` - Send password reset link to email
- `PATCH /users/resetPassword/:token` - Reset password using email token
- `PATCH /users/updatePassword` - Update password for logged-in user
- `POST /users/mfa/setup` - Generate MFA secret & QR Code
- `POST /users/mfa/enable` - Verify MFA code & activate MFA
- `POST /users/mfa/disable` - Disable MFA for logged-in user
- `POST /users/refresh-token` - Refresh access token
- `GET /users/sessions` - Get active sessions
- `DELETE /users/sessions/:id` - Revoke specific session
- `GET /users/me` - Get current logged-in user details
- `PATCH /users/updateMe` - Update user details (Name, Email, Profile Picture)
- `DELETE /users/deleteMe` - Soft delete user account
- `GET /users` - Get all users *(Admin only)*
- `GET/PATCH/DELETE /users/:id` - Manage specific user *(Admin only)*

### 🗺️ Tours
- `GET /tours` - Get all tours (Supports advanced filtering, sorting, pagination, & limiting)
- `POST /tours` - Create a new tour *(Admin/Lead Guide)*
- `GET /tours/:id` - Get a single tour (Populates reviews & guides)
- `PATCH /tours/:id` - Update a tour *(Admin/Lead Guide)*
- `DELETE /tours/:id` - Delete a tour *(Admin/Lead Guide)*
- `GET /tours/tour-within/:distance/center/:latlng/unit/:unit` - Geospatial query: Find tours within a radius
- `GET /tours/distances/:latlng/unit/:unit` - Geospatial aggregation: Calculate distances to all tours

### ⭐ Reviews
- `GET /tours/:tourId/reviews` - Get all reviews for a specific tour
- `POST /tours/:tourId/reviews` - Create a review for a tour *(User only)*
- `GET /reviews/:id` - Get a single review
- `PATCH /reviews/:id` - Update a review *(Owner/Admin)*
- `DELETE /reviews/:id` - Delete a review *(Owner/Admin)*

### 💳 Bookings
- `GET /bookings/checkout-session/:tourId` - Generate Stripe checkout session for a tour
- `GET /bookings` - Get all bookings *(Admin/Lead Guide)*
- `POST /bookings` - Create a booking manually *(Admin/Lead Guide)*
- `GET/PATCH/DELETE /bookings/:id` - Manage specific booking *(Admin/Lead Guide)*

---

## 🛠️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Local or Atlas)
- [Stripe Account](https://stripe.com/) (For payment functionality)
- [Mailtrap Account](https://mailtrap.io/) (For testing emails)
- Docker (Optional)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/enterprise-tour-booking-api.git
   cd enterprise-tour-booking-api
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the root directory based on `.env.example`:
   ```bash
   cp .env.example .env
   ```
   *Update the `.env` file with your MongoDB URI, JWT Secrets, Stripe Keys, and Mailtrap credentials.*

4. **Run the Development Server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

---

## 🐳 Running with Docker

To run the full stack (Node Application + MongoDB) isolated in containers:

1. **Start the containers in detached mode:**
   ```bash
   npm run docker:up
   ```
2. **Stop the containers:**
   ```bash
   npm run docker:down
   ```

---

## 🛡️ Security Implementations

- **Account Security:** Limits repeated login attempts to prevent brute-forcing. Accounts lock temporarily after 5 failed attempts.
- **JWT Tokens:** Uses secure, HTTP-only, SameSite cookies for tokens to prevent XSS and CSRF.
- **Data Sanitization:** `express-mongo-sanitize` removes `$` and `.` operators from requests.
- **XSS Protection:** `xss-clean` escapes malicious HTML/JS payloads.
- **Parameter Pollution:** `hpp` clears query string manipulation.
- **Rate Limiting:** Prevents DDoS by restricting requests from the same IP.
- **Review Ownership:** Explicit checks prevent users from deleting/modifying reviews they did not write.

---

## 🧪 Testing

The API has unit tests for key models and middlewares using **Vitest**.

Run the test suite:
```bash
npm test
```
Run tests in watch mode:
```bash
npm run test:watch
```

---

## ☁️ Deployment

The project includes a `vercel.json` file optimized for serverless deployment on [Vercel](https://vercel.com).
To deploy:
1. Push code to GitHub.
2. Import repository on Vercel.
3. Configure Environment Variables in the Vercel dashboard.
4. Deploy!

---

## 📄 License
This project is licensed under the MIT License.
