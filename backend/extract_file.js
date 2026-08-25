const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

// Connessione al database SQLite
const db = new sqlite3.Database('/Users/daniele/.gemini/antigravity/brain/fea0a9e5-2522-417f-acc0-9c9b68d9ceab/.system_generated/sqlite/brain.db', (err) => {
    if (err) {
        console.error('Errore di connessione:', err.message);
        return;
    }
    
    // Trova l'ultimo messaggio dell'utente
    db.get("SELECT content FROM Messages WHERE sender = 'USER_EXPLICIT' ORDER BY timestamp DESC LIMIT 1", (err, row) => {
        if (err) {
            console.error('Errore query:', err);
            return;
        }
        if (row) {
            const content = row.content;
            // Estrai il file zip basandoti su PK\x03\x04
            const pkIndex = content.indexOf('PK\x03\x04');
            if (pkIndex !== -1) {
                const fileData = content.substring(pkIndex);
                fs.writeFileSync('extracted.xlsx', fileData, 'binary');
                console.log('File extracted to extracted.xlsx. Length:', fileData.length);
            } else {
                console.log('PK non trovato nel messaggio');
            }
        }
    });
});
