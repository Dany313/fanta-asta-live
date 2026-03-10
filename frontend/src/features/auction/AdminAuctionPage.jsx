import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import PlayerTable from '../../components/PlayerTable';
import PlayerCard from './components/PlayerCard';
import BidPanel from './components/BidPanel'; // 🌟 IMPORTATO
import AuctionLog from './components/AuctionLog'; // 🌟 IMPORTATO

import InvitePanel from './components/InvitePanel'; // 🌟 IMPORTATO
import LeagueManagement from '../admin/LeagueManagement';


// Architettura Nuova
import { useAuctionStore } from '../../store/useAuctionStore';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '../../api/playersApi';
import axios from 'axios';
import api from '../../api/api';

export default function AdminDashboard() {
    const navigate = useNavigate();

    // 1. Inizializza i WebSockets
    const socket = useAuctionSocket();

    // 2. Leggi lo stato in tempo reale da Zustand
    const activeAuction = useAuctionStore((state) => state.activeAuction);

    // 3. Server State (TanStack Query fa tutto da solo)
    const { data: players = [], isLoading: loadingPlayers } = useQuery({
        queryKey: ['players'],
        queryFn: getPlayers,
        select: (data) => data.filter(player => !roster.some(r => r.player_id === player.id)) // Filtra i giocatori già nel roster
    });
    const { data: teams = [] } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/api/teams');
            return data;
        }
    });
    const { data: isSetupComplete = false } = useQuery({
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

    // 4. Client State (Solo cose visive)
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState('');

    // --- AZIONI ---
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const handleStartAuction = (player) => socket.emit('start_auction', player);

    const handleAdminBid = (amount) => {
        const adminTeamId = localStorage.getItem('adminTeamId');
        if (!adminTeamId) return alert("Seleziona prima una squadra!");

        const teamName = teams.find(t => t.id === Number(adminTeamId))?.name;
        socket.emit('place_bid', { teamId: Number(adminTeamId), teamName, amount });
    };

    const handleAssign = () => {
        if (window.confirm(`Vendere ${activeAuction.player.name} a ${activeAuction.highestBidderName} per ${activeAuction.highestBid}?`)) {
            socket.emit('assign_player');
        }
    };

    // --- RENDER LOGIC ---
    if (!isSetupComplete) {
        return <LeagueManagement onSetupComplete={() => window.location.reload()} />;
    }

    const filteredPlayers = players.filter(player => {
        const nameMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = !roleFilter || player.role.toUpperCase() === roleFilter.toUpperCase();
        return nameMatch && roleMatch;
    });

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            {/* ... Intestazione identica al tuo codice ... */}

            {/* SEZIONE ASTA */}
            {activeAuction?.player && (
                <div style={{ marginBottom: '40px' }}>
                    <PlayerCard player={{ ...activeAuction.player, current_price: activeAuction.highestBid }} title="🔨 ASTA IN CORSO">
                        {/* ... UI identica al tuo codice ... */}
                        <BidPanel currentBid={activeAuction.highestBid} onBid={handleAdminBid} />
                        <CustomButton variant="primary" onClick={handleAssign}>
                            🎉 VENDUTO A {activeAuction.highestBid} FM!
                        </CustomButton>
                        <AuctionLog history={activeAuction.history} />
                    </PlayerCard>
                </div>
            )}

            <InvitePanel teams={teams} />

            {/* SEZIONE LISTONE */}
            {/* ... Filtri input/bottoni identici al tuo codice ... */}

            {loadingPlayers ? (
                <p>Caricamento in corso...</p>
            ) : (
                <PlayerTable players={filteredPlayers.slice(0, 100)} onPlayerClick={handleStartAuction} buttonText="Metti all'asta" buttonVariant="success" />
            )}
        </div>
    );
}