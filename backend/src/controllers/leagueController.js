const db = require('../config/db');
const queries = require('../queries');
const LeagueMapper = require('../mappers/LeagueMapper');

exports.createLeague = async (req, res) => {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'League name is required' });
    }

    try {
        const result = await db.query(queries.createLeagueQuery, [name]);
        const newLeague = LeagueMapper.toEntity(result.rows[0]);
        res.status(201).json(newLeague);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateLeague = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: 'League name is required' });
    }

    try {
        const result = await db.query(queries.updateLeagueQuery, [name, id]);
        const updatedLeague = LeagueMapper.toEntity(result.rows[0]);
        res.json(updatedLeague);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getLeagues = async (req, res) => {
    try {
        const result = await db.query(queries.getLeaguesQuery);
        const leagues = result.rows.map(LeagueMapper.toEntity);
        res.json(leagues);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteLeague = async (req, res) => {
    const { id } = req.params;
    if (!id) {
        return res.status(400).json({ error: 'League ID is required' });
    }

    try {
        await db.query(queries.deleteLeagueQuery, [id]);
        res.json({ message: 'League deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
