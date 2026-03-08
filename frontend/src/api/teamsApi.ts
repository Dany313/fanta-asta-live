import { useMutation, useQuery } from '@tanstack/react-query';


export interface Team {
    id: number;
    league_id: number;
    name: string;
    remaining_budget: number;
    max_possible_bid: number;
    invite_token: string;
}

export interface ModifyTeamData {
    id: number;
    teamname: string;
}

export const getTeams = async (league_id: number): Promise<Team[]> => {
    const response = await fetch(`http://localhost:3000/api/teams?leagueId=${league_id}`);
    if (!response.ok) throw new Error('Errore nel recupero dei team');
    return response.json();
};

export const postTeam = async (teamname: string) => {
    const response = await fetch('http://localhost:3000/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamname })
    });
    if (!response.ok) throw new Error('Errore nella creazione del team');
    return response.json();
};

export const putTeam = async (data: ModifyTeamData) => {
    const { id, teamname } = data;
    const response = await fetch(`http://localhost:3000/api/teams/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: teamname })
    });
    if (!response.ok) throw new Error('Errore nella modifica del team');
    return response.json();
};

export const delTeam = async (id: number) => {
    const response = await fetch(`http://localhost:3000/api/teams/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Errore nella cancellazione del team');
    return response.json();
};
