import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';

const styles = {
    listItem: {
        borderBottom: '1px solid #f1f2f6',
    },
    roleBadge: (role) => {
        const colors = { 'P': '#f39c12', 'D': '#2ecc71', 'C': '#3498db', 'A': '#e74c3c' };
        return {
            backgroundColor: colors[role] || '#95a5a6',
            color: 'white',
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            marginRight: '15px',
            fontSize: '14px'
        };
    },
    playerName: {
        fontWeight: 'bold',
        color: '#2f3542',
    },
    playerDetails: {
        color: '#747d8c',
        fontSize: '13px'
    }
};

export default function PlayerListTile({ player, onClick })  {
    return (
        <ListItem disablePadding style={styles.listItem}>
            <ListItemButton onClick={() => onClick(player)}>
                <div style={styles.roleBadge(player.role)}>
                    {player.role}
                </div>
                <ListItemText
                    primary={<span style={styles.playerName}>{player.name}</span>}
                    secondary={
                        <span style={styles.playerDetails}>
                            {player.club} • Qt. {player.current_price}
                        </span>
                    }
                />
            </ListItemButton>
        </ListItem>
    );
};