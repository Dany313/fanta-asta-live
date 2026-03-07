
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import RosterList from './components/RosterList';
import { useParams } from 'react-router-dom';

const RosterPage = () => {
    const { teamId } = useParams();
    const [roster, setRoster] = useState([]);
    const [allPlayers, setAllPlayers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const headers = { Authorization: `Bearer ${token}` };

            const rosterResponse = await axios.get(`http://localhost:3000/api/rosters`, {
                params: { teamId },
                headers
            });
            setRoster(rosterResponse.data);

            const playersResponse = await axios.get(`http://localhost:3000/api/players`, { headers });
            setAllPlayers(playersResponse.data);

        } catch (error) {
            console.error("Errore nel caricamento", error);
        } finally {
            setLoading(false);
        }
    }, [teamId]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleAddPlayer = async (player) => {
        try {
            // TODO: Prompt for purchase price
            const purchasePrice = prompt(`Inserisci il prezzo di acquisto per ${player.name}:`, 1);
            if (purchasePrice === null || isNaN(purchasePrice)) return; // User cancelled or entered invalid number

            const token = localStorage.getItem('adminToken');
            await axios.post(`http://localhost:3000/api/rosters`, {
                teamId,
                playerId: player.id,
                purchasePrice: parseInt(purchasePrice, 10)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Refetch roster
        } catch (error) {
            console.error("Errore nell'aggiungere il giocatore", error);
        }
    };

    const handleUpdatePlayer = async (playerId) => {
        try {
             // TODO: Prompt for new purchase price
             const purchasePrice = prompt(`Inserisci il nuovo prezzo di acquisto:`, 1);
             if (purchasePrice === null || isNaN(purchasePrice)) return;

            const token = localStorage.getItem('adminToken');
            await axios.put(`http://localhost:3000/api/rosters`, {
                teamId,
                playerId,
                purchasePrice: parseInt(purchasePrice, 10)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchData(); // Refetch roster
        } catch (error) {
            console.error("Errore nell'aggiornare il giocatore", error);
        }
    };

    const handleDeletePlayer = async (playerId) => {
        if (window.confirm('Sei sicuro di voler eliminare questo giocatore?')) {
            try {
                const token = localStorage.getItem('adminToken');
                await axios.delete(`http://localhost:3000/api/rosters`, {
                    data: { teamId, playerId },
                    headers: { Authorization: `Bearer ${token}` }
                });
                fetchData(); // Refetch roster
            } catch (error) {
                console.error("Errore nell'eliminare il giocatore", error);
            }
        }
    };


    return (
        <div>
            <h2>{teamId ? `Squadra ${teamId}` : "Tutte le squadre"}</h2>
            {loading ? <p>Caricamento...</p> : (
                <RosterList
                    players={roster}
                    allPlayers={allPlayers}
                    onAdd={handleAddPlayer}
                    onUpdate={handleUpdatePlayer}
                    onDelete={handleDeletePlayer}
                />
            )}
        </div>
    );
};

export default RosterPage;
