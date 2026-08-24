const playerRepository = require('../repositories/playerRepository');
const db = require('../config/db');
const xlsx = require('xlsx');

class PlayerService {
    async getAvailablePlayers() {
        return await playerRepository.findAllAvailable();
    }

    async getAvailablePlayersByLeagueId(leagueId) {
        return await playerRepository.findAllAvailableByLeagueId(leagueId);
    }

    async importPlayersFromBuffer(buffer, mode = 'repair') {
        let client;
        try {
            const workbook = xlsx.read(buffer, { type: 'buffer' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const playersData = xlsx.utils.sheet_to_json(sheet);

            client = await db.connect();
            await client.query('BEGIN');

            if (mode === 'new_season') {
                // DELETE FROM leagues deletes everything (teams, rosters) due to ON DELETE CASCADE
                await client.query('DELETE FROM leagues');
                await client.query('DELETE FROM players');
            } else {
                await client.query('UPDATE players SET is_active = false');
            }

            const upsertQuery = `
              INSERT INTO players (
                  id, role, name, club, current_price, initial_price, price_diff, fvm, is_active
              )
              VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
              ON CONFLICT (id) DO UPDATE SET
                  role = EXCLUDED.role,
                  name = EXCLUDED.name,
                  club = EXCLUDED.club,
                  current_price = EXCLUDED.current_price,
                  initial_price = EXCLUDED.initial_price,
                  price_diff = EXCLUDED.price_diff,
                  fvm = EXCLUDED.fvm,
                  is_active = true,
                  updated_at = CURRENT_TIMESTAMP;
            `;

            let updatedCount = 0;
            for (const row of playersData) {
                if (!row.Id || !row.Nome) continue;

                await client.query(upsertQuery, [
                    row.Id, row.R, row.Nome, row.Squadra, 
                    row['Qt.A'], row['Qt.I'], row['Diff.'], row.FVM
                ]);
                updatedCount++;
            }



            let refundsProcessed = 0;
            const refundedTeams = [];

            if (mode === 'repair') {
                // RIMBORSI: Trova giocatori in rosa che non sono più attivi
                const cutPlayersQuery = `
                    SELECT r.id as roster_id, r.team_id, r.purchase_price, p.name as player_name 
                    FROM rosters r
                    JOIN players p ON r.player_id = p.id
                    WHERE p.is_active = false
                `;
                const cutPlayers = await client.query(cutPlayersQuery);

                for (const row of cutPlayers.rows) {
                    const { roster_id, team_id, purchase_price, player_name } = row;
                    
                    // Rimborsa budget e ripristina la max bid esatta 
                    // (+ purchase_price + 1 perché l'acquisto faceva - price - 1)
                    await client.query(`
                        UPDATE teams 
                        SET remaining_budget = remaining_budget + $1,
                            max_possible_bid = max_possible_bid + $1 + 1
                        WHERE id = $2
                    `, [purchase_price, team_id]);

                    // Rimuovi dal roster
                    await client.query(`DELETE FROM rosters WHERE id = $1`, [roster_id]);
                    
                    refundedTeams.push({ playerName: player_name, refund: purchase_price, teamId: team_id });
                }
                refundsProcessed = cutPlayers.rows.length;
            }

            await client.query('COMMIT');
            
            return {
                success: true,
                message: mode === 'new_season' 
                    ? `Nuova stagione pronta! ${updatedCount} giocatori caricati da zero. Tutte le leghe sono state resettate.`
                    : `Importazione completata! ${updatedCount} giocatori processati.`,
                refundsProcessed: refundsProcessed,
                refundDetails: refundedTeams
            };

        } catch (error) {
            if (client) {
                await client.query('ROLLBACK');
            }
            throw new Error(`Importazione fallita: ${error.message}`);
        } finally {
            if (client) {
                client.release();
            }
        }
    }
}

module.exports = new PlayerService();