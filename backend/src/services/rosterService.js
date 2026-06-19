// backend/src/services/rosterService.js
const repo = require('../repositories/rosterRepository');
const { withTransaction } = require('../utils/dbUtils');

exports.get_rosters_by_team_id = async (teamId) => {
    return await repo.findAllByTeamId(teamId);
};

exports.get_rosters_by_league_id = async (leagueId) => {
    return await repo.findAllByLeagueId(leagueId);
};

exports.assign_player_to_team = async (team_id, player_id, amount) => {

    return await withTransaction(async (client) => {
        const teamInfo = await repo.getTeamInfo(team_id, client);
        if (!teamInfo) throw new Error("Squadra non trovata.");

        const { league_id, remaining_budget } = teamInfo;

        // 1. CONTROLLO: Il giocatore è già in un'altra squadra della stessa lega?
        const isAlreadyAssigned = await repo.checkPlayerInLeague(player_id, league_id, client);
        if (isAlreadyAssigned) throw new Error("Giocatore già assegnato in questa lega.");

        // 2. RECUPERO DATI: Prendi ruolo giocatore
        const playerRole = await repo.getPlayerRole(player_id, client);
        if (!playerRole) throw new Error("Giocatore non trovato.");

        // 3. CONTROLLO: Il budget è sufficiente?
        if (amount > (teamInfo.max_possible_bid || 0)) throw new Error("Offerta superiore alla puntata massima consentita.");

        // 4. CONTROLLO RUOLO
        const currentRoleCount = await repo.countPlayersByRole(team_id, playerRole, client);
        const roleLimits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
        
        if (currentRoleCount >= roleLimits[playerRole]) {
            throw new Error(`Numero massimo di giocatori per il ruolo ${playerRole} (${roleLimits[playerRole]}) raggiunto.`);
        }

        // 5. ASSEGNAZIONE
        const insertResult = await repo.addPlayerToRoster(team_id, player_id, amount, client);

        // 6. AGGIORNAMENTO BUDGET E MAX BID
        const newMaxBid = (teamInfo.max_possible_bid || 0) - amount + 1;
        await repo.updateTeamBudget(team_id, remaining_budget - amount, client);
        await repo.updateTeamMaxPossibleBid(team_id, newMaxBid, client);

        return insertResult;
    });
}


exports.player_cost_update = async (team_id, player_id, amount) => {
    return await withTransaction(async (client) => {
        const teamInfo = await repo.getTeamInfo(team_id, client);
        if (!teamInfo) throw new Error("Squadra non trovata.");
        
        const rosterEntry = await repo.getRosterEntry(team_id, player_id, client);
        if (!rosterEntry) throw new Error("Giocatore non presente nella rosa.");

        const newBudget = (teamInfo.remaining_budget + rosterEntry.purchase_price) - amount;
        const newMaxBid = (teamInfo.max_possible_bid || 0) + rosterEntry.purchase_price - amount;

        // 1. CONTROLLO: Il budget è sufficiente?
        if (amount > ((teamInfo.max_possible_bid || 0) + rosterEntry.purchase_price)) {
             throw new Error("Costo troppo alto: supera il limite massimo della squadra.");
        }

        // 2. AGGIORNAMENTO ROSTER
        const updateResult = await repo.updateRosterPrice(team_id, player_id, amount, client);

        // 3. AGGIORNAMENTO BUDGET E MAX BID
        await repo.updateTeamBudget(team_id, newBudget, client);
        await repo.updateTeamMaxPossibleBid(team_id, newMaxBid, client);

        return updateResult;
    });
}

exports.delete_player_from_team = async (team_id, player_id, refundMode = 'PURCHASE') => {
    return await withTransaction(async (client) => {
        const teamInfo = await repo.getTeamInfo(team_id, client);
        if (!teamInfo) throw new Error("Squadra non trovata.");

        const rosterEntry = await repo.getRosterEntry(team_id, player_id, client);
        if (!rosterEntry) throw new Error("Giocatore non presente nella rosa.");

        // Calcolo del rimborso
        const refundAmount = refundMode === 'CURRENT' ? rosterEntry.current_price : rosterEntry.purchase_price;

        const newBudget = teamInfo.remaining_budget + refundAmount;

        // Recupera anche max_possible_bid se possibile, oppure calcoliamolo.
        // Wait, getTeamInfo only selects league_id, remaining_budget!
        // I need to add max_possible_bid to getTeamInfo in RosterRepository.
        // Let's do it in the next step, I'll update it here assuming it's available.
        // But since I need to change repo.getTeamInfo, I will do it first or assume it's updated.
        // Let's assume I'll update repo.getTeamInfo to return max_possible_bid too.
        const newMaxBid = (teamInfo.max_possible_bid || 0) + refundAmount - 1;

        // 1. ELIMINAZIONE
        const deleteResult = await repo.deletePlayerFromRoster(team_id, player_id, client);

        // 2. AGGIORNAMENTO BUDGET E MAX BID
        await repo.updateTeamBudget(team_id, newBudget, client);
        await repo.updateTeamMaxPossibleBid(team_id, newMaxBid, client);

        return deleteResult;
    });
}

exports.export_rosters_csv = async (leagueId) => {
    const data = await repo.getExportData(leagueId);

    // CONFIGURAZIONE DELLE COLONNE DEL CSV
    // Se serve aggiungere o togliere colonne, basta modificare questo array.
    // label: Intestazione della colonna nel CSV finale
    // field: Nome del campo nell'oggetto row restituito dal DB
    const csvConfig = [
        { label: 'Id_Giocatore', field: 'player_id' },
        { label: 'Ruolo', field: 'role' },
        { label: 'Nome_Giocatore', field: 'player_name' },
        { label: 'Squadra_Serie_A', field: 'club' },
        { label: 'FantaSquadra', field: 'team_name' },
        { label: 'Costo_Acquisto', field: 'purchase_price' }
    ];

    const separator = ';';

    // Genera l'intestazione
    const headerRow = csvConfig.map(col => col.label).join(separator);

    // Genera le righe dati
    const dataRows = data.map(row => {
        return csvConfig.map(col => {
            let value = row[col.field];
            if (value === null || value === undefined) value = '';
            // Se il valore contiene il separatore o accenti strani, lo mettiamo tra virgolette per sicurezza
            if (typeof value === 'string' && value.includes(separator)) {
                return `"${value}"`;
            }
            return value;
        }).join(separator);
    });

    // Unisce intestazione e dati con un ritorno a capo (Windows compatibile \r\n per Excel)
    return [headerRow, ...dataRows].join('\r\n');
};