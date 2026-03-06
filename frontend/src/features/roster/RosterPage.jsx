
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import RosterList from './components/RosterList';
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

const RosterPage = () => {
    const { teamId } = useParams();
    const [roster, setRoster] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('adminToken');
                const rosterResponse = await axios.get(`http://localhost:3000/api/rosters`, {
                    params: { teamId },
                    headers: { Authorization: `Bearer ${token}` }
                });
                setRoster(rosterResponse.data);

            } catch (error) {
                console.error("Errore nel caricamento", error);
                if (error.response && error.response.status === 401);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [teamId]);


    return (
        <div>
            <h2>{teamId ? "Squadra" : "Tutte le squadre"}</h2>
            <RosterList players={roster} />
            <div></div>
        </div>
    );
};

export default RosterPage;
