import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('adminToken');
    return { headers: { Authorization: `Bearer ${token}` } };
}

export const createLeague = (name) => {
    return axios.post(`${API_URL}/leagues`, { name }, getAuthHeaders());
};

export const getLeagues = () => {
    return axios.get(`${API_URL}/leagues`, getAuthHeaders());
};

export const createTeam = (name, leagueId) => {
    return axios.post(`${API_URL}/teams`, { name, leagueId }, getAuthHeaders());
};

export const getTeams = (leagueId) => {
    const params = leagueId ? { leagueId } : {};
    return axios.get(`${API_URL}/teams`, { ...getAuthHeaders(), params });
};
