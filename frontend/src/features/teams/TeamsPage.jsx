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
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openAdd, setOpenAdd] = useState(false);
    const [editingTeam, setEditingTeam] = useState(null);
    const navigate = useNavigate();

    const handleOpenAdd = () => setOpenAdd(true);
    const handleClose = () => {
        setOpenAdd(false);
        setEditingTeam(null);
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
                // Passiamo leagueId come parametro di query
                const teamsRes = await axios.get('http://localhost:3000/api/teams', {
                    params: { leagueId },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTeams(teamsRes.data);

            } catch (error) {
                console.error("Errore nel caricamento", error);
                if (error.response && error.response.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [leagueId]);

    const handlePostTeam = async (newTeamName) => {
        if (!newTeamName || newTeamName.trim() === '') {
            alert("Inserire un nome valido per la squadra");
            return;
        }
        if (window.confirm(`Vuoi davvero creare la squadra: ${newTeamName}?`)) {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                const teamsRes = await axios.post('http://localhost:3000/api/teams',
                    { name: newTeamName, leagueId: leagueId },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTeams(prevTeams => [...prevTeams, teamsRes.data]);

            } catch (error) {
                console.error("Errore nella creazione", error);
                if (error.response && error.response.status === 401) handleLogout();
            } finally {
                handleClose();
                setLoading(false);
            }
        }
    };

    const handleDeleteTeam = async (teamId) => {
        if (window.confirm(`Vuoi davvero eliminare la squadra e tutti i partecipanti?`)) {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                await axios.delete(`http://localhost:3000/api/teams/${teamId}`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setTeams(prevTeams => prevTeams.filter(team => team.id !== teamId));

            } catch (error) {
                console.error("Errore", error);
                if (error.response && error.response.status === 401) handleLogout();
            } finally {
                setLoading(false);
            }
        }
    };

    const handleUpdateTeam = async (newTeamName) => {
        if (!newTeamName || newTeamName.trim() === '') {
            alert("Inserire un nome valido per la squadra");
            return;
        }
        if (window.confirm(`Vuoi davvero modificare la squadra?`)) {
            try {
                setLoading(true);
                if (!editingTeam) return;
                const token = localStorage.getItem('adminToken');
                const res = await axios.put(`http://localhost:3000/api/teams/${editingTeam.id}`,
                    { name: newTeamName },
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                const updatedTeam = res.data || { ...editingTeam, name: newTeamName };
                setTeams(prevTeams => prevTeams.map(team => team.id === editingTeam.id ? updatedTeam : team));

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
                <h2>Gestione Partecipanti</h2>
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
                    <AddTeamPanel onClick={handlePostTeam} />
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
                    <UpdateTeamPanel oldName={editingTeam?.name} onClick={handleUpdateTeam} />
                </Box>
            </Modal>

            <div>
                {loading ? <p>Caricamento squadre...</p> : teams.length > 0 ? (
                    <Box component="section" sx={{ p: 2 }}>
                        <Grid container spacing={2}>
                            {teams.map(team => (
                                <Grid item key={team.id}>
                                    <TeamCard id={team.id} name={team.name} onDelete={handleDeleteTeam} onUpdate={() => setEditingTeam(team)} />
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
