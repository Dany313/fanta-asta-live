import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import * as api from './index'; // Le tue API attuali

// Hook per i giocatori
export const usePlayers = () => {
  return useQuery({
    queryKey: ['players'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const { data } = await axios.get('http://localhost:3000/api/players', {
        headers: { Authorization: `Bearer ${token}` }
      });
      return data;
    }
  });
};

// Hook per le squadre
export const useTeams = () => {
  return useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data } = await axios.get('http://localhost:3000/api/teams');
      return data;
    }
  });
};

// Hook per lo stato di setup (Leghe)
export const useSetupStatus = () => {
  return useQuery({
    queryKey: ['setupStatus'],
    queryFn: async () => {
      const leaguesRes = await api.getLeagues();
      if (leaguesRes.data.length > 0) {
        const teamsRes = await api.getTeams(leaguesRes.data[0].id);
        return teamsRes.data.length > 0;
      }
      return false;
    }
  });
};