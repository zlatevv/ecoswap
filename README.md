# 🌿 EcoSwap

<div align="center">

### A full-stack marketplace for swapping items instead of throwing them away.

![Java](https://img.shields.io/badge/Backend-Java%2021-007396?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![React](https://img.shields.io/badge/Frontend-React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=0D1117)
![Vite](https://img.shields.io/badge/Bundler-Vite%208-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![MySQL](https://img.shields.io/badge/Database-MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![RabbitMQ](https://img.shields.io/badge/Messaging-RabbitMQ-FF6600?style=for-the-badge&logo=rabbitmq&logoColor=white)

</div>

---

## ✨ What this project does

**EcoSwap** helps people exchange products with each other and reduce waste.

Users can:
- Create an account and sign in securely (JWT auth).
- List products (including image upload support via Cloudinary).
- Browse and manage available items.
- Send and receive swap requests.
- Receive notifications when important events happen.

Admins can:
- Access admin-only management endpoints.
- Oversee platform activity.

Under the hood, the app uses an asynchronous notification pipeline:
- The **Spring Boot backend** publishes notification events.
- **RabbitMQ** queues the events.
- A dedicated **Node.js email service** consumes messages and sends emails with Nodemailer.

---

## 🧱 Architecture

```text
React (Vite) SPA  --->  Spring Boot API  --->  MySQL
                             |
                             v
                          RabbitMQ  --->  Node Email Service (Nodemailer/Gmail)
```

### Project structure

```bash
.
├── backend/        # Spring Boot REST API
├── frontend/       # React + Vite client app
├── email-service/  # RabbitMQ consumer for outgoing emails
└── docker-compose.yml
```

---

## 🚀 Run locally (recommended: Docker)

### 1) Prerequisites
- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/)

### 2) Create a `.env` file in the project root

Use this template (replace with your real values):

```env
# Database
DB_USERNAME=root
DB_PASSWORD=your_mysql_password

# JWT
JWT_SECRET=your_long_random_secret
JWT_EXPIRATION=86400000

# Cloudinary
CLOUD_NAME=your_cloud_name
CLOUD_API_KEY=your_cloud_api_key
CLOUD_API_SECRET=your_cloud_api_secret

# RabbitMQ
RABBITMQ_USER=guest
RABBITMQ_PASS=guest

# Email (Gmail or app password)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
```

### 3) Start all services

```bash
docker compose up --build
```

### 4) Open the app

- Frontend: http://localhost
- Backend API: http://localhost:8080
- RabbitMQ UI: http://localhost:15672
- MySQL: localhost:3307

---

## 🧑‍💻 Run locally without Docker (manual)

If you prefer to run each service yourself:

### Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

The backend reads configuration from environment variables (DB, JWT, Cloudinary).

### Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

### Email service (Node.js)

```bash
cd email-service
npm install
node index.js
```

> You must have RabbitMQ and MySQL running separately in this mode.

---

## 🔐 Environment variables overview

| Variable | Used by | Purpose |
|---|---|---|
| `DB_USERNAME`, `DB_PASSWORD` | backend, mysql | MySQL authentication |
| `SPRING_DATASOURCE_URL` | backend | JDBC URL (provided by compose by default) |
| `JWT_SECRET`, `JWT_EXPIRATION` | backend | Token signing and TTL |
| `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET` | backend | Image upload integration |
| `RABBITMQ_USER`, `RABBITMQ_PASS` | backend, rabbitmq | Broker credentials |
| `RABBITMQ_URL` | email-service | AMQP connection string |
| `EMAIL_USER`, `EMAIL_PASS` | email-service | SMTP credentials for notifications |

---

## 🛠️ Tech stack

- **Frontend:** React 19, React Router, Axios, Tailwind CSS, Vite
- **Backend:** Spring Boot 3, Spring Security, Spring Data JPA, JWT, OpenAPI
- **Data:** MySQL 8
- **Messaging:** RabbitMQ
- **Notifications:** Node.js + Nodemailer
- **Deployment (local):** Docker Compose

---

## 📌 Notes

- Default compose setup maps:
  - frontend → port **80**
  - backend → port **8080**
  - mysql → port **3307**
  - rabbitmq management → port **15672**
- Never commit real secrets to GitHub; use `.env` and secret managers in production.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Open a pull request

---

## 📄 License

Add your preferred license file (MIT, Apache-2.0, etc.) and update this section.
