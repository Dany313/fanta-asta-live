import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, IconButton, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import SaveIcon from '@mui/icons-material/Save';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    sectionTitle: {
        fontWeight: 'bold',
        color: '#2f3542',
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
    enterButton: {
        textTransform: 'none',
        fontWeight: 'bold',
        borderRadius: '20px'
    }
};

export default function LeaguesList({ leagues, onAdd, onUpdate, onDelete }) {
    const navigate = useNavigate();

    // State per Dialog Aggiungi
    const [openAdd, setOpenAdd] = useState(false);
    const [newLeagueName, setNewLeagueName] = useState('');

    // State per Dialog Modifica
    const [openEdit, setOpenEdit] = useState(false);
    const [editLeague, setEditLeague] = useState(null);
    const [editLeagueName, setEditLeagueName] = useState('');

    // Handlers
    const handleCreate = () => {
        if (newLeagueName.trim()) {
            onAdd(newLeagueName);
            setNewLeagueName('');
            setOpenAdd(false);
        }
    };

    const openEditDialog = (league) => {
        setEditLeague(league);
        setEditLeagueName(league.name);
        setOpenEdit(true);
    };

    const handleUpdate = () => {
        if (editLeague && editLeagueName.trim()) {
            onUpdate({ id: editLeague.id, name: editLeagueName });
            setOpenEdit(false);
        }
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Sei sicuro di voler eliminare la lega "${name}"?\nTutte le squadre e i dati associati verranno persi.`)) {
            onDelete(id);
        }
    };

    return (
        <div>
            {/* SEZIONE AGGIUNTA LEGA */}
            <Paper style={styles.addSection} elevation={0}>
                <Typography style={styles.sectionTitle}>
                    <EmojiEventsIcon style={{ verticalAlign: 'middle', marginRight: '8px', color: '#7f8c8d' }} />
                    Elenco Competizioni
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddCircleIcon />}
                    onClick={() => setOpenAdd(true)}
                    style={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                    Nuova Lega
                </Button>
            </Paper>

            {/* TABELLA LEGHE */}
            <Paper style={styles.container} elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead style={styles.tableHead}>
                            <TableRow>
                                <TableCell style={styles.tableHeadCell} width="50px">ID</TableCell>
                                <TableCell style={styles.tableHeadCell}>Nome Lega</TableCell>
                                <TableCell style={styles.tableHeadCell} align="right">Squadre</TableCell>
                                <TableCell style={styles.tableHeadCell} align="center">Azioni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {leagues.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" style={{ padding: '30px', color: '#bdc3c7' }}>
                                        Non hai ancora creato nessuna lega.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                leagues.map((league) => (
                                    <TableRow key={league.id} hover>
                                        <TableCell style={{ color: '#7f8c8d' }}>#{league.id}</TableCell>
                                        <TableCell>
                                            <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#2f3542' }}>
                                                {league.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Button 
                                                size="small" 
                                                variant="outlined" 
                                                color="secondary"
                                                endIcon={<ArrowForwardIcon />}
                                                onClick={() => navigate(`/leagues/${league.id}`)}
                                                style={styles.enterButton}
                                            >
                                                Gestisci Squadre
                                            </Button>
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton size="small" color="primary" onClick={() => openEditDialog(league)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(league.id, league.name)}>
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

            {/* DIALOG AGGIUNTA */}
            <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="xs">
                <DialogTitle>Crea Nuova Lega</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Nome Lega" fullWidth variant="outlined" value={newLeagueName} onChange={(e) => setNewLeagueName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Annulla</Button>
                    <Button onClick={handleCreate} variant="contained" color="primary">Crea</Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG MODIFICA */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs">
                <DialogTitle>Modifica Lega</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Nome Lega" fullWidth variant="outlined" value={editLeagueName} onChange={(e) => setEditLeagueName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)} color="inherit">Annulla</Button>
                    <Button onClick={handleUpdate} variant="contained" color="primary" startIcon={<SaveIcon />}>Salva</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}