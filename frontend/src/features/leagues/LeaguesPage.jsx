import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';

import LeaguesList from './components/LeaguesList';
import { getLeagues, postLeague, putLeague, delLeague } from '../../api/leaguesApi';

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
        borderLeft: '5px solid #f1c40f' // Giallo per i trofei/leghe
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

const LeaguesPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Queries
    const { data: leagues = [], isLoading: loading } = useQuery({
        queryKey: ['leagues'],
        queryFn: getLeagues
    });

    // Helper per gestire errori 401 e redirect al login
    const handleMutationError = (error, actionContext) => {
        if (error.response && error.response.status === 401) {
            navigate('/login');
        } else {
            alert(`Errore ${actionContext}: ${error.message}`);
        }
    };

    // Mutations
    const { mutate: createLeague } = useMutation({
        mutationFn: postLeague,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues'] }),
        onError: (error) => handleMutationError(error, 'creazione')
    });

    const { mutate: updateLeague } = useMutation({
        mutationFn: async ({ id, name }) => putLeague({ id, leaguename: name }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues'] }),
        onError: (error) => handleMutationError(error, 'modifica')
    });

    const { mutate: removeLeague } = useMutation({
        mutationFn: delLeague,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['leagues'] }),
        onError: (error) => handleMutationError(error, 'cancellazione')
    });

    return (
        <Box style={styles.container}>
            <Paper style={styles.headerPaper} elevation={0}>
                <EmojiEventsIcon style={{ fontSize: 40, color: '#f1c40f' }} />
                <Box>
                    <Typography variant="h5" style={styles.headerTitle}>
                        Le Tue Leghe
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Gestisci le competizioni e le squadre
                    </Typography>
                </Box>
            </Paper>

            {loading ? (
                <Box style={styles.loadingContainer}>
                    <CircularProgress />
                </Box>
            ) : (
                <LeaguesList
                    leagues={leagues}
                    onAdd={createLeague}
                    onUpdate={updateLeague}
                    onDelete={removeLeague}
                />
            )}
        </Box>
    );
};

export default LeaguesPage;
