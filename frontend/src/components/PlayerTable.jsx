import React, { useState, useMemo, useEffect } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Box from '@mui/material/Box';
import TablePagination from '@mui/material/TablePagination';
import PlayerListTile from './PlayerListTile';

const styles = {
    dialogTitle: {
        backgroundColor: '#f1f2f6',
        color: '#2f3542',
        fontWeight: 'bold',
        borderBottom: '1px solid #dfe4ea',
        paddingBottom: '20px'
    },
    filterContainer: {
        display: 'flex',
        gap: '15px',
        marginTop: '10px'
    }
};

export default function PlayerTable({ open, onClose, players, onPlayerClick }) {
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("");
    const [page, setPage] = useState(0);
    const rowsPerPage = 20;

    const handlePlayerSelect = (player) => {
        onPlayerClick(player);
        onClose(); // Chiude la modale dopo la selezione
    };

    // Filtra i giocatori in base all'input locale
    const filteredPlayers = useMemo(() => {
        return players.filter(player => {
            const nameMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
            const roleMatch = !roleFilter || player.role === roleFilter;
            return nameMatch && roleMatch;
        });
    }, [players, searchTerm, roleFilter]);

    useEffect(() => {
        setPage(0);
    }, [searchTerm, roleFilter]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    return (
            <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm" scroll="paper">
                <DialogTitle style={styles.dialogTitle}>
                    📋 Listone Giocatori
                    <Box style={styles.filterContainer}>
                        <TextField
                            label="Cerca giocatore..."
                            variant="outlined"
                            size="small"
                            fullWidth
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <FormControl size="small" style={{ minWidth: 100 }}>
                            <InputLabel>Ruolo</InputLabel>
                            <Select
                                value={roleFilter}
                                label="Ruolo"
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <MenuItem value="">Tutti</MenuItem>
                                <MenuItem value="P">P</MenuItem>
                                <MenuItem value="D">D</MenuItem>
                                <MenuItem value="C">C</MenuItem>
                                <MenuItem value="A">A</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogTitle>
                <DialogContent dividers>
                    <List>
                        {filteredPlayers.length > 0 ? (
                            filteredPlayers
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((player) => (
                                <PlayerListTile 
                                    key={player.id} 
                                    player={player} 
                                    onClick={handlePlayerSelect} 
                                />
                            ))
                        ) : (
                            <p style={{ textAlign: 'center', color: '#a4b0be', marginTop: '20px' }}>
                                Nessun giocatore trovato.
                            </p>
                        )}
                    </List>
                </DialogContent>
                <Box sx={{ borderTop: '1px solid #dfe4ea', backgroundColor: '#f8f9fa' }}>
                    <TablePagination
                        component="div"
                        count={filteredPlayers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        rowsPerPageOptions={[20]}
                        onRowsPerPageChange={() => {}}
                    />
                </Box>
                <DialogActions>
                    <Button onClick={onClose} color="primary">Chiudi</Button>
                </DialogActions>
            </Dialog>
    );
}