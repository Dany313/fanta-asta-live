const pool = require('../config/db');

/**
 * Esegue una funzione callback all'interno di una transazione SQL sicura.
 */
exports.withTransaction = async (callback) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        
        // Esegue la tua logica di business passando il client
        const result = await callback(client); 
        
        await client.query('COMMIT');
        return result;
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
};