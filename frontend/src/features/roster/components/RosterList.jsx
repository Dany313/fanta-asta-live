import React, { useState, useMemo } from 'react';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Box, Avatar, IconButton, Button, TextField, Autocomplete,
    Dialog, DialogTitle, DialogContent, DialogActions, Chip, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import SaveIcon from '@mui/icons-material/Save';

const styles = {
    container: {
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #dfe4ea',
        overflow: 'hidden',
        boxShadow: '0 8px 20px rgba(0,0,0,0.05)',
    },
    addSection: {
        padding: '20px',
        backgroundColor: 'white',
        borderBottom: '1px solid #f1f2f6',
        marginBottom: '20px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#2f3542',
        marginBottom: '15px',
        textTransform: 'uppercase',
        fontSize: '14px',
        letterSpacing: '1px'
    },
    tableHead: {
        backgroundColor: '#f1f2f6',
    },
    tableHeadCell: {
        fontWeight: 'bold',
        color: '#747d8c',
        textTransform: 'uppercase',
        fontSize: '12px'
    },
    roleBadge: (role) => {
        const colors = { 'P': '#f39c12', 'D': '#2ecc71', 'C': '#3498db', 'A': '#e74c3c' };
        return {
            backgroundColor: colors[role] || '#95a5a6',
            color: 'white',
            fontWeight: 'bold',
            width: '32px',
            height: '32px',
            fontSize: '14px',
        };
    },
    totalBox: {
        marginTop: '20px',
        padding: '15px',
        backgroundColor: '#2f3542',
        color: 'white',
        borderRadius: '8px',
        textAlign: 'right',
        fontWeight: 'bold'
    },
    formRow: {
        display: 'flex',
        gap: '15px',
        alignItems: 'center',
        flexWrap: 'wrap'
    },
    addButton: {
        backgroundColor: '#2ecc71',
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'none',
        height: '40px', // Align with inputs
        '&:hover': { backgroundColor: '#27ae60' }
    }
};

export default function RosterList({ players, allPlayers, onAdd, onUpdate, onDelete }) {
    // State per l'aggiunta
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [purchasePrice, setPurchasePrice] = useState(1);

    // State per la modifica
    const [editOpen, setEditOpen] = useState(false);
    const [editPlayerId, setEditPlayerId] = useState(null);
    const [editPrice, setEditPrice] = useState(0);

    // Calcoli derivati
    const sortedPlayers = useMemo(() => {
        const roleOrder = { 'P': 1, 'D': 2, 'C': 3, 'A': 4 };
        return [...players].sort((a, b) => roleOrder[a.role] - roleOrder[b.role]);
    }, [players]);

    const totalSpent = useMemo(() => players.reduce((sum, p) => sum + p.purchase_price, 0), [players]);

    // Handlers
    const handleAdd = () => {
        if (selectedPlayer && purchasePrice > 0) {
            onAdd({ player: selectedPlayer, price: purchasePrice });
            setSelectedPlayer(null);
            setPurchasePrice(1);
        }
    };

    const openEdit = (player) => {
        setEditPlayerId(player.player_id);
        setEditPrice(player.purchase_price);
        setEditOpen(true);
    };

    const handleUpdate = () => {
        if (editPlayerId && editPrice >= 0) {
            onUpdate({ playerId: editPlayerId, price: editPrice });
            setEditOpen(false);
        }
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Rimuovere ${name} dalla rosa?`)) {
            onDelete(id);
        }
    };

    return (
        <div>
            {/* SEZIONE AGGIUNTA GIOCATORE */}
            <Paper style={styles.addSection} elevation={0}>
                <Typography style={styles.sectionTitle}>
                    ➕ Aggiungi Giocatore
                </Typography>
                <Box style={styles.formRow}>
                    <Autocomplete
                        options={allPlayers}
                        getOptionLabel={(option) => `${option.name} (${option.role}) - ${option.club}`}
                        value={selectedPlayer}
                        onChange={(event, newValue) => setSelectedPlayer(newValue)}
                        sx={{ flex: 1, minWidth: '250px' }}
                        renderInput={(params) => <TextField {...params} label="Cerca Giocatore" size="small" />}
                        renderOption={(props, option) => (
                            <li {...props} key={option.id}>
                                <Avatar sx={{ ...styles.roleBadge(option.role), width: 24, height: 24, fontSize: 10, marginRight: 2 }}>
                                    {option.role}
                                </Avatar>
                                {option.name} <span style={{color:'#bdc3c7', fontSize:'0.8em', marginLeft: '5px'}}> {option.club}</span>
                            </li>
                        )}
                    />
                    <TextField
                        type="number"
                        label="Prezzo"
                        value={purchasePrice}
                        onChange={(e) => setPurchasePrice(parseInt(e.target.value) || 0)}
                        size="small"
                        sx={{ width: '120px' }}
                        InputProps={{ inputProps: { min: 1 } }}
                    />
                    <Button
                        variant="contained"
                        startIcon={<AddCircleIcon />}
                        onClick={handleAdd}
                        disabled={!selectedPlayer || purchasePrice <= 0}
                        sx={styles.addButton}
                    >
                        Acquista
                    </Button>
                </Box>
            </Paper>

            {/* TABELLA ROSA */}
            <Paper style={styles.container} elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead style={styles.tableHead}>
                            <TableRow>
                                <TableCell style={styles.tableHeadCell}>Ruolo</TableCell>
                                <TableCell style={styles.tableHeadCell}>Nome</TableCell>
                                <TableCell style={styles.tableHeadCell} align="right">Prezzo</TableCell>
                                <TableCell style={styles.tableHeadCell} align="center">Azioni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedPlayers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" style={{ padding: '30px', color: '#bdc3c7' }}>
                                        Nessun giocatore in rosa
                                    </TableCell>
                                </TableRow>
                            ) : (
                                sortedPlayers.map((player) => (
                                    <TableRow key={player.player_id} hover>
                                        <TableCell>
                                            <Avatar sx={styles.roleBadge(player.role)}>
                                                {player.role}
                                            </Avatar>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#2f3542' }}>
                                                {player.name}
                                            </Typography>
                                            <Typography variant="caption" style={{ color: '#7f8c8d' }}>
                                                {player.club}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip label={`${player.purchase_price} FM`} size="small" variant="outlined" style={{ fontWeight: 'bold' }} />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton 
                                                    size="small" 
                                                    color="primary" 
                                                    onClick={() => openEdit(player)}
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton 
                                                    size="small" 
                                                    color="error" 
                                                    onClick={() => handleDelete(player.player_id, player.name)}
                                                >
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Paper>

            <Box style={styles.totalBox}>
                Totale Speso: {totalSpent} FM
            </Box>

            {/* DIALOG EDIT PREZZO */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
                <DialogTitle>Modifica Prezzo</DialogTitle>
                <DialogContent style={{ paddingTop: '10px' }}>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Nuovo Prezzo Acquisto"
                        type="number"
                        fullWidth
                        value={editPrice}
                        onChange={(e) => setEditPrice(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setEditOpen(false)} color="secondary">Annulla</Button>
                    <Button onClick={handleUpdate} variant="contained" color="primary" startIcon={<SaveIcon />}>
                        Salva
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}
