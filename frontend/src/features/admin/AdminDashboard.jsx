import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import PlayerTable from '../../components/PlayerTable';
import PlayerCard from '../../components/PlayerCard';
import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';

// 1. Creiamo la connessione WebSocket al nostro backend.
// La mettiamo fuori dal componente così non viene ricreata a ogni aggiornamento della pagina.
const socket = io('http://localhost:3000');

export default function AdminDashboard() {
    const navigate = useNavigate();

    // --- STATO (Le variabili del componente) ---
    const [players, setPlayers] = useState([]); // Il listone
    const [loading, setLoading] = useState(true); // Flag di caricamento
    const [activePlayer, setActivePlayer] = useState(null); // Il giocatore attualmente all'asta
    const [teams, setTeams] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState('');
    const [sellPrice, setSellPrice] = useState(1);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState('');

    const handleLogout = () => {
        // Strappiamo il braccialetto VIP!
        localStorage.removeItem('adminToken');
        // Lo mandiamo via
        navigate('/login');
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Recuperiamo il braccialetto VIP dal localStorage
                const token = localStorage.getItem('adminToken');

                // 2. Lo mettiamo nell'header della chiamata per i giocatori
                const resPlayers = await axios.get('http://localhost:3000/api/players', {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setPlayers(resPlayers.data);

                // La chiamata per i team per ora la lasciamo "libera" (non l'abbiamo protetta)
                const resTeams = await axios.get('http://localhost:3000/api/teams');
                setTeams(resTeams.data);

                setLoading(false);
            } catch (error) {
                console.error("Errore nel caricamento dati. Forse il token è scaduto?", error);
                // Se c'è un errore di autorizzazione, potremmo forzare il logout
                if (error.response && error.response.status === 401) {
                    handleLogout();
                }
            }
        };

        fetchData();

        // Ascoltiamo se l'assegnazione è andata a buon fine
        socket.on('player_assigned', (response) => {
            if (response.success) {
                // alert("✅ Assegnazione completata!"); // Puoi anche togliere l'alert se diventa noioso!

                setActivePlayer(null); // Togliamo il giocatore dall'asta attiva
                setSellPrice(1); // Resettiamo il prezzo

                // 🌟 1. RIMUOVIAMO IL GIOCATORE DAL LISTONE
                // Diciamo a React: "Prendi i giocatori attuali e tieni solo quelli che NON hanno l'ID appena venduto"
                setPlayers((prevPlayers) =>
                    prevPlayers.filter(player => player.id !== response.data.playerId)
                );

                // 🌟 2. AGGIORNIAMO IL BUDGET DELLA SQUADRA
                // Diciamo a React: "Trova la squadra che ha comprato e scalagli i crediti"
                setTeams((prevTeams) =>
                    prevTeams.map(team =>
                        // Attenzione a convertire teamId in numero se arriva come stringa dal select!
                        team.id === Number(response.data.teamId)
                            ? { ...team, remaining_budget: team.remaining_budget - response.data.price }
                            : team
                    )
                );

            } else {
                alert("❌ Errore: " + response.message);
            }
        });

        return () => socket.off('player_assigned');
    }, []);

    // --- LOGICA (I metodi del componente) ---
    const handleStartAuction = (player) => {
        // 1. Salviamo il giocatore nello stato locale per mostrarlo in alto
        setActivePlayer(player);

        // 2. Usiamo Socket.io per "gridare" al server che l'asta è iniziata
        socket.emit('start_auction', player);

        // Un piccolo feedback visivo per l'admin (puoi anche toglierlo in futuro)
        console.log(`Segnale inviato al server: Asta per ${player.name}`);
    };

    const handleAssign = () => {
        if (!selectedTeam) return alert("Seleziona una squadra!");
        if (sellPrice < 1) return alert("Il prezzo deve essere almeno 1!");

        socket.emit('assign_player', {
            playerId: activePlayer.id,
            teamId: selectedTeam,
            price: sellPrice,
            playerName: activePlayer.name,
            playerRole: activePlayer.role // 🌟 NUOVO: Passiamo anche il ruolo!
        });
    };

    // React ricalcolerà questa lista in automatico ogni volta che l'utente digita una lettera!
    const filteredPlayers = players.filter(player => {
        const nameMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = !roleFilter || player.role.toUpperCase() === roleFilter.toUpperCase();
        return nameMatch && roleMatch;
    });

    // --- TEMPLATE (L'equivalente dell'HTML) ---
    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👨‍💻 Plancia di Comando Admin</h2>
                <CustomButton variant="danger" onClick={handleLogout}>🚪 Disconnetti</CustomButton>
            </div>

            {/* SEZIONE 1: Il giocatore attualmente all'asta */}
            {/* (Viene mostrato solo se activePlayer non è null) */}
            {/* --- SEZIONE ASTA IN CORSO --- */}
            {activePlayer && (
                <div style={{ marginBottom: '40px' }}>
                    <PlayerCard
                        player={activePlayer}
                        bgColor="#f1c40f" // Giallo Admin
                        textColor="#2f3542"
                    >
                        {/* Questi elementi diventano i "children" di PlayerCard */}
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
                            <select
                                value={selectedTeam}
                                onChange={(e) => setSelectedTeam(e.target.value)}
                                style={{ padding: '10px', fontSize: '16px', borderRadius: '5px' }}
                            >
                                <option value="">-- Seleziona Squadra --</option>
                                {teams.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.remaining_budget} cr)</option>
                                ))}
                            </select>

                            <input
                                type="number"
                                value={sellPrice}
                                onChange={(e) => setSellPrice(Number(e.target.value))}
                                style={{ padding: '10px', fontSize: '16px', width: '100px', borderRadius: '5px' }}
                                min="1"
                            />

                            <CustomButton variant="primary" onClick={handleAssign}>
                                ✅ Conferma
                            </CustomButton>
                        </div>
                    </PlayerCard>
                </div>
            )}

            {/* SEZIONE: Link di Invito per i Viewer */}
            <div style={{
                backgroundColor: '#fff', padding: '15px', borderRadius: '8px',
                border: '1px solid #ddd', marginBottom: '30px'
            }}>
                <h3 style={{ margin: '0 0 15px 0' }}>🔗 Invia i link ai partecipanti</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                    {teams.map(team => (
                        <div key={team.id} style={{
                            backgroundColor: '#f1f2f6', padding: '10px', borderRadius: '5px',
                            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px'
                        }}>
                            <div key={team.id} style={{
                                backgroundColor: '#f1f2f6', padding: '10px', borderRadius: '5px',
                                display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px'
                            }}>
                                <strong>{team.name}</strong>
                                <button
                                    onClick={() => {
                                        const link = `http://localhost:5173/join/${team.invite_token}`;
                                        navigator.clipboard.writeText(link);
                                        alert(`Copiato!`);
                                    }}
                                    style={{ backgroundColor: '#7bed9f', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                                >
                                    Copia Link
                                </button>

                                {/* 🌟 NUOVO BOTTONE KICK */}
                                <button
                                    onClick={() => {
                                        if (window.confirm(`Vuoi davvero disconnettere ${team.name}?`)) {
                                            socket.emit('kick_team', team.id);
                                        }
                                    }}
                                    style={{ backgroundColor: '#ff4757', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
                                >
                                    Scollega
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* SEZIONE 2: La lista dei giocatori da mettere all'asta */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <h3>Listone Giocatori ({filteredPlayers.length} disponibili)</h3>

                {/* FILTRO PER RUOLO */}
                <ButtonGroup aria-label="Basic button group">
                    <Button onClick={() => setRoleFilter('')} variant={!roleFilter ? 'contained' : 'outlined'}>Tutti</Button>
                    <Button onClick={() => setRoleFilter('P')} variant={roleFilter === 'P' ? 'contained' : 'outlined'}>P</Button>
                    <Button onClick={() => setRoleFilter('D')} variant={roleFilter === 'D' ? 'contained' : 'outlined'}>D</Button>
                    <Button onClick={() => setRoleFilter('C')} variant={roleFilter === 'C' ? 'contained' : 'outlined'}>C</Button>
                    <Button onClick={() => setRoleFilter('A')} variant={roleFilter === 'A' ? 'contained' : 'outlined'}>A</Button>
                </ButtonGroup>

                {/* LA NOSTRA BARRA DI RICERCA */}
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
                    players={filteredPlayers}
                    onPlayerClick={handleStartAuction}
                    buttonText="Metti all'asta"
                    buttonVariant="success"
                />
            )}
        </div>
    );
}