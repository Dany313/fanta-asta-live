// File: src/sockets/socketHandler.js
const db = require('../config/db');

// 🌟 STATO GLOBALE DELL'ASTA IN CORSO (La nostra "Coda" in memoria)
let activeAuction = {
  player: null,
  highestBid: 0,
  highestBidderId: null,
  highestBidderName: null,
  history: [], // Il log delle puntate: { teamName, amount, time }
  teamBudgets: {} // Es: { '1': 500, '2': 350 } - Per validazioni istantanee
};

module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log(`🟢 Nuovo client connesso! ID: ${socket.id}`);

    // 1. INIZIO ASTA (chiamato dall'Admin)
    socket.on('start_auction', async (playerData) => {
      try {
        // Scarichiamo i budget aggiornati dal DB per la validazione veloce
        const teamsQuery = await db.query(`SELECT id, name, remaining_budget FROM teams`);
        const budgets = {};
        teamsQuery.rows.forEach(t => {
          budgets[t.id] = t.remaining_budget;
        });

        // Resettiamo lo stato in memoria per il nuovo giocatore
        activeAuction = {
          player: playerData,
          highestBid: playerData.initial_price || 1, // Partiamo dalla base d'asta
          highestBidderId: null,
          highestBidderName: null,
          history: [],
          teamBudgets: budgets
        };

        // Avvisiamo tutti che l'asta è iniziata, passando lo stato iniziale!
        io.emit('auction_started', activeAuction);
        console.log(`🔨 Asta iniziata per ${playerData.name} a ${activeAuction.highestBid} crediti.`);
      } catch (error) {
        console.error("Errore avvio asta:", error);
      }
    });

    // 2. RICEZIONE PUNTATA (Da Admin o Viewer)
    // Poiché Node.js esegue questo blocco in modo sincrono per ogni evento,
    // è impossibile che due puntate si sovrappongano causando race conditions.
    socket.on('place_bid', (bidData) => {
      // bidData = { teamId, teamName, amount }

      // A. Controlli di base
      if (!activeAuction.player) {
        return socket.emit('bid_error', { message: 'Nessuna asta in corso!' });
      }

      // B. Controllo "Coda": L'offerta è maggiore della massima attuale?
      if (bidData.amount <= activeAuction.highestBid) {
        return socket.emit('bid_error', { message: 'Offerta già superata da un altro giocatore!' });
      }

      // C. Controllo Budget in memoria (istantaneo, nessuna attesa del DB!)
      const maxBudget = activeAuction.teamBudgets[bidData.teamId] || 0;
      if (bidData.amount > maxBudget) {
        return socket.emit('bid_error', { message: `Non hai abbastanza crediti! (Max: ${maxBudget})` });
      }

      // 🌟 D. PUNTATA VALIDA! Aggiorniamo lo stato
      activeAuction.highestBid = bidData.amount;
      activeAuction.highestBidderId = bidData.teamId;
      activeAuction.highestBidderName = bidData.teamName;

      // Aggiungiamo al Log cronologico (inseriamo in testa all'array per mostrare la più recente per prima)
      const logEntry = {
        teamName: bidData.teamName,
        amount: bidData.amount,
        time: new Date().toLocaleTimeString('it-IT')
      };
      activeAuction.history.unshift(logEntry);

      // E. Avvisiamo TUTTI i tabelloni della nuova offerta!
      io.emit('auction_update', {
        highestBid: activeAuction.highestBid,
        highestBidderName: activeAuction.highestBidderName,
        history: activeAuction.history
      });
      
      console.log(`💰 ${bidData.teamName} rilancia a ${bidData.amount} per ${activeAuction.player.name}`);
    });

    // 3. ASSEGNAZIONE DEFINITIVA (Chiamata dall'Admin)
    socket.on('assign_player', async () => {
      // Usiamo i dati che abbiamo gelosamente custodito in RAM
      const winnerId = activeAuction.highestBidderId;
      const finalPrice = activeAuction.highestBid;
      const player = activeAuction.player;

      if (!winnerId || !player) {
        return socket.emit('assign_error', { message: "Nessuna offerta ricevuta o asta non valida!" });
      }

      try {
        // ... (MANTIENI I CONTROLLI SUI RUOLI CHE AVEVI GIA' SCRITTO) ...
        const rosterQuery = await db.query(
          `SELECT p.role FROM rosters r JOIN players p ON r.player_id = p.id WHERE r.team_id = $1`,
          [winnerId]
        );
        const currentRoster = rosterQuery.rows;
        const limits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
        const roleCount = currentRoster.filter(p => p.role === player.role).length;

        if (roleCount >= limits[player.role]) {
          return socket.emit('assign_error', { message: `Limite ruolo raggiunto per questa squadra!` });
        }

        // Il controllo del budget base (1 credito per slot mancante)
        const emptySlotsAfterPurchase = 25 - (currentRoster.length + 1); 
        const minimumRequiredBudget = emptySlotsAfterPurchase * 1; 
        const currentBudgetDB = activeAuction.teamBudgets[winnerId];

        if ((currentBudgetDB - finalPrice) < minimumRequiredBudget) {
          return socket.emit('assign_error', { message: `Budget insufficiente per completare la rosa!` });
        }

        // --- TRANSAZIONE DB ---
        await db.query('BEGIN');
        await db.query(
          `INSERT INTO rosters (team_id, player_id, purchase_price) VALUES ($1, $2, $3)`, 
          [winnerId, player.id, finalPrice]
        );
        await db.query(
          `UPDATE teams SET remaining_budget = remaining_budget - $1 WHERE id = $2`, 
          [finalPrice, winnerId]
        );
        await db.query('COMMIT');

        // Avvisiamo tutti e svuotiamo l'asta in RAM
        io.emit('player_assigned', { 
          success: true, 
          data: { 
            playerId: player.id, 
            playerName: player.name, 
            playerRole: player.role,
            teamId: winnerId, 
            price: finalPrice 
          } 
        });

        // Resettiamo l'asta
        activeAuction = { player: null, highestBid: 0, highestBidderId: null, history: [], teamBudgets: {} };

      } catch (error) {
        await db.query('ROLLBACK');
        socket.emit('assign_error', { message: 'Errore interno durante il salvataggio!' });
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