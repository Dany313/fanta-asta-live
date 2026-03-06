import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import React from 'react';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

// Definiamo la struttura della rosa e i colori per ogni ruolo
const ROSTER_CONFIG = {
    'P': { count: 3, color: '#f3e009b0' }, // Portieri (giallino)
    'D': { count: 8, color: '#45c24fc2' }, // Difensori (verdino)
    'C': { count: 8, color: '#2386ccce' }, // Centrocampisti (blu chiaro)
    'A': { count: 6, color: '#f50e31b9' }  // Attaccanti (rosso chiaro)
};

// Definiamo l'ordine di visualizzazione dei ruoli
const ROLES_ORDER = ['P', 'D', 'C', 'A'];

const RosterList = ({ players }) => {

    // Raggruppiamo i giocatori per ruolo per un accesso più efficiente
    const playersByRole = players.reduce((acc, player) => {
        const role = player.role;
        if (!acc[role]) {
            acc[role] = [];
        }
        acc[role].push(player);
        return acc;
    }, {});

    return (
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
                                            <IconButton onClick={() => { /* Non implementato */ }} aria-label="delete player">
                                                <DeleteIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton onClick={() => { /* Non implementato */ }} aria-label="add player">
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
    );
};

export default RosterList;