import { useState } from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import GroupIcon from '@mui/icons-material/Group';
import LinkIcon from '@mui/icons-material/Link';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { useAuctionSocket } from '../../../hooks/useAuctionSocket';

const styles = {
    container: {
        marginBottom: '20px',
    },
    mainButton: {
        backgroundColor: '#3498db',
        color: 'white',
        fontWeight: 'bold',
        textTransform: 'none',
        borderRadius: '8px',
        padding: '10px 20px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    },
    dialogTitle: {
        backgroundColor: '#f1f2f6',
        color: '#2f3542',
        fontWeight: 'bold',
        borderBottom: '1px solid #dfe4ea',
    },
    listItem: {
        borderBottom: '1px solid #f1f2f6',
    },
    teamName: {
        fontWeight: 'bold',
        color: '#2f3542',
    },
    iconButtonCopy: {
        color: '#2ed573',
        marginRight: '8px'
    },
    iconButtonKick: {
        color: '#ff4757',
    }
};

export default function InvitePanel({ teams }) {
    const [open, setOpen] = useState(false);
    const socket = useAuctionSocket();

    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleCopyLink = (token) => {
        if (!token) {
            alert('Token non disponibile');
            return;
        }
        navigator.clipboard.writeText(`http://localhost:5173/join/${token}`);
        alert(`Link copiato!`);
    };

    const handleKick = (team) => {
        if (window.confirm(`Vuoi davvero disconnettere ${team.name}?`)) {
            socket.emit('kick_team', team.id);
        }
    };

    return (
        <div style={styles.container}>
            <Button 
                variant="contained" 
                startIcon={<GroupIcon />} 
                onClick={handleOpen}
                style={styles.mainButton}
            >
                Gestione Partecipanti
            </Button>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
                <DialogTitle style={styles.dialogTitle}>
                    👥 Partecipanti ({teams.length})
                </DialogTitle>
                <DialogContent>
                    <List>
                        {teams.map((team) => (
                            <ListItem key={team.id} style={styles.listItem}
                                secondaryAction={
                                    <>
                                        <Tooltip title="Copia Link">
                                            <IconButton edge="end" aria-label="copy" onClick={() => handleCopyLink(team.inviteToken)} style={styles.iconButtonCopy}>
                                                <LinkIcon />
                                            </IconButton>
                                        </Tooltip>
                                        <Tooltip title="Disconnetti">
                                            <IconButton edge="end" aria-label="delete" onClick={() => handleKick(team)} style={styles.iconButtonKick}>
                                                <PersonRemoveIcon />
                                            </IconButton>
                                        </Tooltip>
                                    </>
                                }
                            >
                                <ListItemText 
                                    primary={<span style={styles.teamName}>{team.name}</span>}
                                />
                            </ListItem>
                        ))}
                        {teams.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#a4b0be', marginTop: '20px' }}>
                                Nessuna squadra connessa.
                            </p>
                        )}
                    </List>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Chiudi</Button>
                </DialogActions>
            </Dialog>
        </div>
    );
}