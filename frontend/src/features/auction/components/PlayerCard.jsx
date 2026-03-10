import React, { useState } from 'react';
import { Paper, Typography, Box, Button, TextField, Stack, Avatar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const styles = {
    container: {
        padding: '30px',
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        textAlign: 'center',
        border: '1px solid #f1f2f6',
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
    },
    header: {
        marginBottom: '20px',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        color: '#e67e22',
        fontWeight: 'bold'
    },
    roleBadge: (role) => {
        const colors = { 'P': '#f39c12', 'D': '#2ecc71', 'C': '#3498db', 'A': '#e74c3c' };
        return {
            backgroundColor: colors[role] || '#95a5a6',
            color: 'white',
            fontWeight: 'bold',
            width: '50px',
            height: '50px',
            fontSize: '20px',
            marginBottom: '10px'
        };
    },
    playerName: {
        fontWeight: '900',
        color: '#2f3542',
        margin: '10px 0',
        textTransform: 'uppercase'
    },
    clubName: {
        color: '#747d8c',
        marginBottom: '25px',
        fontWeight: '500'
    },
    priceBox: {
        backgroundColor: '#f1f2f6',
        padding: '15px 30px',
        borderRadius: '12px',
        display: 'inline-block',
        marginBottom: '20px',
        border: '1px solid #dfe4ea'
    },
    priceLabel: {
        fontSize: '14px',
        color: '#a4b0be',
        textTransform: 'uppercase',
        fontWeight: 'bold'
    },
    priceValue: {
        fontSize: '42px',
        fontWeight: 'bold',
        color: '#2f3542',
        lineHeight: '1'
    },
    bidControls: {
        marginTop: '20px',
        paddingTop: '20px',
        borderTop: '1px solid #f1f2f6'
    },
    quickBidButton: {
        borderRadius: '8px',
        fontWeight: 'bold',
        padding: '8px 20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
    }
};

export default function PlayerCard({ player, currentBid, onBid, title = "🔨 ASTA IN CORSO" }) {
    const [customBid, setCustomBid] = useState('');

    if (!player) return null;

    const handleQuickBid = (increment) => {
        if (onBid) onBid(null, (currentBid || 0) + increment);
    };

    const handleCustomBid = (e) => {
        e.preventDefault();
        const val = parseInt(customBid, 10);
        if (!isNaN(val) && val > (currentBid || 0)) {
            if (onBid) onBid(null, val);
            setCustomBid('');
        }
    };

    return (
        <Paper style={styles.container} elevation={0}>
            <Typography variant="subtitle2" style={styles.header}>
                {title}
            </Typography>

            <Box display="flex" justifyContent="center" alignItems="center" flexDirection="column" flex={1}>
                <Avatar sx={styles.roleBadge(player.role)}>
                    {player.role}
                </Avatar>
                
                <Typography variant="h3" style={styles.playerName}>
                    {player.name}
                </Typography>
                
                <Typography variant="h6" style={styles.clubName}>
                    {player.club}
                </Typography>

                <Box style={styles.priceBox}>
                    <Typography style={styles.priceLabel}>
                        Offerta Attuale
                    </Typography>
                    <Typography style={styles.priceValue}>
                        {currentBid || 0} <span style={{fontSize: '20px', verticalAlign: 'top'}}>FM</span>
                    </Typography>
                </Box>
            </Box>

            {onBid && (
                <Box style={styles.bidControls}>
                    <Stack direction="row" spacing={2} justifyContent="center" marginBottom={3}>
                        {[1, 5, 10].map(amount => (
                            <Button 
                                key={amount}
                                variant="contained" 
                                color="success" 
                                onClick={() => handleQuickBid(amount)}
                                style={styles.quickBidButton}
                            >
                                +{amount}
                            </Button>
                        ))}
                    </Stack>

                    <form onSubmit={handleCustomBid} style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
                        <TextField
                            size="small"
                            type="number"
                            placeholder="Offerta libera..."
                            value={customBid}
                            onChange={(e) => setCustomBid(e.target.value)}
                            InputProps={{ inputProps: { min: (currentBid || 0) + 1 } }}
                            style={{ width: '150px' }}
                        />
                        <Button 
                            variant="contained" 
                            color="primary" 
                            type="submit"
                            endIcon={<SendIcon />}
                            disabled={!customBid}
                            style={{ borderRadius: '8px', fontWeight: 'bold' }}
                        >
                            Rilancia
                        </Button>
                    </form>
                </Box>
            )}
        </Paper>
    );
}