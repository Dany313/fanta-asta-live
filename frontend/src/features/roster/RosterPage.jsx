import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

import RosterList from './components/RosterList';
import { getRoster, addPlayerToRoster, putPlayerPrice, removePlayerFromRoster } from '../../api/rosterApi';
import { getPlayers } from '../../api/playersApi';

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
        alignItems: 'center',
        gap: '15px',
        borderLeft: '5px solid #3498db'
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
    }
};

const RosterPage = () => {
    const queryClient = useQueryClient();
    const { teamId } = useParams();

    // Queries
    const { data: roster = [], isLoading: loading } = useQuery({
        queryKey: ['rosters', teamId],
        queryFn: () => getRoster(teamId)
    });

    const { data: allPlayers = [], isLoading: loadingPlayers } = useQuery({
        queryKey: ['players'],
        queryFn: getPlayers,
        select: (data) => data.filter(player => !roster.some(r => r.player_id === player.id))
    });

    // Mutations (UI logic moved to RosterList, here we just handle the API call)
    const { mutate: addPlayer } = useMutation({
        mutationFn: async ({ player, price }) => {
            return addPlayerToRoster({ team_id: teamId, player_id: player.id, price: parseInt(price, 10) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rosters'] });
            queryClient.invalidateQueries({ queryKey: ['players'] }); // Refresh listone too
        },
        onError: (error) => alert(`Errore durante l'inserimento: ${error.message}`)
    });

    const { mutate: updatePrice } = useMutation({
        mutationFn: async ({ playerId, price }) => {
            return putPlayerPrice({ team_id: teamId, player_id: playerId, price: parseInt(price, 10) });
        },
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['rosters'] }),
        onError: (error) => alert(`Errore modifica: ${error.message}`)
    });

    const { mutate: removePlayer } = useMutation({
        mutationFn: async (playerId) => {
            return removePlayerFromRoster({ team_id: teamId, player_id: playerId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rosters'] });
            queryClient.invalidateQueries({ queryKey: ['players'] });
        },
        onError: (error) => alert(`Errore cancellazione: ${error.message}`)
    });

    return (
        <Box style={styles.container}>
            <Paper style={styles.headerPaper} elevation={0}>
                <GroupIcon style={{ fontSize: 40, color: '#3498db' }} />
                <Box>
                    <Typography variant="h5" style={styles.headerTitle}>
                        Gestione Rosa
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Squadra ID: {teamId}
                    </Typography>
                </Box>
            </Paper>

            {loading ? (
                <Box style={styles.loadingContainer}>
                    <CircularProgress />
                </Box>
            ) : (
                <RosterList
                    players={roster}
                    allPlayers={allPlayers}
                    onAdd={addPlayer}
                    onUpdate={updatePrice}
                    onDelete={removePlayer}
                />
            )}
        </Box>
    );
};

export default RosterPage;
