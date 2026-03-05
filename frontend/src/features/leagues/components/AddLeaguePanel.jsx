import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

const AddLeaguePanel = ({ onClick }) => {
    const [newLeagueName, setNewLeagueName] = useState('');

    return (
        <div>
            <Stack direction="column" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                <TextField
                    id="league_name"
                    label="Nome della Lega"
                    variant="filled"
                    value={newLeagueName}
                    onChange={(e) => setNewLeagueName(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={() => onClick(newLeagueName)}>
                    Crea
                </Button>
            </Stack>
        </div>
    );
};

export default AddLeaguePanel;
