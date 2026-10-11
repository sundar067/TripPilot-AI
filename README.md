# ✈️ TripPilot-AI

**AI-Powered Travel Planning Platform**

TripPilot-AI is a travel planning platform built using the MERN stack. It helps users explore Indian states and destinations, plan trips, and get travel assistance through an AI-powered chatbot.

## 🚀 Features

- 🏞️ Explore Indian states and tourist destinations
- 🔍 Search and filter destinations
- 🤖 AI-powered travel chatbot
- 🧳 Create and manage trip plans
- ❤️ Save destinations to a wishlist
- 📍 Discover nearby attractions
- 👤 User authentication and profile management
- 🔔 Real-time notifications
- 🛡️ Admin dashboard for managing users, states, destinations, and attractions
- 📊 Dashboard analytics

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **AI:** Groq API
- **Real-Time Communication:** Socket.IO
- **Media Management:** Cloudinary
- **Version Control:** Git and GitHub

## 📁 Project Structure

```text
TripPilot-AI/
├── client/          # React frontend
├── server/          # Node.js and Express backend
└── .gitignore
```

## ⚙️ Installation

**1. Clone the repository**

```bash
git clone https://github.com/sundar067/TripPilot-AI.git
cd TripPilot-AI
```

**2. Install backend dependencies**

```bash
cd server
npm install
```

**3. Install frontend dependencies**

Open a new terminal in the project root and run:

```bash
cd client
npm install
```

## 🔐 Environment Variables

Create a `server/.env` file and add the environment variables required by your application.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
GROQ_API_KEY=your_groq_api_key
```

Add any other required credentials according to your project configuration.

**Security:** Never upload `.env` files, API keys, or database credentials to GitHub.

## ▶️ Run Locally

**Start the backend:**

Run the start command defined in `server/package.json`, for example:

```bash
npm start
```

**Start the frontend** in a separate terminal:

```bash
cd client
npm run dev
```

Open the local URL displayed by Vite in your terminal.

## 👨‍💻 Author

**Sundar Singh**

GitHub: [@sundar067](https://github.com/sundar067)

**Repository:** [TripPilot-AI](https://github.com/sundar067/TripPilot-AI)

---

*✈️ TripPilot-AI — Your Journey, Intelligently Planned.*
