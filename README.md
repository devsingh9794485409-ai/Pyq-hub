# 📚 PYQ Hub

A full-stack web application where students can upload, browse, and download **Previous Year Question Papers (PYQs)** organized by semester and subject.

---

## 🚀 Tech Stack

**Frontend**
- React + Vite
- React Router v6
- Axios

**Backend**
- Node.js + Express
- MongoDB (Mongoose)
- Cloudinary (file storage)
- JWT Authentication

---

## 📁 Project Structure

```
pyq-hub/
├── backend/          # Express API server
│   ├── config/       # DB & Cloudinary config
│   ├── controllers/  # Route controllers
│   ├── middleware/   # Auth, error, upload middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   ├── seed/         # Database seeding scripts
│   └── utils/        # Helpers & utilities
│
└── frontend/         # React + Vite app
    └── src/
        ├── api/          # Axios API calls
        ├── components/   # Reusable UI components
        ├── context/      # React Context (Auth)
        ├── hooks/        # Custom hooks
        ├── pages/        # Page components
        └── utils/        # Formatting helpers
```

---

## ⚙️ Setup & Installation

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- Cloudinary account

### 1. Clone the repository
```bash
git clone https://github.com/devsingh9794485409-ai/Pyq-hub.git
cd Pyq-hub
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env   # Fill in your values
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `CLOUDINARY_CLOUD_NAME` | Your Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS |

### Frontend (`frontend/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

See `.env.example` files in each folder for reference.

---

## 📜 License

MIT
