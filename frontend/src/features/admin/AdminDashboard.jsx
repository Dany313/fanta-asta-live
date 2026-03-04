import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import PlayerTable from '../../components/PlayerTable';
import PlayerCard from '../../components/PlayerCard';
import BidPanel from '../../components/bidPanel'; // 🌟 IMPORTATO
import AuctionLog from '../../components/AuctionLog'; // 🌟 IMPORTATO

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import InvitePanel from '../../components/InvitePanel'; // 🌟 IMPORTATO

const socket = io('http://localhost:3000');

export default function AdminDashboard() {
    const navigate = useNavigate();

    // --- STATO ---
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState('');

    // 🌟 NUOVO STATO DELL'ASTA (Sostituisce activePlayer e sellPrice)
    const [activeAuction, setActiveAuction] = useState(null);
    const [adminSelectedTeam, setAdminSelectedTeam] = useState('');

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const resPlayers = await axios.get('http://localhost:3000/api/players', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPlayers(resPlayers.data);

                const resTeams = await axios.get('http://localhost:3000/api/teams');
                setTeams(resTeams.data);

                setLoading(false);
            } catch (error) {
                console.error("Errore nel caricamento", error);
                if (error.response && error.response.status === 401) handleLogout();
            }
        };

        fetchData();

        // --- ASCOLTATORI SOCKET ---

        // 1. L'asta parte
        socket.on('auction_started', (data) => {
            setActiveAuction(data);
            setAdminSelectedTeam(''); // Reset tendina
        });

        // 2. Qualcuno fa un'offerta
        socket.on('auction_update', (update) => {
            setActiveAuction(prev => ({
                ...prev,
                highestBid: update.highestBid,
                highestBidderName: update.highestBidderName,
                history: update.history
            }));
        });

        // 3. Assegnazione completata
        socket.on('player_assigned', (response) => {
            if (response.success) {
                setActiveAuction(null); // Chiudiamo il box dell'asta

                // Manteniamo la tua ottima logica di aggiornamento stato locale
                setPlayers((prev) => prev.filter(p => p.id !== response.data.playerId));
                setTeams((prev) => prev.map(t =>
                    t.id === Number(response.data.teamId)
                        ? { ...t, remaining_budget: t.remaining_budget - response.data.price }
                        : t
                ));
            } else {
                alert("❌ Errore: " + response.message);
            }
        });

        // 4. Gestione Errori
        socket.on('bid_error', (error) => alert(`⚠️ ${error.message}`));
        socket.on('assign_error', (error) => alert(`❌ ${error.message}`));

        // 5. Richiediamo lo stato attuale dell'asta (Sync)
        socket.emit('sync_auction');

        return () => {
            socket.off('auction_started');
            socket.off('auction_update');
            socket.off('player_assigned');
            socket.off('bid_error');
            socket.off('assign_error');
        };
    }, []);

    // --- LOGICA ---
    const handleStartAuction = (player) => {
        socket.emit('start_auction', player);
    };

    // 🌟 NUOVO: Funzione per l'Admin per piazzare una puntata manuale
    const handleAdminBid = (amount) => {
        if (!adminSelectedTeam) {
            alert("Seleziona prima una squadra per registrare l'offerta!");
            return;
        }
        const teamName = teams.find(t => t.id === Number(adminSelectedTeam))?.name;
        socket.emit('place_bid', {
            teamId: Number(adminSelectedTeam),
            teamName: teamName,
            amount: amount
        });
    };

    // 🌟 AGGIORNATO: L'assegnazione ora non ha bisogno di inviare dati
    const handleAssign = () => {
        // if (!activeAuction || !activeAuction.highestBidderId) {
        //     alert("Nessuna offerta ricevuta! L'asta non può essere conclusa.");
        //     return;
        // }
        if (window.confirm(`Vuoi davvero vendere ${activeAuction.player.name} a ${activeAuction.highestBidderName} per ${activeAuction.highestBid} crediti?`)) {
            socket.emit('assign_player');
        }
    };

    // Filtri (Mantenuti identici)
    const filteredPlayers = players.filter(player => {
        const nameMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = !roleFilter || player.role.toUpperCase() === roleFilter.toUpperCase();
        return nameMatch && roleMatch;
    });

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👨‍💻 Plancia di Comando Admin</h2>
                <CustomButton variant="danger" onClick={handleLogout}>🚪 Disconnetti</CustomButton>
            </div>


            {/* --- SEZIONE ASTA IN CORSO --- */}
            {activeAuction?.player && (
                <div style={{ marginBottom: '40px' }}>
                    <PlayerCard
                        player={{ ...activeAuction.player, current_price: activeAuction.highestBid }}
                        bgColor="#f1c40f"
                        textColor="#2f3542"
                        title="🔨 ASTA IN CORSO"
                    >
                        {/* Box Miglior Offerta */}
                        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: 0, color: '#e67e22' }}>👑 Offerta Attuale: {activeAuction.highestBid} crediti</h3>
                            <p style={{ margin: '5px 0 0 0', fontSize: '18px', fontWeight: 'bold' }}>
                                {activeAuction.highestBidderName ? `di ${activeAuction.highestBidderName}` : 'Nessuna offerta...'}
                            </p>
                        </div>

                        {/* Pannello Offerte Admin */}
                        <div style={{ border: '2px dashed rgba(0,0,0,0.2)', padding: '15px', borderRadius: '10px', marginBottom: '20px' }}>
                            <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Registra offerta manuale:</p>
                            <select
                                value={adminSelectedTeam}
                                onChange={(e) => setAdminSelectedTeam(e.target.value)}
                                style={{ padding: '10px', fontSize: '16px', borderRadius: '5px', width: '100%', marginBottom: '10px' }}
                            >
                                <option value="">-- Seleziona la Squadra --</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.remaining_budget} FM)</option>
                                ))}
                            </select>

                            <BidPanel
                                currentBid={activeAuction.highestBid}
                                onBid={handleAdminBid}
                                disabled={!adminSelectedTeam}
                            />
                        </div>

                        <CustomButton variant="primary" onClick={handleAssign} style={{ width: '100%', fontSize: '20px', padding: '15px', marginTop: '10px' }}>
                            🎉 VENDUTO A {activeAuction.highestBid} FM!
                        </CustomButton>

                        <AuctionLog history={activeAuction.history} />
                    </PlayerCard>
                </div>
            )}

            {/* --- SEZIONE LINK INVITO --- */}

            <div>
                <InvitePanel teams={teams} />
            </div>

            {/* --- SEZIONE LISTONE --- */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3>Listone Giocatori ({filteredPlayers.length} disponibili)</h3>

                <ButtonGroup aria-label="Basic button group">
                    <Button onClick={() => setRoleFilter('')} variant={!roleFilter ? 'contained' : 'outlined'}>Tutti</Button>
                    <Button onClick={() => setRoleFilter('P')} variant={roleFilter === 'P' ? 'contained' : 'outlined'}>P</Button>
                    <Button onClick={() => setRoleFilter('D')} variant={roleFilter === 'D' ? 'contained' : 'outlined'}>D</Button>
                    <Button onClick={() => setRoleFilter('C')} variant={roleFilter === 'C' ? 'contained' : 'outlined'}>C</Button>
                    <Button onClick={() => setRoleFilter('A')} variant={roleFilter === 'A' ? 'contained' : 'outlined'}>A</Button>
                </ButtonGroup>

                <input
                    type="text"
                    placeholder="🔍 Cerca giocatore..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ padding: '10px', width: '300px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>

            {loading ? (
                <p>Caricamento in corso...</p>
            ) : (
                <PlayerTable
                    players={filteredPlayers.slice(0, 100)} // Ho messo un limite a 100 per sicurezza di performance, ma puoi toglierlo
                    onPlayerClick={handleStartAuction}
                    buttonText="Metti all'asta"
                    buttonVariant="success"
                />
            )}
        </div>
    );
}