// Importiamo la classe Pool dalla libreria 'pg' (PostgreSQL)
const { Pool } = require('pg');

// Carichiamo le variabili d'ambiente dal file .env
require('dotenv').config();

// Creiamo un nuovo Pool di connessioni usando i dati del .env
const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
});

// Gestione base degli errori di connessione imprevisti
pool.on('error', (err,client)=> {
    console.error('Errore imprevisto Database', err);
});

// Esportiamo il pool per poterlo usare in altri file (simile al 'public' di Java)
module.exports = pool;