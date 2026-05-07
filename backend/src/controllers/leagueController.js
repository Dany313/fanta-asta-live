const leagueService = require('../services/leagueService');
const LeagueMapper = require('../mappers/LeagueMapper');

exports.createLeague = async (req, res) => {
    const { name } = req.body;
    try {
        const result = await leagueService.createLeague(name);
        const newLeague = LeagueMapper.toEntity(result.rows[0]);
        res.status(201).json(newLeague);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.updateLeague = async (req, res) => {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = await leagueService.updateLeague(id, name);
        const updatedLeague = LeagueMapper.toEntity(result.rows[0]);
        res.json(updatedLeague);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getLeagues = async (req, res) => {
    try {
        const result = await leagueService.getLeagues();
        const leagues = result.rows.map(LeagueMapper.toEntity);
        res.json(leagues);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.getLeagueById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await leagueService.getLeagueById(id);
        const league = LeagueMapper.toEntity(result.rows[0]);
        res.json(league);
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};

exports.deleteLeague = async (req, res) => {
    const { id } = req.params;
    try {
        await leagueService.deleteLeague(id);
        res.json({ message: 'League deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
};
