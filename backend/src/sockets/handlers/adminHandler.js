const TeamRepository = require('../../repositories/teamRepository');
const teamRepo = new TeamRepository();

module.exports = (io, socket) => {
  // ESPULSIONE SQUADRA
  socket.on('kick_team', async (teamId) => {
    try {
      await teamRepo.resetInviteToken(teamId);
      io.emit('force_logout', { teamId: teamId });
      // Notifica tutti i client di ricaricare le squadre per ottenere il nuovo token
      io.emit('team_token_reset');
    } catch (error) {
      console.error('Errore nel reset del token durante il kick:', error);
    }
  });

  // DISCONNESSIONE
  socket.on('disconnect', () => {
    console.log(`🔴 Client disconnesso. ID: ${socket.id}`);
  });
};