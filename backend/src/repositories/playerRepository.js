// Import connessione al DB
const db = require('../config/db');


class PlayerRepository {

    //Recupera tutti i giocatori con stato attivo (non andati all' estero)
    async findAllAvailable() {
        const query = `
      SELECT p.* FROM players p
      WHERE p.is_active = true 
      ORDER BY p.fvm DESC, p.name ASC
    `;
        const result = await db.query(query);
        return result;
    }


    async findAllAvailableByLeagueId(leagueId) {
        const query = `
        SELECT p.id, p.name, p.role, p.club, p.current_price  
        FROM players p 
        WHERE p.id NOT IN (
        SELECT r.player_id  
        FROM rosters r 
        JOIN teams t ON t.id = r.team_id 
        JOIN leagues l ON l.id = t.league_id 
        WHERE l.id = $1
      )`;
        const result = await db.query(query, [leagueId]);
        return result;
    }

    
}

// Esportiamo un'istanza singola (Singleton pattern)
module.exports = new PlayerRepository();