// File: server.js
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
// File: src/app.js
const express = require('express');
const cors = require('cors');

// Importiamo le nostre rotte
const authRoutes = require('./src/routes/authRoutes');
const playerRoutes = require('./src/routes/playerRoutes');
const teamRoutes = require('./src/routes/teamRoutes');
const rosterRoutes = require('./src/routes/rosterRoutes');
const leagueRoutes = require('./src/routes/leagueRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// --- ROTTE DI BASE ---
app.get('/', (req, res) => {
  res.send('⚽ Server Asta Fantacalcio Online e Funzionante!');
});

// --- REGISTRAZIONE DELLE ROTTE API ---
// Diciamo a Express: "Tutte le richieste che iniziano con /api/players, passale a playerRoutes"
app.use('/api', authRoutes); // authRoutes gestisce già /login, quindi diventerà /api/login
app.use('/api/players', playerRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/rosters', rosterRoutes);
app.use('/api/leagues', leagueRoutes);
const initializeDatabase = require('./src/config/setupDb'); // 🌟 IMPORTIAMO LO SCRIPT

const port = process.env.PORT || 3000;

// Creiamo il server HTTP usando l'app Express
const server = http.createServer(app);

// Inizializziamo Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// 🌟 MAGIA: Importiamo il modulo dei socket e gli passiamo la nostra istanza 'io'
require('./src/sockets/socketHandler')(io);

// 🌟 AVVIAMO PRIMA IL DB E POI IL SERVER HTTP
initializeDatabase().then(() => {
  server.listen(port, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${port}`);
    console.log(`⚡ Motore Socket.io pronto...`);
  });
});