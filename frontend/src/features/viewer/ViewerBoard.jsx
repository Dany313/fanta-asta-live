import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom'; // Aggiungi questo in cima
import PlayerCard from '../../components/PlayerCard';

const socket = io('http://localhost:3000');

export default function ViewerBoard() {
    const navigate = useNavigate(); // Inizializza la navigazione
    const myTeamId = localStorage.getItem('viewerTeamId'); // Chi sono io?
    // --- STATO ---
    const [currentAuction, setCurrentAuction] = useState(null);
    const [lastPurchase, setLastPurchase] = useState(null);

    const [teams, setTeams] = useState([]);
    const [rosters, setRosters] = useState([]); // 🌟 NUOVO STATO

    // --- EFFETTI ---
    useEffect(() => {
        const fetchData = async () => {
            try {
                const resTeams = await axios.get('http://localhost:3000/api/teams');
                setTeams(resTeams.data);

                // 🌟 SCARICHIAMO LE ROSE
                const resRosters = await axios.get('http://localhost:3000/api/rosters');
                setRosters(resRosters.data);
            } catch (error) {
                console.error("Errore nel caricamento dati:", error);
            }
        };
        fetchData();

        socket.on('auction_started', (playerData) => {
            setCurrentAuction(playerData);
            setLastPurchase(null);
        });



        socket.on('player_assigned', (response) => {
            if (response.success) {
                setLastPurchase(response.data);
                setCurrentAuction(null);

                setTeams((prevTeams) =>
                    prevTeams.map(team =>
                        team.id === Number(response.data.teamId)
                            ? { ...team, remaining_budget: team.remaining_budget - response.data.price }
                            : team
                    )
                );

                // 🌟 AGGIUNGIAMO IL NUOVO GIOCATORE ALLA ROSA LOCALE IN TEMPO REALE
                setRosters((prevRosters) => [
                    ...prevRosters,
                    {
                        team_id: Number(response.data.teamId),
                        player_id: response.data.playerId,
                        name: response.data.playerName,
                        role: response.data.playerRole, // Ecco perché ci serviva!
                        purchase_price: response.data.price
                    }
                ]);
            }
        });

        // 🌟 ASCOLTIAMO L'ORDINE DI ESPULSIONE
        socket.on('force_logout', (payload) => {
            // Se l'ID espulso è il mio... addio!
            if (Number(payload.teamId) === Number(myTeamId)) {
                alert("⚠️ Sei stato disconnesso dall'Amministratore.");
                localStorage.removeItem('viewerToken');
                localStorage.removeItem('viewerTeamId');
                localStorage.removeItem('viewerTeamName');
                navigate('/'); // Torniamo alla home
            }
        });

        return () => {
            socket.off('auction_started');
            socket.off('player_assigned');
            socket.off('force_logout');
        };
    }, [myTeamId, navigate]);

    // 🌟 FUNZIONE CHE CONTA I GIOCATORI PER RUOLO
    const getRoleCount = (teamId, role) => {
        return rosters.filter(r => r.team_id === teamId && r.role === role).length;
    };

    // --- TEMPLATE CON LAYOUT A DUE COLONNE ---
    return (
        <div style={{ display: 'flex', height: '100vh', fontFamily: 'Arial', backgroundColor: '#f1f2f6' }}>

            {/* ==========================================
          COLONNA SINISTRA: L'Asta (75% dello spazio) 
          ========================================== */}
            <div style={{ flex: '3', padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h2 style={{ marginBottom: '40px', color: '#2f3542' }}>📺 Tabellone Live Asta</h2>

                {!currentAuction && !lastPurchase && (
                    <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '10px', color: '#747d8c', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3>In attesa che l'Admin faccia partire un'asta...</h3>
                    </div>
                )}

                {!currentAuction && !lastPurchase && (
                    <div style={{ padding: '40px', backgroundColor: '#ffffff', borderRadius: '10px', color: '#747d8c', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                        <h3>In attesa che l'Admin faccia partire un'asta...</h3>
                    </div>
                )}

                {/* Giocatore attualmente all'asta */}
                {currentAuction && (
                    <PlayerCard player={currentAuction} />
                )}

                {/* Ultimo giocatore venduto */}
                {lastPurchase && !currentAuction && (
                    <PlayerCard
                        player={{
                            name: lastPurchase.playerName,
                            role: lastPurchase.playerRole || '?',
                            club: 'Venduto', // Sovrascriviamo il club per mostrare che è andato
                            purchase_price: lastPurchase.price // Usiamo purchase_price invece di current_price
                        }}
                        title="🎉 VENDUTO!"
                        bgColor="#ffb142" // Arancione
                        textColor="#2c2c54"
                    >
                        <p style={{ fontSize: '20px', margin: '0' }}>Acquistato da:</p>
                        <p style={{ fontSize: '28px', fontWeight: 'bold', margin: '10px 0' }}>
                            {teams.find(t => t.id === Number(lastPurchase.teamId))?.name || "Squadra Sconosciuta"}
                        </p>
                    </PlayerCard>
                )}
            </div>

            {/* ==========================================
          COLONNA DESTRA: I Budget (25% dello spazio) 
          ========================================== */}
            <div style={{
                flex: '1', backgroundColor: '#2f3542', color: 'white',
                padding: '20px', overflowY: 'auto', borderLeft: '5px solid #ff4757'
            }}>
                <h3 style={{ textAlign: 'center', borderBottom: '2px solid #57606f', paddingBottom: '15px', marginBottom: '20px' }}>
                    💰 Budget Squadre
                </h3>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    {/* Ordiniamo le squadre per budget decrescente prima di stamparle */}
                    {[...teams].sort((a, b) => b.remaining_budget - a.remaining_budget).map(team => (
                        <div key={team.id} style={{
                            backgroundColor: '#57606f', padding: '15px', borderRadius: '8px',
                            display: 'flex', flexDirection: 'column' /* Cambiato in column */
                        }}>

                            {/* Riga Superiore: Nome e Budget */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                                <div>
                                    <strong style={{ fontSize: '18px', display: 'block' }}>{team.name}</strong>
                                    <span style={{ fontSize: '12px', color: '#ced6e0' }}>{team.owner_name}</span>
                                </div>
                                <div style={{
                                    backgroundColor: team.remaining_budget < 50 ? '#ff4757' : '#2ed573',
                                    padding: '8px 12px', borderRadius: '5px', fontWeight: 'bold', fontSize: '20px'
                                }}>
                                    {team.remaining_budget}
                                </div>
                            </div>

                            {/* 🌟 Riga Inferiore: Riepilogo Rose (P, D, C, A) */}
                            <div style={{
                                display: 'flex', justifyContent: 'space-between',
                                fontSize: '13px', color: '#f1f2f6', backgroundColor: '#2f3542',
                                padding: '5px 10px', borderRadius: '4px'
                            }}>
                                <span style={{ color: getRoleCount(team.id, 'P') >= 3 ? '#ff4757' : 'inherit' }}>
                                    P: <b>{getRoleCount(team.id, 'P')}</b>/3
                                </span>
                                <span style={{ color: getRoleCount(team.id, 'D') >= 8 ? '#ff4757' : 'inherit' }}>
                                    D: <b>{getRoleCount(team.id, 'D')}</b>/8
                                </span>
                                <span style={{ color: getRoleCount(team.id, 'C') >= 8 ? '#ff4757' : 'inherit' }}>
                                    C: <b>{getRoleCount(team.id, 'C')}</b>/8
                                </span>
                                <span style={{ color: getRoleCount(team.id, 'A') >= 6 ? '#ff4757' : 'inherit' }}>
                                    A: <b>{getRoleCount(team.id, 'A')}</b>/6
                                </span>
                            </div>

                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}