import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Typography, Box, IconButton, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Stack, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import GroupsIcon from '@mui/icons-material/Groups';
import SaveIcon from '@mui/icons-material/Save';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';

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
    avatarPlaceholder: {
        width: '32px',
        height: '32px',
        backgroundColor: '#3498db',
        color: 'white',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '14px',
        fontWeight: 'bold'
    }
};

export default function TeamsList({ teams, onAdd, onUpdate, onDelete }) {
    const navigate = useNavigate();
    // State per Dialog Aggiungi
    const [openAdd, setOpenAdd] = useState(false);
    const [newTeamName, setNewTeamName] = useState('');

    // State per Dialog Modifica
    const [openEdit, setOpenEdit] = useState(false);
    const [editTeam, setEditTeam] = useState(null);
    const [editTeamName, setEditTeamName] = useState('');

    // Handlers
    const handleCreate = () => {
        if (newTeamName.trim()) {
            onAdd(newTeamName);
            setNewTeamName('');
            setOpenAdd(false);
        }
    };

    const openEditDialog = (team) => {
        setEditTeam(team);
        setEditTeamName(team.name);
        setOpenEdit(true);
    };

    const handleUpdate = () => {
        if (editTeam && editTeamName.trim()) {
            onUpdate({ id: editTeam.id, name: editTeamName });
            setOpenEdit(false);
        }
    };

    const handleDelete = (id, name) => {
        if (window.confirm(`Eliminare la squadra "${name}" e tutti i suoi dati?`)) {
            onDelete(id);
        }
    };

    return (
        <div>
            {/* SEZIONE AGGIUNTA SQUADRA */}
            <Paper style={styles.addSection} elevation={0}>
                <Typography style={styles.sectionTitle}>
                    <GroupsIcon style={{ verticalAlign: 'middle', marginRight: '8px', color: '#7f8c8d' }} />
                    Elenco Squadre ({teams.length})
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary" 
                    startIcon={<AddCircleIcon />}
                    onClick={() => setOpenAdd(true)}
                    style={{ textTransform: 'none', fontWeight: 'bold' }}
                >
                    Nuova Squadra
                </Button>
            </Paper>

            {/* TABELLA SQUADRE */}
            <Paper style={styles.container} elevation={0}>
                <TableContainer>
                    <Table>
                        <TableHead style={styles.tableHead}>
                            <TableRow>
                                <TableCell style={styles.tableHeadCell}>Nome Squadra</TableCell>
                                <TableCell style={styles.tableHeadCell} align="right">Budget Residuo</TableCell>
                                <TableCell style={styles.tableHeadCell} align="center">Azioni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {teams.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" style={{ padding: '30px', color: '#bdc3c7' }}>
                                        Nessuna squadra presente in questa lega.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                teams.map((team) => (
                                    <TableRow key={team.id} hover>
                                        <TableCell>
                                            <Typography variant="subtitle1" style={{ fontWeight: 'bold', color: '#2f3542' }}>
                                                {team.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Chip 
                                                label={`${team.remainingBudget || 0} FM`} 
                                                color="success" 
                                                variant="outlined" 
                                                size="small" 
                                                style={{ fontWeight: 'bold' }}
                                            />
                                        </TableCell>
                                        <TableCell align="center">
                                            <Stack direction="row" spacing={1} justifyContent="center">
                                                <IconButton 
                                                    size="small" 
                                                    color="info" 
                                                    onClick={() => navigate(`/roster/${team.id}`)}
                                                    title="Gestisci Rosa"
                                                >
                                                    <AssignmentIndIcon />
                                                </IconButton>
                                                <IconButton size="small" color="primary" onClick={() => openEditDialog(team)}>
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton size="small" color="error" onClick={() => handleDelete(team.id, team.name)}>
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
                <DialogTitle>Nuova Squadra</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Nome Squadra" fullWidth variant="outlined" value={newTeamName} onChange={(e) => setNewTeamName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAdd(false)} color="inherit">Annulla</Button>
                    <Button onClick={handleCreate} variant="contained" color="primary">Crea</Button>
                </DialogActions>
            </Dialog>

            {/* DIALOG MODIFICA */}
            <Dialog open={openEdit} onClose={() => setOpenEdit(false)} fullWidth maxWidth="xs">
                <DialogTitle>Modifica Squadra</DialogTitle>
                <DialogContent>
                    <TextField autoFocus margin="dense" label="Nome Squadra" fullWidth variant="outlined" value={editTeamName} onChange={(e) => setEditTeamName(e.target.value)} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenEdit(false)} color="inherit">Annulla</Button>
                    <Button onClick={handleUpdate} variant="contained" color="primary" startIcon={<SaveIcon />}>Salva</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}