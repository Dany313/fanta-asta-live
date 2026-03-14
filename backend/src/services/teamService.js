const db = require('../config/db');


exports.assign_player_to_team = async ( team_id, player_id, amount) => {
    const client = await db.connect(); // Usa un client per la transazione
    try {
        await client.query('BEGIN'); // Inizia la transazione

        const teamResult = await client.query(`SELECT league_id, remaining_budget FROM teams WHERE id = $1`, [team_id]);
        if (teamResult.rows.length === 0) throw new Error("Squadra non trovata.");

        const leagueId = teamResult.rows[0].league_id;
        const remaining_budget = teamResult.rows[0].remaining_budget;

        // 1. CONTROLLO: Il giocatore è già in un'altra squadra della stessa lega?
        const existingRoster = await client.query(
            `SELECT r.id FROM rosters r JOIN teams t ON r.team_id = t.id WHERE r.player_id = $1 AND t.league_id = $2`,
            [player_id, leagueId]
        );
        if (existingRoster.rows.length > 0) {
            throw new Error("Giocatore già assegnato in questa lega.");
        }

        // 2. RECUPERO DATI: Prendi ruolo giocatore
        const playerResult = await client.query(`SELECT role FROM players WHERE id = $1`, [player_id]);
        if (playerResult.rows.length === 0) throw new Error("Giocatore non trovato.");

        const playerRole = playerResult.rows[0].role;

        // 3. CONTROLLO: Il budget è sufficiente?
        if ((remaining_budget - amount) < 0) {
            throw new Error("Budget insufficiente.");
        }

        // 4. CONTROLLO RUOLO (MODO EFFICIENTE): Conta quanti giocatori di quel ruolo ha già la squadra
        const roleCountResult = await client.query(
            `SELECT COUNT(p.id) FROM rosters r JOIN players p ON r.player_id = p.id WHERE r.team_id = $1 AND p.role = $2`,
            [team_id, playerRole]
        );
        const currentRoleCount = parseInt(roleCountResult.rows[0].count, 10);

        const roleLimits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
        if (currentRoleCount >= roleLimits[playerRole]) {
            throw new Error(`Numero massimo di giocatori per il ruolo ${playerRole} (${roleLimits[playerRole]}) raggiunto.`);
        }

        // --- Se tutti i controlli passano, procedi con l'assegnazione ---

        // 5. ASSEGNAZIONE: Inserisci il giocatore nel roster
        const insertResult = await client.query(
            `INSERT INTO rosters (team_id, player_id, purchase_price) VALUES ($1, $2, $3) RETURNING *`,
            [team_id, player_id, amount]
        );

        // 6. AGGIORNAMENTO: Scala il budget dalla squadra
        await client.query(
            `UPDATE teams SET remaining_budget = remaining_budget - $1 WHERE id = $2`,
            [amount, team_id]
        );

        await client.query('COMMIT'); // Conferma tutte le modifiche
        console.log(`✅ Giocatore ${player_id} assegnato al team ${team_id} per ${amount}`);
        return insertResult.rows[0];
    } catch (error) {
        await client.query('ROLLBACK'); // Annulla tutto in caso di errore
        console.error("❌ Errore durante l'assegnazione del giocatore:", error.message);
        throw error; // Rilancia l'errore per gestirlo nel controller/socket
    } finally {
        client.release(); // Rilascia il client al pool
    }
}