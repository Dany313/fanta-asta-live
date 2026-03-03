// File: server.js
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();
const query = require('./src/queries');

const app = require('./src/app');
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

console.log(query.query);
console.log(query.query2);

// 🌟 MAGIA: Importiamo il modulo dei socket e gli passiamo la nostra istanza 'io'
require('./src/sockets/socketHandler')(io);

// 🌟 AVVIAMO PRIMA IL DB E POI IL SERVER HTTP
initializeDatabase().then(() => {
  server.listen(port, () => {
    console.log(`🚀 Server in ascolto su http://localhost:${port}`);
    console.log(`⚡ Motore Socket.io pronto...`);
  });
});