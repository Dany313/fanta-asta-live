import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate, useParams } from 'react-router-dom';
import CustomButton from '../../components/CustomButton';
import PlayerTable from '../../components/PlayerTable';
import PlayerCard from './components/PlayerCard';
import BidPanel from './components/BidPanel'; // 🌟 IMPORTATO
import AuctionLog from './components/AuctionLog'; // 🌟 IMPORTATO

import Button from '@mui/material/Button';
import ButtonGroup from '@mui/material/ButtonGroup';
import Drawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import InvitePanel from './components/InvitePanel'; // 🌟 IMPORTATO
import LeagueManagement from '../admin/LeagueManagement';
import * as api from '../../api';
import RosterList from '../roster/components/RosterList'; // 🌟 IMPORTATO PER GESTIONE ROSE

const socket = io('http://localhost:3000');

export default function AdminAuctionPage() {
    const navigate = useNavigate();
    const { leagueId } = useParams();

    // --- STATO ---
    const [players, setPlayers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState('');
    const [setupComplete, setSetupComplete] = useState(false);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [forceBidTeam, setForceBidTeam] = useState('');
    const [forceBidAmount, setForceBidAmount] = useState('');

    // 🌟 NUOVO STATO DELL'ASTA (Sostituisce activePlayer e sellPrice)
    const [activeAuction, setActiveAuction] = useState(null);

    const handleLogout = () => {
        localStorage.removeItem('adminToken');
        navigate('/login');
    };

    const handleSetupComplete = () => {
        setSetupComplete(true);
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('adminToken');
                const leaguesRes = await api.getLeagues();
                if (leaguesRes.data.length > 0) {
                    const teamsRes = await api.getTeams(leaguesRes.data[0].id);
                    if (teamsRes.data.length > 0) {
                        setSetupComplete(true);
                    }
                }

                const resPlayers = await axios.get('http://localhost:3000/api/players', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setPlayers(resPlayers.data);

                const resTeams = await axios.get('http://localhost:3000/api/teams', {
                    params: { leagueId },
                    headers: { Authorization: `Bearer ${token}` }
                });
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
    }, [leagueId]);

    // --- LOGICA ---
    const handleStartAuction = (player) => {
        socket.emit('start_auction', player);
    };

    // 🌟 NUOVO: Funzione per l'Admin per piazzare una puntata manuale
    const handleAdminBid = (amount) => {
        const adminTeamId = localStorage.getItem('adminTeamId');
        if (!adminTeamId) {
            alert("Seleziona prima una squadra per registrare l'offerta!");
            return;
        }
        const teamName = teams.find(t => t.id === Number(adminTeamId))?.name;
        socket.emit('place_bid', {
            teamId: Number(adminTeamId),
            teamName: teamName,
            amount: amount
        });
    };

    // 🌟 NUOVO: Funzione per forzare un'offerta a nome di un viewer
    const handleForceBid = () => {
        if (!forceBidTeam || !forceBidAmount) return;
        const team = teams.find(t => t.id === Number(forceBidTeam));
        socket.emit('place_bid', {
            teamId: Number(forceBidTeam),
            teamName: team?.name || 'Admin Force',
            amount: Number(forceBidAmount)
        });
        setForceBidAmount('');
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

    // 🌟 NUOVO: Gestione Manuale Rose (Aggiunta diretta)
    const handleManualAdd = async (teamId, player) => {
        const price = prompt(`A quanto acquista ${player.name}?`, "1");
        if (price === null) return;
        
        try {
            // Chiamata API per assegnare (simuliamo un update del player)
            // Nota: Assicurati che il backend supporti questo endpoint o adattalo
            await axios.put(`http://localhost:3000/api/players/${player.id}`, {
                team_id: teamId,
                purchase_price: parseInt(price)
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }});

            // Aggiorniamo lo stato locale
            setPlayers(prev => prev.map(p => p.id === player.id ? { ...p, team_id: teamId, purchase_price: parseInt(price) } : p));
            setTeams(prev => prev.map(t => t.id === teamId ? { ...t, remaining_budget: t.remaining_budget - parseInt(price) } : t));
        } catch (error) {
            alert("Errore nell'aggiunta del giocatore: " + error.message);
        }
    };

    // 🌟 NUOVO: Gestione Manuale Rose (Rimozione)
    const handleManualDelete = async (teamId, playerId) => {
        if(!window.confirm("Vuoi svincolare questo giocatore?")) return;

        try {
            const player = players.find(p => p.id === playerId);
            await axios.put(`http://localhost:3000/api/players/${playerId}`, {
                team_id: null,
                purchase_price: 0
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }});

            setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, team_id: null, purchase_price: 0 } : p));
            setTeams(prev => prev.map(t => t.id === teamId ? { ...t, remaining_budget: t.remaining_budget + (player.purchase_price || 0) } : t));
        } catch (error) {
            alert("Errore nello svincolo: " + error.message);
        }
    };

    // 🌟 NUOVO: Gestione Manuale Rose (Modifica Prezzo)
    const handleManualUpdate = async (teamId, playerId) => {
        const player = players.find(p => p.id === playerId);
        const newPrice = prompt("Nuovo prezzo di acquisto:", player.purchase_price);
        if (newPrice === null) return;

        const diff = parseInt(newPrice) - player.purchase_price;

        try {
            await axios.put(`http://localhost:3000/api/players/${playerId}`, {
                purchase_price: parseInt(newPrice)
            }, { headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }});

            setPlayers(prev => prev.map(p => p.id === playerId ? { ...p, purchase_price: parseInt(newPrice) } : p));
            setTeams(prev => prev.map(t => t.id === teamId ? { ...t, remaining_budget: t.remaining_budget - diff } : t));
        } catch (error) {
            alert("Errore nella modifica: " + error.message);
        }
    };

    // 🌟 HELPER: Calcolo statistiche team
    const getTeamStats = (team) => {
        const teamPlayers = players.filter(p => p.team_id == team.id);
        const countRole = (role) => teamPlayers.filter(p => p.role === role).length;
        
        const pCount = countRole('P');
        const dCount = countRole('D');
        const cCount = countRole('C');
        const aCount = countRole('A');
        const totalPlayers = teamPlayers.length;
        
        // Calcolo Max Bet (Budget - (Slot vuoti - 1))
        // Se mancano 0 giocatori, max bet è il budget. Se ne manca 1, è il budget. Se ne mancano 2, è budget - 1.
        const emptySlots = 25 - totalPlayers;
        const maxBet = emptySlots > 0 ? team.remaining_budget - (emptySlots - 1) : 0;

        return {
            pCount, dCount, cCount, aCount,
            maxBet: maxBet > 0 ? maxBet : 0
        };
    };

    // Filtri (Mantenuti identici)
    const filteredPlayers = players.filter(player => {
        const nameMatch = player.name.toLowerCase().includes(searchTerm.toLowerCase());
        const roleMatch = !roleFilter || player.role.toUpperCase() === roleFilter.toUpperCase();
        return nameMatch && roleMatch;
    });

    if (!setupComplete) {
        return <LeagueManagement onSetupComplete={handleSetupComplete} />;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>👨‍💻 Plancia di Comando Admin</h2>
                <CustomButton variant="danger" onClick={handleLogout}>🚪 Disconnetti</CustomButton>
            </div>


            {/* --- SEZIONE ASTA IN CORSO --- */}
            {activeAuction?.player && (
                <Box sx={{ display: 'flex', gap: 4, marginBottom: '40px', flexDirection: { xs: 'column', md: 'row' } }}>
                    {/* COLONNA SINISTRA: SCHEDA GIOCATORE + OFFERTE */}
                    <Box sx={{ flex: 2 }}>
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

                            {/* Pannello Offerte Standard (Admin come partecipante) */}
                            <BidPanel
                                currentBid={activeAuction.highestBid}
                                onBid={handleAdminBid}
                            />

                            <AuctionLog history={activeAuction.history} />
                        </PlayerCard>
                    </Box>

                    {/* COLONNA DESTRA: PANNELLO DI CONTROLLO ADMIN */}
                    <Box sx={{ flex: 1, backgroundColor: '#f0da1b', p: 3, borderRadius: 2, boxShadow: 3, display: 'flex', flexDirection: 'column', gap: 3 }}>
                        <h3>🛠️ Gestione Admin</h3>
                        
                        <Box sx={{ p: 2, border: '1px dashed #ccc', borderRadius: 2 }}>
                            <h4 style={{ marginTop: 0 }}>Forza Offerta Viewer</h4>
                            <FormControl fullWidth sx={{ mb: 2 }}>
                                <InputLabel id="team-select-label">Seleziona Squadra</InputLabel>
                                <Select
                                    labelId="team-select-label"
                                    value={forceBidTeam}
                                    label="Seleziona Squadra"
                                    onChange={(e) => setForceBidTeam(e.target.value)}
                                >
                                    {teams.map((team) => (
                                        <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <TextField
                                label="Importo Offerta"
                                type="number"
                                fullWidth
                                value={forceBidAmount}
                                onChange={(e) => setForceBidAmount(e.target.value)}
                                sx={{ mb: 2 }}
                            />
                            <Button variant="contained" color="warning" fullWidth onClick={handleForceBid}>
                                Registra Offerta Manuale
                            </Button>
                        </Box>

                        <Box sx={{ mt: 'auto' }}>
                            <CustomButton variant="primary" onClick={handleAssign} style={{ width: '100%', fontSize: '20px', padding: '20px' }}>
                                ⚖️ VENDUTO A {activeAuction.highestBid} FM
                            </CustomButton>
                        </Box>
                    </Box>
                </Box>
            )}

            {/* --- SEZIONE LINK INVITO --- */}

            <div>
                <InvitePanel teams={teams} />
            </div>

            {/* --- BOTTONE APERTURA LISTONE --- */}
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
                <Button variant="contained" size="large" onClick={() => setIsDrawerOpen(true)}>
                    📂 Apri Listone Giocatori
                </Button>
            </div>

            {/* --- SEZIONE GESTIONE SQUADRE & ROSE --- */}
            <Box sx={{ marginTop: '30px' }}>
                <h3 style={{ borderBottom: '2px solid #ddd', paddingBottom: '10px' }}>📊 Gestione Squadre & Rose</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {teams.map(team => {
                        const stats = getTeamStats(team);
                        const teamPlayers = players.filter(p => p.team_id == team.id);
                        // Giocatori liberi per l'aggiunta manuale
                        const freePlayers = players.filter(p => !p.team_id); 

                        return (
                            <Accordion key={team.id} sx={{ backgroundColor: '#f8f9fa' }}>
                                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                                        <Box>
                                            <strong style={{ fontSize: '1.2em' }}>{team.name}</strong>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 3, fontSize: '0.9em', color: '#555' }}>
                                            <span>💰 <strong>{team.remaining_budget}</strong> FM</span>
                                            <span style={{ color: '#d35400' }}>🔥 Max: <strong>{stats.maxBet}</strong></span>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 1 }}>
                                            <span title="Portieri" style={{ backgroundColor: '#f1c40f', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em' }}>P: {stats.pCount}/3</span>
                                            <span title="Difensori" style={{ backgroundColor: '#2ecc71', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em' }}>D: {stats.dCount}/8</span>
                                            <span title="Centrocampisti" style={{ backgroundColor: '#3498db', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em' }}>C: {stats.cCount}/8</span>
                                            <span title="Attaccanti" style={{ backgroundColor: '#e74c3c', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8em', color: 'white' }}>A: {stats.aCount}/6</span>
                                        </Box>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails sx={{ backgroundColor: 'white' }}>
                                    {/* Utilizziamo RosterList per gestire la rosa di questo team */}
                                    <RosterList 
                                        players={teamPlayers}
                                        allPlayers={freePlayers} // Passiamo solo quelli liberi per l'aggiunta
                                        onAdd={(player) => handleManualAdd(team.id, player)}
                                        onUpdate={(playerId) => handleManualUpdate(team.id, playerId)}
                                        onDelete={(playerId) => handleManualDelete(team.id, playerId)}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
                </div>
            </Box>

            {/* --- DRAWER LISTONE --- */}
            <Drawer anchor="right" open={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
                <Box sx={{ width: 600, p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
                        <h3>Listone Giocatori ({filteredPlayers.length} disponibili)</h3>

                        <input
                            type="text"
                            placeholder="🔍 Cerca giocatore..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ padding: '10px', width: '100%', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box' }}
                        />

                        <ButtonGroup aria-label="Basic button group" fullWidth>
                            <Button onClick={() => setRoleFilter('')} variant={!roleFilter ? 'contained' : 'outlined'}>Tutti</Button>
                            <Button onClick={() => setRoleFilter('P')} variant={roleFilter === 'P' ? 'contained' : 'outlined'}>P</Button>
                            <Button onClick={() => setRoleFilter('D')} variant={roleFilter === 'D' ? 'contained' : 'outlined'}>D</Button>
                            <Button onClick={() => setRoleFilter('C')} variant={roleFilter === 'C' ? 'contained' : 'outlined'}>C</Button>
                            <Button onClick={() => setRoleFilter('A')} variant={roleFilter === 'A' ? 'contained' : 'outlined'}>A</Button>
                        </ButtonGroup>
                    </div>

                    {loading ? (
                        <p>Caricamento in corso...</p>
                    ) : (
                        <div style={{ flexGrow: 1, overflowY: 'auto' }}>
                            <PlayerTable
                                players={filteredPlayers.slice(0, 100)}
                                onPlayerClick={(player) => {
                                    handleStartAuction(player);
                                    setIsDrawerOpen(false);
                                }}
                                buttonText="Metti all'asta"
                                buttonVariant="success"
                            />
                        </div>
                    )}
                </Box>
            </Drawer>
        </div>
    );
}