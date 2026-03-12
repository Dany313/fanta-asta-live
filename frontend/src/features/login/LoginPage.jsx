import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, Button, TextField, Alert, Avatar } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

const styles = {
    container: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#f1f2f6'
    },
    paper: {
        padding: '40px',
        borderRadius: '12px',
        boxShadow: '0 8px 20px rgba(0,0,0,0.1)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        maxWidth: '400px',
        width: '100%',
        backgroundColor: 'white'
    },
    avatar: {
        margin: '8px',
        backgroundColor: '#2ed573' // Verde coerente con il tema "successo/login"
    },
    form: {
        marginTop: '8px',
        width: '100%'
    },
    submitButton: {
        marginTop: '24px',
        marginBottom: '16px',
        padding: '10px',
        fontWeight: 'bold',
        backgroundColor: '#2ed573',
        '&:hover': {
            backgroundColor: '#26af61'
        }
    }
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  // useNavigate è un hook di React Router per cambiare pagina via codice
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // Evita che la pagina si ricarichi al submit del form
    setError('');

    try {
      // Inviamo i dati al nostro "buttafuori" su Node.js
      const response = await axios.post('http://localhost:3000/api/login', {
        username,
        password
      });

      if (response.data.success) {
        // 🌟 MAGIA: Salviamo il token (braccialetto VIP) nella memoria del browser!
        localStorage.setItem('adminToken', response.data.token);
        
        // Lo mandiamo dritto alla plancia di comando
        navigate('/');
      }
    } catch (err) {
      // Se il server risponde con errore 401, mostriamo il messaggio
      setError('Credenziali non valide. Riprova!');
    }
  };

  return (
    <Box style={styles.container}>
      <Paper style={styles.paper} elevation={3}>
        <Avatar style={styles.avatar}>
            <LockOutlinedIcon />
        </Avatar>
        
        <Typography component="h1" variant="h5" style={{ color: '#2f3542', fontWeight: 'bold' }}>
            Login Admin
        </Typography>

        <Box component="form" onSubmit={handleLogin} style={styles.form} noValidate>
            {error && (
                <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                    {error}
                </Alert>
            )}

            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />

            <TextField
                variant="outlined"
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={styles.submitButton}
            >
                Accedi
            </Button>
        </Box>
      </Paper>
    </Box>
  );
}