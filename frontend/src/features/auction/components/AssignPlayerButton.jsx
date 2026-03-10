import React from 'react';
import Fab from '@mui/material/Fab';
import GavelIcon from '@mui/icons-material/Gavel';
import Tooltip from '@mui/material/Tooltip';

const styles = {
    fab: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#2ecc71', // Verde
        color: 'white',
        '&:hover': {
            backgroundColor: '#27ae60',
        },
    }
};

export default function AssignPlayerButton({ onClick, disabled }) {
    return (
        <Tooltip title="Assegna Giocatore">
            <span> {/* Span per abilitare il tooltip anche quando il bottone è disabilitato */}
                <Fab
                    sx={styles.fab}
                    aria-label="assign player"
                    onClick={onClick}
                    disabled={disabled}
                ><GavelIcon /></Fab>
            </span>
        </Tooltip>
    );
}