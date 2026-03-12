
interface Player {
    id: number;
    name: string;
    role: string;
    club: number;
    current_price: number;
}

export const getPlayers = async (): Promise<Player[]> => {
    const response = await fetch('http://localhost:3000/api/players');
    if (!response.ok) throw new Error('Errore nel recupero dei giocatori');
    return response.json();
};