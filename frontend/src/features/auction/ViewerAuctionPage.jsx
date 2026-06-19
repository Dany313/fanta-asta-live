import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerTable from '../../components/PlayerTable';
import PlayerCard from './components/PlayerCard';
import AuctionLog from './components/AuctionLog'; // 🌟 IMPORTATO
import Button from '@mui/material/Button';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';

import InvitePanel from './components/InvitePanel'; // 🌟 IMPORTATO
import TeamsOverviewGrid from './components/TeamsOverviewGrid';


import { useParams } from 'react-router-dom';
import { useAuctionStore } from '../../store/useAuctionStore';
import { useAuctionSocket } from '../../hooks/useAuctionSocket';
import { useQuery } from '@tanstack/react-query';
import { getPlayers } from '../../api/playersApi';
import { getRosterByLeague } from '../../api/rosterApi';
import { getTeams } from '../../api/teamsApi';
import AdminCustomBet from './components/AdminCustomBet';
import { Stack, Box, Typography, Paper } from '@mui/material';
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
    const isSessionActive = useAuctionStore((state) => state.isSessionActive);

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

    const [isListoneOpen, setListoneOpen] = useState(false);

    const handleStartAuction = (player) => {
        const teamId = localStorage.getItem('viewerTeamId');
        const teamName = localStorage.getItem('viewerTeamName');
        socket.emit('start_auction_viewer', { player, teamId, teamName });
    };

    const handleBid = (teamId_, amount) => {

        if (activeAuction.highestBid === 0) {
            alert('Attendi che lasta inizi ufficialmente prima di fare un offerta!');
            return;
        }

        const teamId = teamId_ || localStorage.getItem('viewerTeamId');
        if (!teamId) return;

        socket.emit('place_bid', { teamId: Number(teamId), teamName: localStorage.getItem('viewerTeamName'), amount });
    };

    const viewerTeamId = Number(localStorage.getItem('viewerTeamId'));
    const isWinning = activeAuction?.highestBidderId === viewerTeamId;

    let isRoleFull = false;
    let disableReason = "";
    if (activeAuction?.player && activeAuction?.teamRoleCounts) {
        const playerRole = activeAuction.player.role;
        const roleLimits = { 'P': 3, 'D': 8, 'C': 8, 'A': 6 };
        const currentCount = (activeAuction.teamRoleCounts[viewerTeamId] && activeAuction.teamRoleCounts[viewerTeamId][playerRole]) || 0;
        if (currentCount >= roleLimits[playerRole]) {
            isRoleFull = true;
            disableReason = `Reparto ${playerRole} pieno (${roleLimits[playerRole]}/${roleLimits[playerRole]})`;
        }
    }

    // 4. Se la sessione non è attiva, mostra una schermata di fine asta
    if (socket && !isSessionActive) {
        return (
            <div style={{ padding: '40px 20px', fontFamily: 'Arial', textAlign: 'center' }}>
                <Paper elevation={0} sx={{ p: 5, borderRadius: '16px', maxWidth: '600px', margin: '0 auto', border: '1px solid #f1f2f6', backgroundColor: '#fdfdfd' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 2, color: '#e74c3c' }}>
                        L'asta è conclusa!
                    </Typography>
                    <Typography variant="body1" sx={{ color: '#7f8c8d', mb: 4 }}>
                        L'amministratore ha terminato la sessione d'asta. Grazie per aver partecipato!
                    </Typography>
                    <Button variant="contained" onClick={() => navigate('/')} sx={{ textTransform: 'none', borderRadius: '8px' }}>
                        Torna alla Home
                    </Button>
                </Paper>
            </div>
        );
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>

            {!activeAuction?.player && (
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', md: 'start' }} spacing={2} style={{ marginBottom: '30px' }}>
                    <Box>
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
                        <Typography variant="subtitle1" style={{ marginTop: '10px', color: '#7f8c8d' }}>
                            👤 Collegato come: <strong>{localStorage.getItem('viewerTeamName') || 'Sconosciuto'}</strong>
                        </Typography>
                    </Box>
                </Stack>
            )}

            {/* SEZIONE ASTA */}
            {activeAuction?.player && (

                <div style={{ marginBottom: '40px', position: 'relative' }}>
                    <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="center" alignItems="stretch" spacing={4} marginBottom={3}>
                        <Box flex={1} display="flex" flexDirection="column">
                            <PlayerCard
                                player={activeAuction.player}
                                currentBid={activeAuction.highestBid}
                                onBid={handleBid}
                                isWinning={isWinning}
                                disableBidding={isRoleFull}
                                disableReason={disableReason}
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

            <Box mt={5}>
                <Typography variant="h5" style={{ fontWeight: 'bold', color: '#2f3542', marginBottom: '10px' }}>
                    Visuale Rose
                </Typography>
                <TeamsOverviewGrid teams={teams} rosters={roster} isAdmin={false} />
            </Box>
        </div>
    );
}