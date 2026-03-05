import React, { useState } from 'react';
import * as api from '../../api';

const LeagueManagement = ({ onSetupComplete }) => {
    const [league, setLeague] = useState(null);
    const [leagueName, setLeagueName] = useState('');
    const [teams, setTeams] = useState([]);
    const [teamName, setTeamName] = useState('');
    const [adminTeam, setAdminTeam] = useState('');

    const handleCreateLeague = async (e) => {
        e.preventDefault();
        try {
            const res = await api.createLeague(leagueName);
            setLeague(res.data);
        } catch (error) {
            console.error("Error creating league", error);
        }
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        if (!league) return;
        try {
            const res = await api.createTeam(teamName, league.id);
            setTeams([...teams, res.data]);
            setTeamName('');
        } catch (error) {
            console.error("Error creating team", error);
        }
    };

    if (!league) {
        return (
            <div>
                <h2>Create League</h2>
                <form onSubmit={handleCreateLeague}>
                    <input
                        type="text"
                        value={leagueName}
                        onChange={(e) => setLeagueName(e.target.value)}
                        placeholder="League Name"
                    />
                    <button type="submit">Create League</button>
                </form>
            </div>
        );
    }

    return (
        <div>
            <h2>{league.name}</h2>
            <h3>Create Teams</h3>
            <form onSubmit={handleCreateTeam}>
                <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Team Name"
                />
                <button type="submit">Create Team</button>
            </form>

            <h3>Teams</h3>
            <ul>
                {teams.map(team => <li key={team.id}>{team.name}</li>)}
            </ul>

            {teams.length > 1 && (
                <div>
                    <h3>Select Your Team</h3>
                    <select value={adminTeam} onChange={(e) => setAdminTeam(e.target.value)}>
                        <option value="">-- Select a team --</option>
                        {teams.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                    </select>
                    <button onClick={() => { localStorage.setItem('adminTeamId', adminTeam); onSetupComplete(); }} disabled={!adminTeam}>Finish Setup</button>
                </div>
            )}
        </div>
    );
};

export default LeagueManagement;
