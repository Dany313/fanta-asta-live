const db = require('../../config/db');
const BidDto = require('../../dtos/BidDto'); // Assicurati che il path corrisponda alla tua struttura (dtos o dto)
const AuctionStateDto = require('../../dtos/AuctionStateDto');
const TeamMapper = require('../../mappers/TeamMapper');
const { activeAuction, resetAuction } = require('./auctionState');

module.exports = (io, socket) => {
  
  // 0. SYNC STATO INIZIALE
  socket.on('sync_auction', () => {
    const stateDto = new AuctionStateDto(
      activeAuction.player, 
      activeAuction.highestBid, 
      activeAuction.highestBidderName, 
      activeAuction.history,
      activeAuction.isSessionActive,
      activeAuction.teamRoleCounts
    );
    // Inviamo sempre lo stato (che contiene isSessionActive)
    socket.emit('auction_sync_data', stateDto);
  });

  // 0.5 AVVIO SESSIONE ASTA (Da TeamsPage)
  socket.on('start_session', () => {
    activeAuction.isSessionActive = true;
    io.emit('session_status_changed', { isSessionActive: true });
    console.log(`🟢 Sessione d'asta APERTA dall'Admin`);
  });

  // 1a. INIZIO ASTA ADMIN (Offerta iniziale 0)
  socket.on('start_auction_admin', async (playerData) => {
    try {
      const teamsQuery = await db.query(`SELECT id, name, remaining_budget, max_possible_bid FROM teams`);
      const teams = teamsQuery.rows.map(TeamMapper.toEntity);
      
      const rostersQuery = await db.query(`
        SELECT r.team_id, p.role, COUNT(*) as count
        FROM rosters r
        JOIN players p ON r.player_id = p.id
        GROUP BY r.team_id, p.role
      `);
      
      const roleCounts = {};
      rostersQuery.rows.forEach(row => {
        if (!roleCounts[row.team_id]) roleCounts[row.team_id] = { P: 0, D: 0, C: 0, A: 0 };
        roleCounts[row.team_id][row.role] = parseInt(row.count, 10);
      });

      const budgets = {};
      const maxBids = {};
      
      teams.forEach(t => {
        budgets[t.id] = t.remainingBudget;
        maxBids[t.id] = t.maxPossibleBid;
        if (!roleCounts[t.id]) roleCounts[t.id] = { P: 0, D: 0, C: 0, A: 0 };
      });

      // Reset e inizializzazione stato
      resetAuction();
      activeAuction.player = playerData;
      activeAuction.teamBudgets = budgets;
      activeAuction.maxPossibleBids = maxBids;
      activeAuction.teamRoleCounts = roleCounts;

      const stateDto = new AuctionStateDto(
        activeAuction.player, 
        activeAuction.highestBid, 
        activeAuction.highestBidderName, 
        activeAuction.history,
        activeAuction.isSessionActive,
        activeAuction.teamRoleCounts
      );
      io.emit('auction_started', stateDto);
      console.log(`🔨 Asta iniziata (Admin) per ${playerData.name}`);
    } catch (error) {
      console.error("Errore avvio asta Admin:", error);
    }
  });

  // 1b. INIZIO ASTA VIEWER (Offerta iniziale 1)
  socket.on('start_auction_viewer', async ({ player, teamId, teamName }) => {
    try {
      const teamsQuery = await db.query(`SELECT id, name, remaining_budget, max_possible_bid FROM teams`);
      const teams = teamsQuery.rows.map(TeamMapper.toEntity);
      
      const budgets = {};
      const maxBids = {};
      
      teams.forEach(t => {
        budgets[t.id] = t.remainingBudget;
        maxBids[t.id] = t.maxPossibleBid;
      });

      // Reset e inizializzazione stato
      resetAuction();
      activeAuction.player = player;
      activeAuction.teamBudgets = budgets;
      activeAuction.maxPossibleBids = maxBids;

      // Imposta offerta automatica a 1 per il viewer
      activeAuction.highestBid = 1;
      activeAuction.highestBidderId = Number(teamId);
      activeAuction.highestBidderName = teamName;
      const now = new Date();
      activeAuction.history.unshift({
        teamName: teamName,
        amount: 1,
        time: `${now.toLocaleTimeString('it-IT')}.${now.getMilliseconds().toString().padStart(3, '0')}`
      });

      const stateDto = new AuctionStateDto(
        activeAuction.player, 
        activeAuction.highestBid, 
        activeAuction.highestBidderName, 
        activeAuction.history,
        activeAuction.isSessionActive,
        activeAuction.teamRoleCounts
      );
      io.emit('auction_started', stateDto);
      console.log(`🔨 Asta iniziata (Viewer) per ${player.name} da ${teamName}`);
    } catch (error) {
      console.error("Errore avvio asta Viewer:", error);
    }
  });

  // 2. RICEZIONE PUNTATA
  socket.on('place_bid', (rawBidData) => {
    const bidDto = new BidDto(rawBidData.teamId, rawBidData.teamName, rawBidData.amount);

    if (!activeAuction.player) {
      return socket.emit('bid_error', { message: 'Nessuna asta in corso!' });
    }

    if (bidDto.amount <= activeAuction.highestBid) {
      return socket.emit('bid_error', { message: 'Qualcuno ha puntato prima di te!' });
    }

    const maxBudget = activeAuction.teamBudgets[bidDto.teamId] || 0;
    const maxPossibleBid = activeAuction.maxPossibleBids[bidDto.teamId] || 500;
    
    // Controlli budget
    if (bidDto.amount > maxPossibleBid) {
      return socket.emit('bid_error', { message: `Offerta supera il limite massimo (${maxPossibleBid})` });
    }
    if (bidDto.amount > maxBudget) {
      return socket.emit('bid_error', { message: `Crediti insufficienti (${maxBudget})` });
    }

    // Controllo limiti ruolo
    const playerRole = activeAuction.player.role;
    const roleLimits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
    const currentCount = (activeAuction.teamRoleCounts[bidDto.teamId] && activeAuction.teamRoleCounts[bidDto.teamId][playerRole]) || 0;
    
    if (currentCount >= roleLimits[playerRole]) {
      return socket.emit('bid_error', { message: `Hai già raggiunto il limite di ${roleLimits[playerRole]} giocatori per il ruolo ${playerRole}` });
    }

    // Aggiornamento stato
    activeAuction.highestBid = bidDto.amount;
    activeAuction.highestBidderId = bidDto.teamId;
    activeAuction.highestBidderName = bidDto.teamName;

    const now = bidDto.timestamp || new Date();
    const logEntry = {
      teamName: bidDto.teamName,
      amount: bidDto.amount,
      time: `${now.toLocaleTimeString('it-IT')}.${now.getMilliseconds().toString().padStart(3, '0')}`
    };
    activeAuction.history.unshift(logEntry);

    const stateDto = new AuctionStateDto(
      activeAuction.player,
      activeAuction.highestBid,
      activeAuction.highestBidderName,
      activeAuction.history,
      activeAuction.isSessionActive
    );
    io.emit('auction_update', stateDto);
    console.log(`💰 ${bidDto.teamName} offre ${bidDto.amount}`);
  });

  // 3. ASSEGNAZIONE DEFINITIVA
  socket.on('assign_player', async () => {
    const winnerId = activeAuction.highestBidderId;
    const finalPrice = activeAuction.highestBid;
    const player = activeAuction.player;

    if (!winnerId || !player) {
      return socket.emit('assign_error', { message: "Nessuna offerta valida!" });
    }

    try {
      const rosterQuery = await db.query(
        `SELECT p.role FROM rosters r JOIN players p ON r.player_id = p.id WHERE r.team_id = $1`,
        [winnerId]
      );
      const currentRoster = rosterQuery.rows;
      const limits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
      const roleCount = currentRoster.filter(p => p.role === player.role).length;

      if (roleCount >= limits[player.role]) {
        return socket.emit('assign_error', { message: `Limite ruolo raggiunto!` });
      }

      const emptySlotsAfterPurchase = 25 - (currentRoster.length + 1);
      const minimumRequiredBudget = emptySlotsAfterPurchase * 1;
      const currentBudgetDB = activeAuction.teamBudgets[winnerId];

      if ((currentBudgetDB - finalPrice) < minimumRequiredBudget) {
        return socket.emit('assign_error', { message: `Budget insufficiente per completare la rosa!` });
      }

      const newMaxPossibleBid = activeAuction.maxPossibleBids[winnerId] - finalPrice + 1;

      await db.query('BEGIN');
      await db.query(`INSERT INTO rosters (team_id, player_id, purchase_price) VALUES ($1, $2, $3)`, [winnerId, player.id, finalPrice]);
      await db.query(`UPDATE teams SET remaining_budget = remaining_budget - $1 WHERE id = $2`, [finalPrice, winnerId]);
      await db.query(`UPDATE teams SET max_possible_bid = $1 WHERE id = $2`, [newMaxPossibleBid, winnerId]);
      await db.query('COMMIT');

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

      resetAuction();

    } catch (error) {
      await db.query('ROLLBACK');
      console.error(error);
      socket.emit('assign_error', { message: 'Errore durante il salvataggio!' });
    }
  });

  // 4. ANNULLAMENTO ASTA
  socket.on('abort_auction', () => {
    if (activeAuction.player) {
      const player = activeAuction.player;
      resetAuction();
      io.emit('auction_aborted');
      console.log(`⛔ Asta annullata per ${player.name} da Admin`);
    }
  });

  // 5. CONCLUSIONE ASTA (Reset forzato)
  socket.on('auction_end', () => {
    resetAuction();
    activeAuction.isSessionActive = false;
    io.emit('auction_aborted'); // Notifica anche i client per allinearli
    io.emit('session_status_changed', { isSessionActive: false });
    console.log("🛑 Sessione d'Asta conclusa manualmente dall'Admin");
  });
};