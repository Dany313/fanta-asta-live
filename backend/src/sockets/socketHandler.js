// File: src/sockets/socketHandler.js
const db = require('../config/db'); // Il DB ci serve qui per salvare gli acquisti

module.exports = (io) => {
  
  // Quando qualcuno (Admin o Viewer) si connette...
  io.on('connection', (socket) => {
    console.log(`🟢 Nuovo client connesso! ID: ${socket.id}`);

    // 1. INIZIO ASTA
    socket.on('start_auction', (playerData) => {
      io.emit('auction_started', playerData);
    });

    // 2. ASSEGNAZIONE GIOCATORE (Con validazione DB)
    socket.on('assign_player', async (assignmentData) => {
      try {
        // A. Controllo Ruoli
        const rosterQuery = await db.query(
          `SELECT p.role FROM rosters r JOIN players p ON r.player_id = p.id WHERE r.team_id = $1`,
          [assignmentData.teamId]
        );
        const currentRoster = rosterQuery.rows;
        const limits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
        const roleCount = currentRoster.filter(p => p.role === assignmentData.playerRole).length;

        if (roleCount >= limits[assignmentData.playerRole]) {
          return socket.emit('player_assigned', { success: false, message: `Limite ruolo ${assignmentData.playerRole} raggiunto!` });
        }

        // B. Controllo Budget
        const teamQuery = await db.query(`SELECT remaining_budget FROM teams WHERE id = $1`, [assignmentData.teamId]);
        const currentBudget = teamQuery.rows[0].remaining_budget;
        const emptySlotsAfterPurchase = 25 - (currentRoster.length + 1); 
        const minimumRequiredBudget = emptySlotsAfterPurchase * 1; 

        if ((currentBudget - assignmentData.price) < minimumRequiredBudget) {
          return socket.emit('player_assigned', { success: false, message: `Budget insufficiente! Servono almeno ${minimumRequiredBudget} crediti residui.` });
        }

        // C. Transazione DB
        await db.query('BEGIN');
        await db.query(
          `INSERT INTO rosters (team_id, player_id, purchase_price) VALUES ($1, $2, $3)`, 
          [assignmentData.teamId, assignmentData.playerId, assignmentData.price]
        );
        await db.query(
          `UPDATE teams SET remaining_budget = remaining_budget - $1 WHERE id = $2`, 
          [assignmentData.price, assignmentData.teamId]
        );
        await db.query('COMMIT');

        // D. Avvisiamo tutti del successo
        io.emit('player_assigned', { success: true, data: assignmentData });
        
      } catch (error) {
        await db.query('ROLLBACK');
        if (error.code === '23505') {
           socket.emit('player_assigned', { success: false, message: 'Questo giocatore è già stato assegnato!' });
        } else {
           socket.emit('player_assigned', { success: false, message: 'Errore interno.' });
        }
      }
    });

    // 3. ESPULSIONE SQUADRA
    socket.on('kick_team', (teamId) => {
      io.emit('force_logout', { teamId: teamId });
    });

    // 4. DISCONNESSIONE
    socket.on('disconnect', () => {
      console.log(`🔴 Client disconnesso. ID: ${socket.id}`);
    });
    
  });
};