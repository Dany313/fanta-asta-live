// Importiamo il pool di connessione che abbiamo appena creato
const db = require('../config/db');

// Creiamo una funzione asincrona
async function test_connection() {
    try {
        console.log("Tentativo di connessione al database...");
        // AWAIT: aspetta che il DB risponda con l'orario attuale
        const res = await db.query('SELECT NOW()');

        console.log("Connessione riuscita! Ora del DB:", res.rows[0].now);
    } catch (err) {
        console.error("Errore di connessione:", err.message);
    } finally {
        // Chiudiamo il pool alla fine per permettere al programma di terminare
        db.end();
    }
}

// Eseguiamo la funzione
test_connection();