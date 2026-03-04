module.exports = (io, socket) => {
  // ESPULSIONE SQUADRA
  socket.on('kick_team', (teamId) => {
    io.emit('force_logout', { teamId: teamId });
  });

  // DISCONNESSIONE
  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnesso. ID: ${socket.id}`);
  });
};