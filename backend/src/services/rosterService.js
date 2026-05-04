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
        if ((remaining_budget - amount) < 0) throw new Error("Budget insufficiente.");

        // 4. CONTROLLO RUOLO
        const currentRoleCount = await repo.countPlayersByRole(team_id, playerRole, client);
        const roleLimits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
        
        if (currentRoleCount >= roleLimits[playerRole]) {
            throw new Error(`Numero massimo di giocatori per il ruolo ${playerRole} (${roleLimits[playerRole]}) raggiunto.`);
        }

        // 5. ASSEGNAZIONE
        const insertResult = await repo.addPlayerToRoster(team_id, player_id, amount, client);

        // 6. AGGIORNAMENTO BUDGET
        await repo.updateTeamBudget(team_id, remaining_budget - amount, client);

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

        // 1. CONTROLLO: Il budget è sufficiente?
        if (newBudget < 0) throw new Error("Budget insufficiente.");

        // 2. AGGIORNAMENTO ROSTER
        const updateResult = await repo.updateRosterPrice(team_id, player_id, amount, client);

        // 3. AGGIORNAMENTO BUDGET
        await repo.updateTeamBudget(team_id, newBudget, client);

        return updateResult;
    });
}

exports.delete_player_from_team = async (team_id, player_id) => {
    return await withTransaction(async (client) => {
        const teamInfo = await repo.getTeamInfo(team_id, client);
        if (!teamInfo) throw new Error("Squadra non trovata.");

        const rosterEntry = await repo.getRosterEntry(team_id, player_id, client);
        if (!rosterEntry) throw new Error("Giocatore non presente nella rosa.");

        const newBudget = teamInfo.remaining_budget + rosterEntry.purchase_price;

        // 1. ELIMINAZIONE
        const deleteResult = await repo.deletePlayerFromRoster(team_id, player_id, client);

        // 2. AGGIORNAMENTO BUDGET
        await repo.updateTeamBudget(team_id, newBudget, client);

        return deleteResult;
    });
}