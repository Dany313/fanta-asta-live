import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TeamCard from './components/TeamCard';
import AddTeamPanel from './components/AddTeamPanel';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import UpdateTeamPanel from './components/UpdateTeamPanel';
import { useNavigate, useParams } from 'react-router-dom';
import { getTeams, postTeam, putTeam, delTeam } from '../../api/teamsApi'; // Usa il nuovo hook per le leghe
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';



const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};

const TeamsPage = () => {

    const { leagueId } = useParams();

    const queryClient = useQueryClient();

    //Queries
    const { data: teams = [], isLoading: loading } = useQuery({
        queryKey: ['teams', leagueId],
        queryFn: () => getTeams(leagueId)
    });

    // Mutations
    const { mutate: postMutation } = useMutation({
        mutationFn: postTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            handleClose();
        },
        onError: (error) => {
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la creazione");
        }
    });

    const { mutate: putMutation } = useMutation({
        mutationFn: putTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
            handleClose();
        },
        onError: (error) => {
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la modfica");
        }
    });

    const { mutate: deleteMutation } = useMutation({
        mutationFn: delTeam,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['teams'] });
        },
        onError: (error) => {
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la cancellazione");
        }
    });


    const [openAdd, setOpenAdd] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const navigate = useNavigate();

    const handleOpenAdd = () => setOpenAdd(true);
    const handleClose = () => {
        setOpenAdd(false);
        setEditingTeam(null);
    };



    const createTeam = async (newTeamName) => {
        if (!newTeamName || newTeamName.trim() === '') {
            alert("Inserire un nome valido per la squadra");
            return;
        }
        if (window.confirm(`Vuoi davvero creare la squadra: ${newTeamName}?`)) {
            postMutation(newTeamName);
        }
    };

    const deleteTeam = async (teamId) => {
        if (window.confirm(`Vuoi davvero eliminare la squadra e tutti i partecipanti?`)) {
            deleteMutation(teamId);
        }
    };

    const updateTeam = async (newTeamName) => {
        if (!newTeamName || newTeamName.trim() === '') {
            alert("Inserire un nome valido per la squadra");
            return;
        }
        if (window.confirm(`Vuoi davvero modificare la squadra?`)) {
            putMutation({ id: editingTeam.id, teamname: newTeamName });
        }
    };
    return (
        <div>
            <Stack direction="row" justifyContent='space-between' alignItems="center" spacing={1}>
                <Stack direction="row" alignItems="center" spacing={1}>
                    <h2>Gestione Partecipanti</h2>
                    <IconButton color="primary" aria-label="add" onClick={handleOpenAdd}>
                        <AddIcon />
                    </IconButton>
                </Stack>
                <Button variant="outlined" color="secondary" onClick={() => { navigate(`/auction/${leagueId}`); localStorage.removeItem('adminTeamId'); }}>Avvia Asta</Button>
            </Stack>
            <Modal
                open={openAdd}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <AddTeamPanel onClick={createTeam} />
                </Box>
            </Modal>
            {/* Modal per Modificare (fuori dal loop) */}
            <Modal
                open={!!editingTeam}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <UpdateTeamPanel oldName={editingTeam?.name} onClick={updateTeam} />
                </Box>
            </Modal>

            <div>
                {loading ? <p>Caricamento squadre...</p> : teams.length > 0 ? (
                    <Box component="section" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            {teams.map(team => (
                                <Grid item key={team.id}>
                                    <TeamCard id={team.id} name={team.name} onDelete={deleteTeam} onUpdate={() => setEditingTeam(team)} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ) : (
                    <p>Nessuna squadra trovata. Creane una!</p>
                )}
            </div>

        </div>
    );
};

export default TeamsPage;
