import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Box, Typography, Paper, CircularProgress } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';

import RosterList from './components/RosterList';
import { getRoster, addPlayerToRoster, putPlayerPrice, removePlayerFromRoster } from '../../api/rosterApi';
import { getPlayers } from '../../api/playersApi';
import { getTeamById, putTeam } from '../../api/teamsApi';
import EditIcon from '@mui/icons-material/Edit';
import { Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField } from '@mui/material';

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
    const [editBudgetOpen, setEditBudgetOpen] = React.useState(false);
    const [newBudget, setNewBudget] = React.useState('');

    // Queries
    const { data: team } = useQuery({
        queryKey: ['team', teamId],
        queryFn: () => getTeamById(teamId)
    });
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
        mutationFn: async ({ playerId, refundMode }) => {
            return removePlayerFromRoster({ team_id: teamId, player_id: playerId, refundMode });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rosters'] });
            queryClient.invalidateQueries({ queryKey: ['players'] });
            queryClient.invalidateQueries({ queryKey: ['team'] });
        },
        onError: (error) => alert(`Errore cancellazione: ${error.message}`)
    });

    const { mutate: updateBudget } = useMutation({
        mutationFn: async (budget) => {
            return putTeam({ id: teamId, remainingBudget: parseInt(budget, 10) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['team'] });
            setEditBudgetOpen(false);
        },
        onError: (error) => alert(`Errore modifica budget: ${error.message}`)
    });

    const handleOpenEditBudget = () => {
        if (team) {
            setNewBudget(team.remainingBudget);
            setEditBudgetOpen(true);
        }
    };

    const handleSaveBudget = () => {
        if (newBudget >= 0) {
            updateBudget(newBudget);
        }
    };

    return (
        <Box style={styles.container}>
            <Paper style={styles.headerPaper} elevation={0}>
                <GroupIcon style={{ fontSize: 40, color: '#3498db' }} />
                <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h5" style={styles.headerTitle}>
                        Gestione Rosa {team ? `- ${team.name}` : ''}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        Budget Rimanente: <strong>{team?.remainingBudget ?? '-'} FM</strong> | 
                        Puntata Massima: <strong>{team?.maxPossibleBid ?? '-'} FM</strong>
                    </Typography>
                </Box>
                <Button 
                    variant="outlined" 
                    startIcon={<EditIcon />} 
                    onClick={handleOpenEditBudget}
                >
                    Modifica Budget
                </Button>
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

            <Dialog open={editBudgetOpen} onClose={() => setEditBudgetOpen(false)}>
                <DialogTitle>Modifica Budget</DialogTitle>
                <DialogContent style={{ paddingTop: '10px' }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nuovo Budget Rimanente"
                        type="number"
                        fullWidth
                        value={newBudget}
                        onChange={(e) => setNewBudget(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditBudgetOpen(false)} color="secondary">Annulla</Button>
                    <Button onClick={handleSaveBudget} variant="contained" color="primary">Salva</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default RosterPage;
