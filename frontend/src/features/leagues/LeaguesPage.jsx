import Button from '@mui/material/Button';
import React, { useState, useEffect, use } from 'react';
import axios from 'axios';
import LeagueCard from './components/LeagueCard';
import AddLeaguePanel from './components/AddLeaguePanel';
import Modal from '@mui/material/Modal';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import UpdateLeaguePanel from './components/UpdateLeaguePanel';
import { useNavigate } from 'react-router-dom';
import { getLeagues, postLeague, putLeague, delLeague } from '../../api/leaguesApi'; // Usa il nuovo hook per le leghe
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

const LeaguesPage = () => {
    const queryClient = useQueryClient();

    //Queries
    const { data: leagues = [], isLoading: loading } = useQuery({
        queryKey: ['leagues'],
        queryFn: getLeagues
    });

    // Mutations
    const { mutate: postMutation } = useMutation({
        mutationFn: postLeague,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
            handleClose();
        },
        onError: (error) => {
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la creazione");
        }
    });

    const { mutate: putMutation } = useMutation({
        mutationFn: putLeague,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
            handleClose();
        },
        onError: (error) => {
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la modfica");
        }
    });

    const { mutate: deleteMutation } = useMutation({
        mutationFn: delLeague,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['leagues'] });
        },
        onError: (error) => {
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la cancellazione");
        }
    });


    const [openAdd, setOpenAdd] = React.useState(false);
    const [editingLeague, setEditingLeague] = useState(null); // Stato per la lega in modifica

    const handleOpenAdd = () => setOpenAdd(true);
    const handleClose = () => {
        setOpenAdd(false);
        setEditingLeague(null);
    };

    const addLeague = (newLeagueName) => {
        if (!newLeagueName || newLeagueName.trim() === '') {
            alert("Inserire un nome valido per la lega");
            return;
        }
        if (window.confirm(`Vuoi davvero creare la lega: ${newLeagueName}?`)) {
            postMutation(newLeagueName);
        }
    };

    const deleteLeague = (leagueId) => {
        if (window.confirm(`Vuoi davvero eliminare la lega e tutti i partecipanti?`)) {
            deleteMutation(leagueId);
        }
    };

    const updateLeague = (newLeagueName) => {
        if (!newLeagueName || newLeagueName.trim() === '') {
            alert("Inserire un nome valido per la lega");
            return;
        }
        if (window.confirm(`Vuoi davvero modificare la lega?`)) {
            if (!editingLeague) return;
            putMutation({ id: editingLeague.id, leaguename: newLeagueName });
        }
    };
    return (
        <div>
            <Stack direction="row" alignItems="center" spacing={1}>
                <h2>Gestione Leghe</h2>
                <IconButton color="primary" aria-label="add" onClick={handleOpenAdd}>
                    <AddIcon />
                </IconButton>
            </Stack>
            <Modal
                open={openAdd}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <AddLeaguePanel onClick={addLeague} />
                </Box>
            </Modal>
            {/* Modal per Modificare (fuori dal loop) */}
            <Modal
                open={!!editingLeague}
                onClose={handleClose}
                aria-labelledby="modal-title"
                aria-describedby="modal-description"
            >
                <Box sx={style}>
                    <UpdateLeaguePanel oldName={editingLeague?.name} onClick={updateLeague} />
                </Box>
            </Modal>

            <div>
                {loading ? <p>Caricamento leghe...</p> : leagues.length > 0 ? (
                    <Box component="section" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            {leagues.map(league => (
                                <Grid item key={league.id}>
                                    <LeagueCard id={league.id} name={league.name} onDelete={deleteLeague} onUpdate={() => setEditingLeague(league)} />
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ) : (
                    <p>Nessuna lega trovata. Creane una!</p>
                )}
            </div>

        </div>
    );
};

export default LeaguesPage;
