import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    TextField,
    Typography
} from "@mui/material";

const styles = {
    container: {
        padding: '20px',
        marginBottom: '20px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dfe4ea',
    },
    title: {
        fontWeight: 'bold',
        color: '#2f3542',
        marginBottom: '15px',
    },
    formContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        flexWrap: 'wrap'
    },
    formControl: {
        flex: '1 1 250px', // Responsive width
    },
    textField: {
        flex: '0 1 120px',
    },
    submitButton: {
        backgroundColor: '#e67e22',
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'none',
        padding: '10px 20px',
        '&:hover': {
            backgroundColor: '#d35400',
        }
    }
};

export default function AdminCustomBet({ teams, handleCustomBet }) {
    const [selectedTeam, setSelectedTeam] = useState('');
    const [betAmount, setBetAmount] = useState(1);

    const handleTeamChange = (event) => {
        setSelectedTeam(event.target.value);
    };

    const handleAmountChange = (event) => {
        const value = parseInt(event.target.value, 10);
        setBetAmount(isNaN(value) || value < 1 ? 1 : value);
    };

    const bet = () => {
        if (!selectedTeam || betAmount <= 0) return;
        handleCustomBet(selectedTeam, betAmount);
        // Reset form
        setSelectedTeam('');
        setBetAmount(1);
    }

    return (
        <Paper sx={styles.container} elevation={0}>
            <Typography variant="h6" sx={styles.title}>
                ✍️ Offerta Manuale
            </Typography>
            <Box sx={styles.formContainer}>
                <FormControl fullWidth sx={styles.formControl} size="small">
                    <InputLabel>Seleziona Squadra</InputLabel>
                    <Select
                        value={selectedTeam}
                        label="Seleziona Squadra"
                        onChange={handleTeamChange}
                    >
                        {teams.map(team => (
                            <MenuItem key={team.id} value={team.id}>{team.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <TextField
                    label="Crediti"
                    type="number"
                    value={betAmount}
                    onChange={handleAmountChange}
                    sx={styles.textField}
                    size="small"
                    InputProps={{ inputProps: { min: 1 } }}
                />
                <Button
                    variant="contained"
                    onClick={bet}
                    disabled={!selectedTeam || betAmount <= 0}
                    sx={styles.submitButton}
                >
                    Punta
                </Button>
            </Box>
        </Paper>
    );
}