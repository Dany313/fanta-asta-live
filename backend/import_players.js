const xlsx = require('xlsx');
const db = require('./db');

const FILE_PATH = './Quotazioni_Fantacalcio_Stagione_2024_25.ods';

async function importaGiocatori() {
  let client;
  
  try {
    console.log("1. Leggo il file ODS...");
    const workbook = xlsx.readFile(FILE_PATH);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const playersData = xlsx.utils.sheet_to_json(sheet);

    client = await db.connect();
    
    console.log("2. Inizio la transazione nel database...");
    await client.query('BEGIN');

    // Settiamo tutti gli attuali giocatori a false. 
    // Quelli confermati nel file torneranno a true.
    await client.query('UPDATE players SET is_active = false');

    // La query magica aggiornata con le nuove colonne del file
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

    console.log("3. Importazione in corso...");
    
    let count = 0;
    
    for (const row of playersData) {
      if (!row.Id || !row.Nome) continue;

      // Estraiamo TUTTI i dati rispettando i nomi delle colonne (Keys) del file JSON
      const id = row.Id;
      const role = row.R;
      const name = row.Nome;
      const club = row.Squadra;
      const current_price = row['Qt.A'];
      const initial_price = row['Qt.I'];
      const price_diff = row['Diff.'];
      const fvm = row.FVM;

      // Eseguiamo la query passando i parametri nell'ordine corretto
      await client.query(upsertQuery, [
          id, role, name, club, current_price, initial_price, price_diff, fvm
      ]);
      
      count++;
    }

    await client.query('COMMIT');
    console.log(`✅ Finito! ${count} giocatori importati o aggiornati col nuovo schema.`);

  } catch (error) {
    console.error("❌ Errore durante l'importazione! Faccio il ROLLBACK...", error.message);
    if (client) {
      await client.query('ROLLBACK');
    }
  } finally {
    if (client) client.release();
    db.end(); 
  }
}

importaGiocatori();