const express = require('express');
const { VoiceResponse } = require('twilio').twiml;
const axios = require('axios');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const Product = require('./models/Product');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const GEMINI_API_KEY = 'AIzaSyAIMiWAW0VvxDReT59IiOZu6MsFOoGIcvs';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

mongoose.connect('mongodb://localhost:27017/catalog')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Start the voice call
app.post('/voice', (req, res) => {
  const twiml = new VoiceResponse();

  const gather = twiml.gather({
    input: 'speech',
    action: '/process-speech',
    method: 'POST',
    timeout: 5,
    speechTimeout: 'auto'
  });

  gather.say("Namaste! Welcome to the Smart Catalog Assistant. I can help you build your product catalog by collecting product name, price, quantity, and category. You can also ask me questions about what I can do. How would you like to begin?");

  res.type('text/xml').send(twiml.toString());
});

// Handle speech input
app.post('/process-speech', async (req, res) => {
  const userSpeech = req.body.SpeechResult;
  const twiml = new VoiceResponse();

  if (!userSpeech) {
    twiml.say("Sorry, I didn't hear anything. Let's try again.");
    twiml.redirect('/voice');
    return res.type('text/xml').send(twiml.toString());
  }

  console.log('User said:', userSpeech);

  // Exit condition
  if (/\b(no|nothing else|that's all|done|exit|stop|thank you)\b/i.test(userSpeech)) {
    twiml.say("Thank you for using the Smart Catalog Assistant. Goodbye!");
    return res.type('text/xml').send(twiml.toString());
  }

  const geminiPrompt = `
You're a helpful voice assistant for small business owners. Respond conversationally if the user asks a general question.

If the user provides product information, extract:
- name
- price
- quantity
- category (e.g., vegetable, chocolate, electronics)
- description (a short, salesy sentence)

Respond ONLY in this JSON format if product info is detected:
{"name": "...", "price": "...", "quantity": "...", "category": "...", "description": "..."}

Never say you are an AI. Never explain your capabilities. Stay in character as a human-like assistant.
`;

  try {
    const geminiResponse = await axios.post(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      contents: [{
        parts: [
          { text: geminiPrompt },
          { text: `User said: "${userSpeech}"` }
        ]
      }]
    });

    const rawReply = geminiResponse.data.candidates[0].content.parts[0].text.trim();
    console.log('Gemini raw reply:', rawReply);

    const cleaned = rawReply.replace(/```json|```/g, '').trim();

    let product;
    let isJson = false;

    try {
      product = JSON.parse(cleaned);
      isJson = product.name || product.price || product.quantity;
    } catch (_) {
      isJson = false;
    }

    if (isJson) {
      await Product.create(product);
      console.log('✅ Product saved to database:', product);

      twiml.say(
        `Got it! I've added ${product.name}, priced at ${product.price}, quantity: ${product.quantity}, category: ${product.category}. Here's how we describe it: ${product.description}`
      );

      const gather = twiml.gather({
        input: 'speech',
        action: '/process-speech',
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto'
      });
      gather.say("Would you like to add another product?");

    } else {
      twiml.say(cleaned);
      const gather = twiml.gather({
        input: 'speech',
        action: '/process-speech',
        method: 'POST',
        timeout: 5,
        speechTimeout: 'auto'
      });
    }

    res.type('text/xml').send(twiml.toString());
  } catch (err) {
    console.error('Gemini error:', err.response?.data || err.message);
    twiml.say("Sorry, there was a problem. Let's try again.");
    twiml.redirect('/voice');
    res.type('text/xml').send(twiml.toString());
  }
});

app.listen(1337, () => console.log('Catalog Assistant running at http://127.0.0.1:1337'));
