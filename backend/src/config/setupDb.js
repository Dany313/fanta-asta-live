// File: src/config/setupDb.js
const db = require('./db');

const initializeDatabase = async () => {
  try {
    console.log("⏳ Controllo e inizializzazione del database in corso...");

    // 1. Creazione Tabella PLAYERS (Ora con i Timestamp!)
    await db.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(5) NOT NULL,
        club VARCHAR(255),
        current_price INTEGER DEFAULT 1,
        initial_price INTEGER DEFAULT 1,
        price_diff INTEGER DEFAULT 0,
        fvm INTEGER DEFAULT 0,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Aggiungiamo tutte le colonne nel caso la tabella esista già
    // await db.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS initial_price INTEGER DEFAULT 1;`);
    // await db.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS price_diff INTEGER DEFAULT 0;`);
    // await db.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS fvm INTEGER DEFAULT 0;`);
    // await db.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);
    // await db.query(`ALTER TABLE players ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;`);

    // 2. Creazione Tabella TEAMS
    await db.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        owner_name VARCHAR(255),
        remaining_budget INTEGER DEFAULT 500,
        invite_token UUID DEFAULT gen_random_uuid()
      );
    `);

    // 3. Creazione Tabella ROSTERS (Rose)
    await db.query(`
      CREATE TABLE IF NOT EXISTS rosters (
        id SERIAL PRIMARY KEY,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        player_id INTEGER UNIQUE REFERENCES players(id) ON DELETE CASCADE,
        purchase_price INTEGER NOT NULL
      );
    `);

    // 4. SEEDING: Inserimento delle squadre di base (solo se non ci sono)
    const checkTeams = await db.query(`SELECT COUNT(*) FROM teams`);
    if (parseInt(checkTeams.rows[0].count) === 0) {
      console.log("🌱 Database vuoto: Inserimento delle squadre di base...");
      await db.query(`
        INSERT INTO teams (name, owner_name, remaining_budget) VALUES 
        ('Real Madrid', 'Carlo', 500),
        ('Manchester City', 'Pep', 500),
        ('Juventus', 'Thiago', 500)
      `);
    }

    console.log("✅ Database pronto e sincronizzato!");
  } catch (error) {
    console.error("❌ Errore durante l'inizializzazione del database:", error.message);
  }
};

module.exports = initializeDatabase;