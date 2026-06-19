import React from 'react';
import { Paper, Typography, List, ListItem, ListItemText, Box } from '@mui/material';

const styles = {
    container: {
        padding: { xs: '15px', sm: '30px' },
        backgroundColor: '#f8f9fa',
        borderRadius: '12px',
        border: '1px solid #f1f2f6',
        boxSizing: 'border-box',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        width: '100%',
        height: { xs: '300px', md: '100%' },
        maxHeight: { xs: '400px', md: '600px' },
        display: 'flex',
        flexDirection: 'column'
    },
    title: {
        fontWeight: 'bold',
        color: '#2f3542',
        marginBottom: '15px',
        textTransform: 'uppercase',
        fontSize: '14px',
        letterSpacing: '1px'
    },
    listItem: {
        borderBottom: '1px solid #ecf0f1',
        padding: '8px 0'
    },
    latestText: {
        color: '#2ecc71',
        fontWeight: 'bold'
    },
    normalText: {
        color: '#2f3542'
    },
    timestamp: {
        fontSize: '0.85em',
        color: '#95a5a6',
        fontWeight: 'normal',
        marginLeft: '8px'
    },
    emptyText: {
        color: '#bdc3c7',
        fontStyle: 'italic',
        textAlign: 'center',
        marginTop: '20px'
    },
    listContainer: {
        flex: 1,
        overflowY: 'auto'
    }
};

export default function AuctionLog({ history }) {
    return (
        <Paper sx={styles.container} elevation={0}>
            <Typography variant="subtitle2" style={styles.title}>
                📜 Cronologia Offerte
            </Typography>
            
            <Box style={styles.listContainer}>
            {history.length === 0 ? (
                <Typography style={styles.emptyText}>
                    In attesa della prima offerta...
                </Typography>
            ) : (
                <List dense>
                    {history.map((log, index) => (
                        <ListItem key={index} style={styles.listItem} disablePadding>
                            <ListItemText 
                                primary={
                                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', width: '100%', alignItems: { xs: 'flex-start', sm: 'center' } }}>
                                        <Typography variant="body1" sx={{ fontWeight: index === 0 ? 'bold' : 'normal', color: index === 0 ? '#2ecc71' : '#2f3542' }}>
                                            {log.teamName}
                                        </Typography>
                                        <Typography variant="body2" sx={{ fontWeight: index === 0 ? 'bold' : 'normal', color: index === 0 ? '#2ecc71' : '#2f3542', mt: { xs: 0.5, sm: 0 } }}>
                                            {log.amount} FM
                                            <span style={styles.timestamp}>({log.time})</span>
                                        </Typography>
                                    </Box>
                                }
                            />
                        </ListItem>
                    ))}
                </List>
            )}
            </Box>
        </Paper>
    );
}