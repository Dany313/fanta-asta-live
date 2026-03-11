import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerTable from '../../components/PlayerTable';
import PlayerCard from './components/PlayerCard';
import AuctionLog from './components/AuctionLog'; // 🌟 IMPORTATO
import Button from '@mui/material/Button';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import InvitePanel from './components/InvitePanel'; // 🌟 IMPORTATO


import { useParams } from 'react-router-dom';
import { useAuctionStore } from '../../store/useAuctionStore';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '../../api/playersApi';
import { getRosterByLeague } from '../../api/rosterApi';
import { getTeams } from '../../api/teamsApi';
import AdminCustomBet from './components/AdminCustomBet';
import { Stack, Box } from '@mui/material';
import AssignPlayerButton from './components/AssignPlayerButton';

export default function ViewerDashboard() {
    const [leagueId, setLeagueId] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const storedTeam = localStorage.getItem('teamData');
        if (storedTeam) {
            const team = JSON.parse(storedTeam);
            setLeagueId(team.leagueId);
        }
    }, []);

    // 1. Inizializza i WebSockets
    const socket = useAuctionSocket();

    // 2. Leggi lo stato in tempo reale da Zustand
    const activeAuction = useAuctionStore((state) => state.activeAuction);

    const { data: roster = [] } = useQuery({
        queryKey: ['roster', leagueId],
        queryFn: () => getRosterByLeague(leagueId)
    });


    // 3. Server State (TanStack Query fa tutto da solo)
    const { data: players = [], isLoading: loadingPlayers } = useQuery({
        queryKey: ['players'],
        queryFn: getPlayers,
        select: (data) => data.filter(player => !roster.some(r => r.player_id === player.id)) // Filtra i giocatori già nel roster
    });
    const { data: teams = [] } = useQuery({
        queryKey: ['teams', leagueId],
        queryFn: () => getTeams(leagueId)
    });

    const [isListoneOpen, setListoneOpen] = useState(false);

    const handleStartAuction = (player) => socket.emit('start_auction', player);

    const handleBid = (teamId_, amount) => {

        if (activeAuction.highestBid === 0) {
            alert('Attendi che lasta inizi ufficialmente prima di fare un offerta!');
            return;
        }

        const teamId = teamId_ || localStorage.getItem('viewerTeamId');
        if (!teamId) return;


        // const teamName = teams.find(t => t.id === Number(teamId))?.name;
        socket.emit('place_bid', { teamId: Number(teamId), teamName: localStorage.getItem('viewerTeamName'), amount });
    };

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            {/* ... Intestazione identica al tuo codice ... */}

            <Stack direction="row" justifyContent="space-between" alignItems="start" style={{ marginBottom: '30px' }}>
                <Button
                    variant="contained"
                    startIcon={<FormatListBulletedIcon />}
                    onClick={() => setListoneOpen(true)}
                    style={{
                        backgroundColor: '#2ecc71',
                        color: 'white',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        borderRadius: '8px',
                        padding: '10px 20px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    }}
                >
                    Apri Listone
                </Button>
            </Stack>

            {/* SEZIONE ASTA */}
            {activeAuction?.player && (

                <div style={{ marginBottom: '40px', position: 'relative' }}>
                    <Stack direction="row" justifyContent="center" alignItems="stretch" spacing={4} marginBottom={3}>
                        <Box flex={1} display="flex" flexDirection="column">
                            <PlayerCard
                                player={activeAuction.player}
                                currentBid={activeAuction.highestBid}
                                onBid={handleBid}
                                title="🔨 ASTA IN CORSO"
                            />
                        </Box>
                        <Box flex={1} display="flex" flexDirection="column">
                            <AuctionLog history={activeAuction.history} />
                        </Box>
                    </Stack>
                </div>
            )}

            {loadingPlayers ? (
                <p>Caricamento in corso...</p>
            ) : (
                <PlayerTable
                    open={isListoneOpen}
                    onClose={() => setListoneOpen(false)}
                    players={players}
                    onPlayerClick={handleStartAuction}
                />
            )}
        </div>
    );
}