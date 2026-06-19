
interface Player {
    id: number;
    name: string;
    role: string;
    club: number;
    current_price: number;
}

export const getPlayers = async (): Promise<Player[]> => {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/players`);
    if (!response.ok) throw new Error('Errore nel recupero dei giocatori');
    return response.json();
};

export const uploadListone = async (file: File): Promise<any> => {
    const token = localStorage.getItem('adminToken');
    if (!token) throw new Error('Non autorizzato');

    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/players/upload`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.error || 'Errore durante il caricamento del listone');
    }
    
    return response.json();
};