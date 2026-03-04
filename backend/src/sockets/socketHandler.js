// File: src/sockets/socketHandler.js
const registerAuctionHandlers = require('./handlers/auctionHandler');
const registerAdminHandlers = require('./handlers/adminHandler');

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🟢 Nuovo client connesso! ID: ${socket.id}`);

    // Registriamo gli handler specifici
    registerAuctionHandlers(io, socket);
    registerAdminHandlers(io, socket);
  });
};