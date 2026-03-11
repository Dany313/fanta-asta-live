const db = require('../../config/db');
const BidDto = require('../../dtos/BidDto'); // Assicurati che il path corrisponda alla tua struttura (dtos o dto)
const AuctionStateDto = require('../../dtos/AuctionStateDto');
const TeamMapper = require('../../mappers/TeamMapper');
const { activeAuction, resetAuction } = require('./auctionState');

module.exports = (io, socket) => {
  
  // 0. SYNC STATO INIZIALE (Se un client si connette ad asta in corso)
  socket.on('sync_auction', () => {
    if (activeAuction.player) {
      const stateDto = new AuctionStateDto(
        activeAuction.player, 
        activeAuction.highestBid, 
        activeAuction.highestBidderName, 
        activeAuction.history
      );
      // Inviamo lo stato SOLO al client che ha richiesto la sync
      socket.emit('auction_started', stateDto);
    }
  });

  // 1a. INIZIO ASTA ADMIN (Offerta iniziale 0)
  socket.on('start_auction_admin', async (playerData) => {
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
      activeAuction.player = playerData;
      activeAuction.teamBudgets = budgets;
      activeAuction.maxPossibleBids = maxBids;

      const stateDto = new AuctionStateDto(
        activeAuction.player, 
        activeAuction.highestBid, 
        activeAuction.highestBidderName, 
        activeAuction.history
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
      activeAuction.history.unshift({
        teamName: teamName,
        amount: 1,
        time: new Date().toLocaleTimeString('it-IT')
      });

      const stateDto = new AuctionStateDto(
        activeAuction.player, 
        activeAuction.highestBid, 
        activeAuction.highestBidderName, 
        activeAuction.history
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
      return socket.emit('bid_error', { message: 'Offerta già superata!' });
    }

    const maxBudget = activeAuction.teamBudgets[bidDto.teamId] || 0;
    const maxPossibleBid = activeAuction.maxPossibleBids[bidDto.teamId] || 500;
    
    if (bidDto.amount > maxPossibleBid) {
      return socket.emit('bid_error', { message: `Offerta supera il limite massimo (${maxPossibleBid})` });
    }
    if (bidDto.amount > maxBudget) {
      return socket.emit('bid_error', { message: `Crediti insufficienti (${maxBudget})` });
    }

    // Aggiornamento stato
    activeAuction.highestBid = bidDto.amount;
    activeAuction.highestBidderId = bidDto.teamId;
    activeAuction.highestBidderName = bidDto.teamName;

    const logEntry = {
      teamName: bidDto.teamName,
      amount: bidDto.amount,
      time: bidDto.timestamp.toLocaleTimeString('it-IT')
    };
    activeAuction.history.unshift(logEntry);

    const stateDto = new AuctionStateDto(
      activeAuction.player,
      activeAuction.highestBid,
      activeAuction.highestBidderName,
      activeAuction.history
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

      const newMaxPossibleBid = activeAuction.maxPossibleBids[winnerId] - finalPrice - 1;

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
    io.emit('auction_aborted'); // Notifica anche i client per allinearli
    console.log("🛑 Asta conclusa manualmente dall'Admin");
  });
};