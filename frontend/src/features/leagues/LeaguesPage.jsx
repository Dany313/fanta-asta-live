import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
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
    const [leagues, setLeagues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAdd, setOpenAdd] = React.useState(false);
    const [editingLeague, setEditingLeague] = useState(null); // Stato per la lega in modifica
    const navigate = useNavigate();

    const handleOpenAdd = () => setOpenAdd(true);
    const handleClose = () => {
        setOpenAdd(false);
        setEditingLeague(null);
    };
    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                const leaguesRes = await axios.get('http://localhost:3000/api/leagues', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setLeagues(leaguesRes.data);

            } catch (error) {
                console.error("Errore nel caricamento", error);
                if (error.response && error.response.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handlePostLeague = async (newLeagueName) => {
        if (!newLeagueName || newLeagueName.trim() === '') {
            alert("Inserire un nome valido per la lega");
            return;
        }
        if (window.confirm(`Vuoi davvero creare la lega: ${newLeagueName}?`)) {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                const leaguesRes = await axios.post('http://localhost:3000/api/leagues',
                    { name: newLeagueName },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setLeagues(prevLeagues => [...prevLeagues, leaguesRes.data]);

            } catch (error) {
                console.error("Errore nella creazione", error);
                if (error.response && error.response.status === 401) handleLogout();
            } finally {
                handleClose();
                setLoading(false);
            }
        }
    };

    const handleDeleteLeague = async (leagueId) => {
        if (window.confirm(`Vuoi davvero eliminare la lega e tutti i partecipanti?`)) {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                await axios.delete(`http://localhost:3000/api/leagues/${leagueId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setLeagues(prevLeagues => prevLeagues.filter(league => league.id !== leagueId));

            } catch (error) {
                console.error("Errore", error);
                if (error.response && error.response.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateLeague = async (newLeagueName) => {
        if (!newLeagueName || newLeagueName.trim() === '') {
            alert("Inserire un nome valido per la lega");
            return;
        }
        if (window.confirm(`Vuoi davvero modificare la lega?`)) {
            try {
                setLoading(true);
                if (!editingLeague) return;
                const token = localStorage.getItem('adminToken');
                const res = await axios.put(`http://localhost:3000/api/leagues/${editingLeague.id}`,
                    { name: newLeagueName },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const updatedLeague = res.data || { ...editingLeague, name: newLeagueName };
                setLeagues(prevLeagues => prevLeagues.map(league => league.id === editingLeague.id ? updatedLeague : league));

            } catch (error) {
                console.error("Errore nella modifica", error);
                if (error.response && error.response.status === 401) handleLogout();
            } finally {
                handleClose();
                setLoading(false);
            }
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
                    <AddLeaguePanel onClick={handlePostLeague} />
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
                    <UpdateLeaguePanel oldName={editingLeague?.name} onClick={handleUpdateLeague} />
                </Box>
            </Modal>

            <div>
                {loading ? <p>Caricamento leghe...</p> : leagues.length > 0 ? (
                    <Box component="section" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            {leagues.map(league => (
                                <Grid item key={league.id}>
                                    <LeagueCard id={league.id} name={league.name} onDelete={handleDeleteLeague} onUpdate={() => setEditingLeague(league)} />
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
