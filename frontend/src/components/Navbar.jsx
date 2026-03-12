import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer';

const styles = {
  appBar: {
    backgroundColor: '#2f3542',
  },
  titleBox: {
    flexGrow: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    cursor: 'pointer'
  },
  titleText: {
    fontWeight: 'bold',
    fontSize: '1.25rem'
  },
  highlight: {
    color: '#7bed9f'
  },
  navButton: {
    color: 'white',
    textTransform: 'none',
    fontWeight: 'bold',
    marginLeft: '10px'
  }
};

export default function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    if (window.confirm('Sei sicuro di voler uscire?')) {
      localStorage.clear();
      navigate('/login');
    }
  };

  return (
    <AppBar position="static" style={styles.appBar} elevation={4}>
      <Toolbar>
        <Box onClick={() => navigate('/')} style={styles.titleBox}>
          <SportsSoccerIcon style={{ color: '#7bed9f' }} />
          <Typography variant="h6" component="div" style={styles.titleText}>
            <span style={styles.highlight}>Fanta</span>Asta Live
          </Typography>
        </Box>

        <Box>
          <Button
            startIcon={<HomeIcon />}
            onClick={() => navigate('/')}
            sx={styles.navButton}
          >
            Home
          </Button>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleLogout}
            sx={{ ...styles.navButton, color: '#ff6b6b' }}
          >
            Log out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
