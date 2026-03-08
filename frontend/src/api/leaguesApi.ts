import { useMutation, useQuery } from '@tanstack/react-query';


export interface League {
    id: number;
    name: string;
}

export interface ModifyLeagueData {
    id: number;
    leaguename: string;
}

// 1. Funzioni API pure (separate dagli hook)
export const getLeagues = async (): Promise<League[]> => {
    const response = await fetch('http://localhost:3000/api/leagues');
    if (!response.ok) throw new Error('Errore nel recupero delle leghe');
    return response.json();
};

export const postLeague = async (leaguename: string) => {
    const response = await fetch('http://localhost:3000/api/leagues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leaguename })
    });
    if (!response.ok) throw new Error('Errore nella creazione della lega');
    return response.json();
};

export const putLeague = async (data: ModifyLeagueData) => {
    const { id, leaguename } = data;
    const response = await fetch(`http://localhost:3000/api/leagues/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: leaguename })
    });
    if (!response.ok) throw new Error('Errore nella modifica della lega');
    return response.json();
};

export const delLeague = async (id: number) => {
    const response = await fetch(`http://localhost:3000/api/leagues/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Errore nella cancellazione della lega');
    return response.json();
};
