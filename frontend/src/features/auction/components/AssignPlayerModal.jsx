import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, FormControl, InputLabel, Select, MenuItem, Typography, Box } from '@mui/material';

export default function AssignPlayerModal({ open, onClose, onConfirm, assignSnapshot, teams }) {
    const [overridePrice, setOverridePrice] = useState(0);
    const [overrideWinnerId, setOverrideWinnerId] = useState('');

    useEffect(() => {
        if (open && assignSnapshot) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOverridePrice(assignSnapshot.highestBid || 0);
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setOverrideWinnerId(assignSnapshot.highestBidderId || '');
        }
    }, [open, assignSnapshot]);

    const handleConfirm = () => {
        if (overrideWinnerId && overridePrice > 0) {
            onConfirm(overrideWinnerId, parseInt(overridePrice, 10));
        }
    };

    if (!assignSnapshot || !assignSnapshot.player) return null;

    return (
        <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
            <DialogTitle style={{ backgroundColor: '#2f3542', color: 'white' }}>
                Assegna Giocatore
            </DialogTitle>
            <DialogContent style={{ paddingTop: '20px' }}>
                <Box mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">
                        {assignSnapshot.player.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                        {assignSnapshot.player.role} - {assignSnapshot.player.club}
                    </Typography>
                </Box>
                
                <FormControl fullWidth margin="dense" size="small">
                    <InputLabel>Assegna a</InputLabel>
                    <Select
                        value={overrideWinnerId}
                        label="Assegna a"
                        onChange={(e) => setOverrideWinnerId(e.target.value)}
                    >
                        <MenuItem value=""><em>Seleziona squadra</em></MenuItem>
                        {teams.map(t => (
                            <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                
                <TextField
                    fullWidth
                    margin="dense"
                    label="Prezzo di acquisto"
                    type="number"
                    size="small"
                    value={overridePrice}
                    onChange={(e) => setOverridePrice(e.target.value)}
                    InputProps={{ inputProps: { min: 1 } }}
                    style={{ marginTop: '15px' }}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">Annulla</Button>
                <Button onClick={handleConfirm} variant="contained" color="success" disabled={!overrideWinnerId || overridePrice <= 0}>
                    Conferma Assegnazione
                </Button>
            </DialogActions>
        </Dialog>
    );
}
