<p align="center">
 <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1 align="center">
   nest-demo
</h1>

<p align="center">A simple Nest.js boilerplate</p>

## Description

- This project implements basic authentication, authorization, and role-based access control (RBAC) using Nest.js, Prisma and PostgresSQL. Additional features include:
  
  - ✅ Two step verification using authenticators and passkeys,
  - ✅ Push notification,
  - ✅ Tracking user's activity.

## Tools Used

- **[@nestjs/config](https://www.npmjs.com/package/@nestjs/config)**: Configuration module for Nest based on the dotenv (to load process environment variables) package. 
**[@nestjs-modules/mailer](https://www.npmjs.com/package/@nestjs-modules/mailer)**: A mailer module for Nest framework (node.js) using Nodemailer library.
- **[@nestjs/jwt](https://www.npmjs.com/package/@nestjs/jwt)**: JWT utilities module for Nest based on the jsonwebtoken package.
- **[@nestjs/passport](https://www.npmjs.com/package/@nestjs/passport)**: Passport utilities module for Nest.
- **[@nestjs/swagger](https://www.npmjs.com/package/@nestjs/swagger)**: OpenAPI (Swagger) module for Nest.
- **[@simplewebauthn/server](https://www.npmjs.com/package/@simplewebauthn/server)**: Library that help reduce the amount of work needed to incorporate WebAuthn into a website.
- **[firebase-admin](https://www.npmjs.com/package/firebase-admin)**: Firebase Admin Node.js SDK.
- **[bullmq](https://www.npmjs.com/package/bullmq)**: The fastest, most reliable, Redis-based distributed queue for Node.
- **[joi](https://www.npmjs.com/package/joi)**: The most powerful schema description language and data validator for JavaScript.


## Installation and Usage

To use this project, follow these steps:

1. Clone the repository:
    ```bash
    git clone https://github.com/besufikad17/nest-demo.git
    cd nest-demo
    ```
2. Install packages:
    ```bash
    npm install
    ```

3. Set up environment variables in the `.env` file.
    ```.env
    DATABASE_URL=
    FIREBASE_APPLICATION_TYPE=
    FIREBASE_AUTH_URI=
    FIREBASE_AUTH_CERT_URL=
    FIREBASE_CLIENT_CERT_URL=
    FIREBASE_CLIENT_ID=
    FIREBASE_PROJECT_ID=
    FIREBASE_PRIVATE_ID=
    FIREBASE_PRIVATE_KEY=
    FIREBASE_TOKEN_URI=
    FIREBASE_UNIVERSE_DOMAIN=
    GOOGLE_CLIENT_ID=
    GOOGLE_CLIENT_SECRET=
    GOOGLE_CALLBACK_URL=
    JWT_SECRET=
    MAIL_HOST=
    MAIL_PORT=
    MAIL_SECURE=
    MAIL_USER=
    MAIL_PASS=
    MAIL_FROM=
    PORT=
    REDIS_PORT=
    REDIS_HOST=
    ```

4. Migrate the database schema:
    ```bash
    npx prisma migrate dev
    ```

5. Seed the database:
    ```bash
    npm run seed
    ```

6. Run the application:
    ```bash
    npm run start:dev    
    ```

7. Access the API documentation at `http://127.0.0.1:PORT/api/docs`.

**⚠️ Note**: Make sure to run the seed script since roles need to be added first before registration.