import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Paper, CircularProgress, Button } from '@mui/material';
import GroupsIcon from '@mui/icons-material/Groups';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

import TeamsList from './components/TeamsList';
import { getTeams, postTeam, putTeam, delTeam } from '../../api/teamsApi'; // Usa il nuovo hook per le leghe

const styles = {
    container: {
        padding: '20px',
        fontFamily: 'Arial',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    headerPaper: {
        padding: '20px',
        marginBottom: '30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderLeft: '5px solid #3498db'
    },
    headerTitleBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px'
    },
    headerTitle: {
        fontWeight: 'bold',
        color: '#2f3542',
        textTransform: 'uppercase',
        letterSpacing: '1px'
    },
    loadingContainer: {
        display: 'flex', 
        justifyContent: 'center', 
        padding: '50px'
    },
    auctionButton: {
        fontWeight: 'bold',
        textTransform: 'none',
        borderRadius: '8px',
        padding: '8px 20px'
    }
};

const TeamsPage = () => {
    const navigate = useNavigate();
    const { leagueId } = useParams();
    const queryClient = useQueryClient();

    // Queries
    const { data: teams = [], isLoading: loading } = useQuery({
        queryKey: ['teams', leagueId],
        queryFn: () => getTeams(leagueId)
    });

    // Mutations
    const { mutate: createTeam } = useMutation({
        mutationFn: async (name) => postTeam({ teamName: name, leagueId: Number(leagueId) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams', leagueId] }),
        onError: (error) => alert(`Errore creazione: ${error.message}`)
    });

    const { mutate: updateTeam } = useMutation({
        mutationFn: async ({ id, name }) => putTeam({ id, teamname: name }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams', leagueId] }),
        onError: (error) => alert(`Errore modifica: ${error.message}`)
    });

    const { mutate: removeTeam } = useMutation({
        mutationFn: delTeam,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams', leagueId] }),
        onError: (error) => alert(`Errore cancellazione: ${error.message}`)
    });

    const handleStartAuction = () => {
        localStorage.removeItem('adminTeamId');
        navigate(`/auction/${leagueId}`);
    };

    return (
        <Box style={styles.container}>
            <Paper style={styles.headerPaper} elevation={0}>
                <Box style={styles.headerTitleBox}>
                    <GroupsIcon style={{ fontSize: 40, color: '#3498db' }} />
                    <Box>
                        <Typography variant="h5" style={styles.headerTitle}>
                            Squadre & Partecipanti
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                            Lega ID: {leagueId}
                        </Typography>
                    </Box>
                </Box>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    startIcon={<PlayArrowIcon />}
                    onClick={handleStartAuction}
                    style={styles.auctionButton}
                >
                    Avvia Asta
                </Button>
            </Paper>

            {loading ? (
                <Box style={styles.loadingContainer}>
                    <CircularProgress />
                </Box>
            ) : (
                <TeamsList
                    teams={teams}
                    onAdd={createTeam}
                    onUpdate={updateTeam}
                    onDelete={removeTeam}
                />
            )}
        </Box>
    );
};

export default TeamsPage;
