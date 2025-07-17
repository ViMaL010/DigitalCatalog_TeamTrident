# VendorCare – Voice-Based Inventory Assistant

VendorCare is a voice-driven AI assistant built for farmers and small shop owners to manage product inventory using natural language. It leverages Twilio Voice, Google Gemini, and MongoDB to enable real-time voice-based interaction and cataloging.

---

## 🚀 Features

- 📞 Voice input via **Twilio Voice**
- 🧠 Natural language understanding using **Google Gemini**
- 🗣️ Voice responses with **ElevenLabs**
- 🧾 Stores structured inventory data using **MongoDB**
- 📦 Inventory schema: name, price, quantity, category, description
- 💬 Real-time voice-to-text extraction and intent classification
- ⚙️ Backend with **Node.js + Express** and **Mongoose**


---

## 🛠️ Tech Stack

- **Frontend:** React.js, Vite, Tailwind CSS
- **Backend:** Node.js, Express.js, Mongoose
- **Database:** MongoDB
- **Voice Input:** Twilio Voice API
- **LLM:** Google Gemini API
- **Voice Output:** ElevenLabs Text-to-Speech API

---

## 📦 Installation

### 1. Clone the repo

```bash
git clone https://github.com/your-username/vendorcare-ai.git
cd hackathon
```

### 2. Install backend dependencies

```bash
npm install
```

### 3. Setup .env for API keys

```bash
TWILIO_AUTH_TOKEN=your_token
TWILIO_ACCOUNT_SID=your_sid
GEMINI_API_KEY=your_key
ELEVENLABS_API_KEY=your_key
MONGODB_URI=your_mongodb_uri
```
### 4. Start the server

```bash 
node index.js
```

### 📄 Inventory Schema (MongoDB)

```bash
{
  name: String,
  price: String,
  quantity: String,
  category: String,
  description: String
}
```

## 🏆 Built At
- Winner of 🥇 Hackfinity 2025 – National Innovation Sprint at SIMATS, Chennai
- MVP built and deployed in under 20 hours.