
interface Roster {
    team_id: number;
    player_id: number;
    name: string;
    role: string;
    purchase_price: number;
}

interface ModifyPlayerPriceData {
    team_id: number;
    player_id: number;
    price: number;
}

interface RemovePlayerData {
    team_id: number;
    player_id: number;
}

interface AddPlayerData {
    team_id: number;
    player_id: number;
    price: number;
}

// 1. Funzioni API pure (separate dagli hook)
export const getRoster = async (team_id: number): Promise<Roster[]> => {
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}` };
    const response = await fetch(`http://localhost:3000/api/rosters/team/${team_id}`, { headers });
    if (!response.ok) throw new Error('Errore nel recupero dei giocatori');
    return response.json();
};

export const addPlayerToRoster = async (data: AddPlayerData) => {
    const { team_id, player_id, price } = data;
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const response = await fetch(`http://localhost:3000/api/rosters`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
            teamId: team_id,
            playerId: player_id,
            purchasePrice: price
        })
    });
    if (!response.ok) throw new Error('Errore nell\'aggiunta del giocatore al roster');
    return response.json();
};

export const putPlayerPrice = async (data: ModifyPlayerPriceData) => {
    const { team_id, player_id, price } = data;
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const response = await fetch(`http://localhost:3000/api/rosters`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            teamId: team_id,
            playerId: player_id,
            purchasePrice: price
        })
    });
    if (!response.ok) throw new Error('Errore nell\'aggiunta del giocatore al roster');
    return response.json();
};

export const removePlayerFromRoster = async (data: RemovePlayerData) => {
    const { team_id, player_id } = data;
    const token = localStorage.getItem('adminToken');
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const response = await fetch(`http://localhost:3000/api/rosters`, {
        method: 'DELETE',
        headers,
        body: JSON.stringify({
            teamId: team_id,
            playerId: player_id
        })
    });
    if (!response.ok) throw new Error('Errore nella rimozione del giocatore dal roster');
    return response.json();
};