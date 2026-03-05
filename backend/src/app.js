// File: src/app.js
const express = require('express');
const cors = require('cors');

// Importiamo le nostre rotte
const authRoutes = require('./routes/authRoutes');
const playerRoutes = require('./routes/playerRoutes');
const teamRoutes = require('./routes/teamRoutes');
const rosterRoutes = require('./routes/rosterRoutes');
const leagueRoutes = require('./routes/leagueRoutes');

const app = express();

// --- MIDDLEWARES GLOBALI ---
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

module.exports = app;