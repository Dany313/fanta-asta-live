import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerTable from '../../components/PlayerTable';
import PlayerCard from './components/PlayerCard';
import AuctionLog from './components/AuctionLog'; // 🌟 IMPORTATO
import Button from '@mui/material/Button';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CancelIcon from '@mui/icons-material/Cancel';
import StopIcon from '@mui/icons-material/Stop';

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

export default function AdminDashboard() {
    const { leagueId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        if (!localStorage.getItem('adminTeamId')) {
            navigate(`/selectTeam/${leagueId}`);
        }
    }, [leagueId, navigate]);

    // 1. Inizializza i WebSockets
    const socket = useAuctionSocket();

    // 2. Leggi lo stato in tempo reale da Zustand
    const activeAuction = useAuctionStore((state) => state.activeAuction);

    useEffect(() => {
        if (socket) {
            const handleAbort = () => {
                useAuctionStore.setState({ activeAuction: {} });
            };
            socket.on('auction_aborted', handleAbort);
            return () => socket.off('auction_aborted', handleAbort);
        }
    }, [socket]);

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

    // 4. Client State (Solo cose visive)
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState('');
    const [isListoneOpen, setListoneOpen] = useState(false);

    const handleStartAuction = (player) => socket.emit('start_auction_admin', player);

    const handleAdminBid = (teamId_, amount) => {

        const teamId = teamId_ || localStorage.getItem('adminTeamId');
        if (!teamId) return;


        const teamName = teams.find(t => t.id === Number(teamId))?.name;
        socket.emit('place_bid', { teamId: Number(teamId), teamName, amount });
    };

    const handleAssign = () => {
        if (window.confirm(`Vendere ${activeAuction.player.name} a ${activeAuction.highestBidderName} per ${activeAuction.highestBid}?`)) {
            socket.emit('assign_player');
        }
    };

    const handleAbort = () => {
        if (window.confirm(`Sei sicuro di voler annullare l'asta per ${activeAuction.player.name}?`)) {
            socket.emit('abort_auction');
        }
    };

    const handleEndAuction = () => {
        if (window.confirm("Sei sicuro di voler concludere l'asta in corso?")) {
            socket.emit('auction_end');
            useAuctionStore.setState({ activeAuction: {} });
            navigate(`/`);
                        // navigate(`/league/${leagueId}`);

        }
    };

    const filteredPlayers = players.filter(player => {
        const nameMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = !roleFilter || player.role.toUpperCase() === roleFilter.toUpperCase();
        return nameMatch && roleMatch;
    });

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            {/* ... Intestazione identica al tuo codice ... */}

            <Stack direction="row" justifyContent="space-between" alignItems="start" style={{ marginBottom: '30px' }}>
                <InvitePanel teams={teams} />
                <Stack direction="row" spacing={2}>
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
                    <Button
                        variant="contained"
                        startIcon={<StopIcon />}
                        onClick={handleEndAuction}
                        style={{
                            backgroundColor: '#e74c3c',
                            color: 'white',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            borderRadius: '8px',
                            padding: '10px 20px',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                        }}
                    >
                        Concludi Asta
                    </Button>
                </Stack>
            </Stack>

            {/* SEZIONE ASTA */}
            {activeAuction?.player && (

                <div style={{ marginBottom: '40px', position: 'relative' }}>
                    <AdminCustomBet teams={teams} handleCustomBet={handleAdminBid} />
                    <Stack direction="row" justifyContent="center" alignItems="stretch" spacing={4} marginBottom={3}>
                        <Box flex={1} display="flex" flexDirection="column" gap={2}>
                            <PlayerCard
                                player={activeAuction.player}
                                currentBid={activeAuction.highestBid}
                                onBid={handleAdminBid}
                            />
                            <Button 
                                variant="contained" 
                                color="error" 
                                startIcon={<CancelIcon />}
                                onClick={handleAbort}
                                fullWidth
                            >
                                Annulla Asta
                            </Button>
                        </Box>
                        <Box flex={1} display="flex" flexDirection="column">
                            <AuctionLog history={activeAuction.history} />
                        </Box>
                    </Stack>
                    <AssignPlayerButton
                        onClick={handleAssign}
                        disabled={!activeAuction.highestBid || activeAuction.highestBid <= 0}
                    />
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