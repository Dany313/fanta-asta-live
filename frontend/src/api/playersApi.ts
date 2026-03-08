import { useQuery } from '@tanstack/react-query';


interface Player {
    id: number;
    name: string;
    role: string;
    club: number;
    current_price: number;
}

export const usePlayers = () => {
    return useQuery({
        queryKey: ['players'],
        queryFn: async (): Promise<Player[]> => {
            const token = localStorage.getItem('adminToken');
            const response = await fetch('http://localhost:3000/api/players', {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.json();
        }
    });
};