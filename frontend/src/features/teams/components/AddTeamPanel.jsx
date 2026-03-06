import Button from '@mui/material/Button';
import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

const AddTeamPanel = ({ onClick }) => {
    const [newTeamName, setNewTeamName] = useState('');

    return (
        <div>
            <Stack direction="column" alignItems="center" spacing={2} sx={{ mt: 2 }}>
                <TextField
                    id="team_name"
                    label="Nome della Squadra"
                    variant="filled"
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                />
                <Button variant="contained" color="primary" onClick={() => onClick(newTeamName)}>
                    Crea
                </Button>
            </Stack>
        </div>
    );
};

export default AddTeamPanel;
