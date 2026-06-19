import React, { useState } from 'react';
import { Paper, Typography, Box, Stack, Avatar, IconButton, Chip, Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removePlayerFromRoster, putPlayerPrice } from '../../../api/rosterApi';
import { putTeam } from '../../../api/teamsApi';

const styles = {
    container: {
        marginTop: '30px',
        width: '100%',
        overflowX: 'auto',
        display: 'flex',
        gap: '20px',
        paddingBottom: '20px'
    },
    teamColumn: {
        minWidth: '320px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        border: '1px solid #dfe4ea',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
    },
    teamHeader: {
        backgroundColor: '#2f3542',
        color: '#fff',
        padding: '15px',
        textAlign: 'center',
        position: 'relative'
    },
    teamName: {
        fontWeight: 'bold',
        textTransform: 'uppercase',
        fontSize: '18px'
    },
    teamBudget: {
        fontSize: '14px',
        color: '#ced6e0'
    },
    editBudgetBtn: {
        position: 'absolute',
        right: '10px',
        top: '15px',
        color: '#fff',
        padding: '4px'
    },
    slotRow: {
        display: 'flex',
        alignItems: 'center',
        padding: '8px 12px',
        borderBottom: '1px solid #f1f2f6',
        minHeight: '40px'
    },
    roleBadge: (role) => {
        const colors = { 'P': '#f39c12', 'D': '#2ecc71', 'C': '#3498db', 'A': '#e74c3c' };
        return {
            backgroundColor: colors[role] || '#95a5a6',
            color: 'white',
            fontWeight: 'bold',
            width: '24px',
            height: '24px',
            fontSize: '12px',
            marginRight: '10px'
        };
    },
    emptyText: {
        color: '#b2bec3',
        fontStyle: 'italic',
        fontSize: '14px',
        flex: 1
    },
    playerName: {
        fontWeight: 'bold',
        fontSize: '14px',
        color: '#2f3542',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        maxWidth: '120px'
    },
    clubText: {
        fontSize: '11px',
        color: '#747d8c',
        marginLeft: '5px'
    },
    actionBtn: {
        padding: '4px'
    }
};

export default function TeamsOverviewGrid({ teams, rosters, isAdmin }) {
    const queryClient = useQueryClient();

    // Modals State
    const [editBudgetOpen, setEditBudgetOpen] = useState(false);
    const [editBudgetTeam, setEditBudgetTeam] = useState(null);
    const [newBudget, setNewBudget] = useState('');

    const [editPriceOpen, setEditPriceOpen] = useState(false);
    const [editPricePlayer, setEditPricePlayer] = useState(null);
    const [newPrice, setNewPrice] = useState('');

    const [deletePlayerOpen, setDeletePlayerOpen] = useState(false);
    const [deletePlayerTarget, setDeletePlayerTarget] = useState(null);

    // Mutations
    const updateBudgetMut = useMutation({
        mutationFn: async ({ teamId, budget }) => putTeam({ id: teamId, remainingBudget: parseInt(budget, 10) }),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ['teams'] }),
        onError: (e) => alert(`Errore: ${e.message}`)
    });

    const updatePriceMut = useMutation({
        mutationFn: async ({ teamId, playerId, price }) => putPlayerPrice({ team_id: teamId, player_id: playerId, price: parseInt(price, 10) }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roster'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
        onError: (e) => alert(`Errore: ${e.message}`)
    });

    const deletePlayerMut = useMutation({
        mutationFn: async ({ teamId, playerId, refundMode }) => removePlayerFromRoster({ team_id: teamId, player_id: playerId, refundMode }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['roster'] });
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            queryClient.invalidateQueries({ queryKey: ['players'] });
        },
        onError: (e) => alert(`Errore: ${e.message}`)
    });

    // Handlers
    const openEditBudget = (team) => {
        setEditBudgetTeam(team);
        setNewBudget(team.remaining_budget ?? team.remainingBudget);
        setEditBudgetOpen(true);
    };

    const handleSaveBudget = () => {
        if (editBudgetTeam && newBudget >= 0) {
            updateBudgetMut.mutate({ teamId: editBudgetTeam.id, budget: newBudget });
            setEditBudgetOpen(false);
        }
    };

    const openEditPrice = (player, teamId) => {
        setEditPricePlayer({ ...player, teamId });
        setNewPrice(player.purchase_price);
        setEditPriceOpen(true);
    };

    const handleSavePrice = () => {
        if (editPricePlayer && newPrice >= 0) {
            updatePriceMut.mutate({ teamId: editPricePlayer.teamId, playerId: editPricePlayer.player_id, price: newPrice });
            setEditPriceOpen(false);
        }
    };

    const openDeletePlayer = (player, teamId) => {
        setDeletePlayerTarget({ ...player, teamId });
        setDeletePlayerOpen(true);
    };

    const handleConfirmDelete = (refundMode) => {
        if (deletePlayerTarget) {
            deletePlayerMut.mutate({ teamId: deletePlayerTarget.teamId, playerId: deletePlayerTarget.player_id, refundMode });
            setDeletePlayerOpen(false);
        }
    };

    // Configuration
    const rolesConfig = [
        { role: 'P', label: 'Portieri', minSlots: 3 },
        { role: 'D', label: 'Difensori', minSlots: 8 },
        { role: 'C', label: 'Centrocampisti', minSlots: 8 },
        { role: 'A', label: 'Attaccanti', minSlots: 6 },
    ];

    return (
        <Box style={styles.container}>
            {teams.map(team => {
                const teamRosters = rosters.filter(r => r.team_id === team.id);
                
                return (
                    <Box key={team.id} style={styles.teamColumn}>
                        {/* HEADER */}
                        <Box style={styles.teamHeader}>
                            <Typography style={styles.teamName}>{team.name}</Typography>
                            <Typography style={styles.teamBudget}>
                                Budget: {team.remaining_budget ?? team.remainingBudget} FM | Max: {team.max_possible_bid ?? team.maxPossibleBid} FM
                            </Typography>
                            {isAdmin && (
                                <IconButton style={styles.editBudgetBtn} onClick={() => openEditBudget(team)}>
                                    <EditIcon fontSize="small" />
                                </IconButton>
                            )}
                        </Box>

                        {/* BODY */}
                        <Box style={{ flex: 1 }}>
                            {rolesConfig.map(config => {
                                const rolePlayers = teamRosters.filter(p => p.role === config.role);
                                const numSlots = Math.max(config.minSlots, rolePlayers.length);
                                
                                const slots = [];
                                for (let i = 0; i < numSlots; i++) {
                                    const player = rolePlayers[i];
                                    slots.push(
                                        <Box key={`${config.role}-${i}`} style={styles.slotRow}>
                                            <Avatar sx={styles.roleBadge(config.role)}>{config.role}</Avatar>
                                            
                                            {player ? (
                                                <>
                                                    <Box style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                                        <Typography style={styles.playerName}>{player.name}</Typography>
                                                        <Typography style={styles.clubText}>{player.club}</Typography>
                                                    </Box>
                                                    
                                                    <Chip label={player.purchase_price} size="small" style={{ fontWeight: 'bold', marginRight: '5px' }} />
                                                    
                                                    {isAdmin && (
                                                        <Stack direction="row" spacing={0.5}>
                                                            <IconButton style={styles.actionBtn} color="primary" onClick={() => openEditPrice(player, team.id)}>
                                                                <EditIcon style={{ fontSize: '16px' }} />
                                                            </IconButton>
                                                            <IconButton style={styles.actionBtn} color="error" onClick={() => openDeletePlayer(player, team.id)}>
                                                                <DeleteIcon style={{ fontSize: '16px' }} />
                                                            </IconButton>
                                                        </Stack>
                                                    )}
                                                </>
                                            ) : (
                                                <Typography style={styles.emptyText}>- Vuoto -</Typography>
                                            )}
                                        </Box>
                                    );
                                }
                                return slots;
                            })}
                        </Box>
                    </Box>
                );
            })}

            {/* MODALS FOR ADMIN */}
            {isAdmin && (
                <>
                    {/* EDIT BUDGET */}
                    <Dialog open={editBudgetOpen} onClose={() => setEditBudgetOpen(false)}>
                        <DialogTitle>Modifica Budget ({editBudgetTeam?.name})</DialogTitle>
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

                    {/* EDIT PRICE */}
                    <Dialog open={editPriceOpen} onClose={() => setEditPriceOpen(false)}>
                        <DialogTitle>Modifica Prezzo ({editPricePlayer?.name})</DialogTitle>
                        <DialogContent style={{ paddingTop: '10px' }}>
                            <TextField
                                autoFocus
                                margin="dense"
                                label="Nuovo Prezzo Acquisto"
                                type="number"
                                fullWidth
                                value={newPrice}
                                onChange={(e) => setNewPrice(e.target.value)}
                            />
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setEditPriceOpen(false)} color="secondary">Annulla</Button>
                            <Button onClick={handleSavePrice} variant="contained" color="primary">Salva</Button>
                        </DialogActions>
                    </Dialog>

                    {/* DELETE PLAYER */}
                    <Dialog open={deletePlayerOpen} onClose={() => setDeletePlayerOpen(false)} maxWidth="sm" fullWidth>
                        <DialogTitle style={{ backgroundColor: '#f8d7da', color: '#721c24' }}>
                            Svincola Giocatore
                        </DialogTitle>
                        <DialogContent style={{ paddingTop: '20px' }}>
                            <Typography variant="body1" gutterBottom>
                                Stai per eliminare <strong>{deletePlayerTarget?.name}</strong> dalla rosa di <strong>{teams.find(t=>t.id === deletePlayerTarget?.teamId)?.name}</strong>.
                            </Typography>
                            <Typography variant="body2" color="textSecondary" style={{ marginBottom: '20px' }}>
                                Scegli l'importo da rimborsare alla squadra:
                            </Typography>
                            
                            <Box display="flex" flexDirection="column" gap={2}>
                                <Button 
                                    variant="outlined" 
                                    color="primary"
                                    onClick={() => handleConfirmDelete('PURCHASE')}
                                    style={{ justifyContent: 'space-between', padding: '10px 20px' }}
                                >
                                    <span>Prezzo d'Acquisto</span>
                                    <strong>{deletePlayerTarget?.purchase_price} FM</strong>
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    color="secondary"
                                    onClick={() => handleConfirmDelete('CURRENT')}
                                    style={{ justifyContent: 'space-between', padding: '10px 20px' }}
                                >
                                    <span>Quotazione Attuale</span>
                                    <strong>{deletePlayerTarget?.current_price ?? 0} FM</strong>
                                </Button>
                            </Box>
                        </DialogContent>
                        <DialogActions style={{ padding: '15px' }}>
                            <Button onClick={() => setDeletePlayerOpen(false)} style={{ color: '#7f8c8d' }}>
                                Annulla
                            </Button>
                        </DialogActions>
                    </Dialog>
                </>
            )}
        </Box>
    );
}
