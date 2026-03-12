import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Box, Typography, Paper, Button, Avatar, Stack, CircularProgress } from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import { getTeams } from '../../api/teamsApi';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        backgroundColor: '#f1f2f6',
        padding: '20px'
    },
    paper: {
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '500px',
        width: '100%',
        backgroundColor: 'white'
    },
    avatar: {
        margin: '8px',
        backgroundColor: '#3498db',
        width: 60,
        height: 60
    },
    title: {
        fontWeight: 'bold',
        color: '#2f3542',
        marginBottom: '8px',
        marginTop: '10px'
    },
    subtitle: {
        color: '#7f8c8d',
        marginBottom: '32px',
        textAlign: 'center'
    },
    teamButton: {
        justifyContent: 'space-between',
        padding: '12px 24px',
        fontSize: '16px',
        fontWeight: '500',
        textTransform: 'none',
        borderColor: '#dfe6e9',
        color: '#2f3542',
        '&:hover': {
            backgroundColor: '#f1f2f6',
            borderColor: '#3498db'
        }
    }
};

const SelectAdminTeamPage = () => {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    
    const { data: teams = [], isLoading } = useQuery({
        queryKey: ['teams', leagueId],
        queryFn: () => getTeams(leagueId)
    });

    useEffect(() => {
        if (localStorage.getItem('adminTeamId')) {
            navigate(`/auction/${leagueId}`);
        }
    }, [leagueId, navigate]);

    const handleTeamSelect = (teamId) => {
        localStorage.setItem('adminTeamId', teamId);
        navigate(`/auction/${leagueId}`);
    };

    return (
        <Box style={styles.container}>
            <Paper style={styles.paper} elevation={3}>
                <Avatar style={styles.avatar}>
                    <AdminPanelSettingsIcon fontSize="large" />
                </Avatar>
                
                <Typography component="h1" variant="h5" style={styles.title}>
                    Identificati
                </Typography>
                <Typography variant="body2" style={styles.subtitle}>
                    Seleziona la squadra che amministrerai durante questa sessione d'asta.
                </Typography>

                {isLoading ? (
                    <CircularProgress />
                ) : (
                    <Stack spacing={2} sx={{ width: '100%' }}>
                        {teams.map(team => (
                            <Button 
                                key={team.id} 
                                variant="outlined" 
                                fullWidth
                                sx={styles.teamButton}
                                onClick={() => handleTeamSelect(team.id)}
                                endIcon={<ArrowForwardIosIcon style={{ fontSize: 16, color: '#bdc3c7' }} />}
                            >
                                {team.name}
                            </Button>
                        ))}
                        {teams.length === 0 && (
                            <Typography color="error" align="center">
                                Nessuna squadra trovata in questa lega.
                            </Typography>
                        )}
                    </Stack>
                )}
            </Paper>
        </Box>
    );
};

export default SelectAdminTeamPage;
