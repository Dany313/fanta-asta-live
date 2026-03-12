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

export interface AddTeamData {
    teamName: string;
    leagueId: number;
}


export const getTeams = async (league_id: number): Promise<Team[]> => {
    const response = await fetch(`http://localhost:3000/api/teams?leagueId=${league_id}`);
    if (!response.ok) throw new Error('Errore nel recupero dei team');
    return response.json();
};

export const getTeamById = async (id: number): Promise<Team> => {
    const response = await fetch(`http://localhost:3000/api/teams/${id}`);
    if (!response.ok) throw new Error('Errore nel recupero del team');
    return response.json();
}

export const postTeam = async (data: AddTeamData) => {
    const token = localStorage.getItem('adminToken');
    const { teamName: teamname, leagueId: league_id } = data;
    const response = await fetch('http://localhost:3000/api/teams', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: teamname, leagueId: league_id })
    });
    if (!response.ok) {
        const error: any = new Error('Errore nella creazione del team');
        error.response = { status: response.status };
        throw error;
    }
    return response.json();
};

export const putTeam = async (data: ModifyTeamData) => {
    const token = localStorage.getItem('adminToken');
    const { id, teamname } = data;
    const response = await fetch(`http://localhost:3000/api/teams/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: teamname })
    });
    if (!response.ok) {
        const error: any = new Error('Errore nella modifica del team');
        error.response = { status: response.status };
        throw error;
    }
    return response.json();
};

export const delTeam = async (id: number) => {
    const token = localStorage.getItem('adminToken');
    const response = await fetch(`http://localhost:3000/api/teams/${id}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    });
    if (!response.ok) {
        const error: any = new Error('Errore nella cancellazione del team');
        error.response = { status: response.status };
        throw error;
    }
    return response.json();
};
