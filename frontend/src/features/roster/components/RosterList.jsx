import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import React, { useState } from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import Button from '@mui/material/Button';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Box from '@mui/material/Box';
import PlayerTable from '../../../components/PlayerTable';
import Drawer from '@mui/material/Drawer';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// Definiamo la struttura della rosa e i colori per ogni ruolo
const ROSTER_CONFIG = {
    'P': { count: 3, color: '#f3e009b0' }, // Portieri (giallino)
    'D': { count: 8, color: '#45c24fc2' }, // Difensori (verdino)
    'C': { count: 8, color: '#2386ccce' }, // Centrocampisti (blu chiaro)
    'A': { count: 6, color: '#f50e31b9' }  // Attaccanti (rosso chiaro)
};

// Definiamo l'ordine di visualizzazione dei ruoli
const ROLES_ORDER = ['P', 'D', 'C', 'A'];

const RosterList = ({ players, allPlayers, onAdd, onUpdate, onDelete }) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [roleToAdd, setRoleToAdd] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    const handleMenuClick = (event, player) => {
        setAnchorEl(event.currentTarget);
        setSelectedPlayer(player);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
        setSelectedPlayer(null);
    };

    const handleOpenModal = (role) => {
        setRoleToAdd(role);
        setSearchQuery('');
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRoleToAdd(null);
    };

    const handlePlayerSelect = (player) => {
        onAdd(player);
        handleCloseModal();
    };

    // Raggruppiamo i giocatori per ruolo per un accesso più efficiente
    const playersByRole = players.reduce((acc, player) => {
        const role = player.role;
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(player);
        return acc;
    }, {});

    const availablePlayers = allPlayers.filter(p => 
        p.role === roleToAdd && 
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Ruolo</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Nome</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>V.a</TableCell>
                            <TableCell sx={{ fontWeight: 'bold', textAlign: 'center' }}>Azioni</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {ROLES_ORDER.flatMap(role => {
                            const config = ROSTER_CONFIG[role];
                            const rolePlayers = playersByRole[role] || [];
                            const rows = [];

                            for (let i = 0; i < config.count; i++) {
                                const player = rolePlayers[i];
                                rows.push(
                                    <TableRow key={`${role}-${i}`} sx={{ backgroundColor: config.color }}>
                                        <TableCell component="th" scope="row">{player ? player.role : role}</TableCell>
                                        <TableCell>{player ? player.name.toUpperCase() : ''}</TableCell>
                                        <TableCell>{player ? player.purchase_price : ''}</TableCell>
                                        <TableCell sx={{ textAlign: 'center' }}>
                                            {player ? (
                                                <>
                                                    <IconButton aria-haspopup="true" aria-label="actions" onClick={(e) => handleMenuClick(e, player)}>
                                                        <MoreVertIcon />
                                                    </IconButton>
                                                </>
                                            ) : (
                                                <IconButton onClick={() => handleOpenModal(role)} aria-label="add player">
                                                    <AddIcon />
                                                </IconButton>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                );
                            }
                            return rows;
                        })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
            >
                <MenuItem onClick={() => { if (selectedPlayer) onUpdate(selectedPlayer.id || selectedPlayer.player_id); handleMenuClose(); }}>
                    <Button startIcon={<ModeEditIcon />}>
                        Modifica
                    </Button>
                </MenuItem>
                <MenuItem onClick={() => { if (selectedPlayer) onDelete(selectedPlayer.id || selectedPlayer.player_id); handleMenuClose(); }}>
                    <Button startIcon={<DeleteIcon />}>
                        Elimina
                    </Button>
                </MenuItem>
            </Menu>
            <Drawer
                anchor="right"
                open={isModalOpen}
                onClose={handleCloseModal}
            >
                <Box sx={{ width: 450, p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography variant="h5" gutterBottom>
                        Aggiungi Giocatore ({roleToAdd})
                    </Typography>
                    <TextField
                        label="Cerca per nome"
                        variant="outlined"
                        fullWidth
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                        <PlayerTable
                            players={availablePlayers}
                            onPlayerClick={handlePlayerSelect}
                            buttonText="Aggiungi"
                            buttonVariant="contained"
                        />
                    </Box>
                </Box>
            </Drawer>
        </>
    );
};

export default RosterList;