import React, { useState } from 'react';
import { 
    Dialog, 
    DialogTitle, 
    DialogContent, 
    DialogActions, 
    Button, 
    Typography, 
    Box,
    CircularProgress,
    Alert
} from '@mui/material';
import { uploadListone } from '../../../api/playersApi';

export default function UploadListoneModal({ open, onClose, onSuccess }) {
    const [file, setFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setError(null);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError('Seleziona prima un file Excel.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await uploadListone(file);
            setIsLoading(false);
            setFile(null);
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setIsLoading(false);
            setError(err.message || 'Errore imprevisto durante il caricamento');
        }
    };

    const handleClose = () => {
        if (isLoading) return; // Non permettere la chiusura durante il caricamento
        setFile(null);
        setError(null);
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" disableEscapeKeyDown={isLoading}>
            <DialogTitle>Carica Listone Excel</DialogTitle>
            <DialogContent>
                <Box display="flex" flexDirection="column" gap={2} mt={1}>
                    <Typography variant="body1">
                        Seleziona il file <b>Quotazioni</b> in formato Excel (.xlsx) scaricato direttamente dal sito Leghe Fantacalcio.
                    </Typography>
                    
                    {error && <Alert severity="error">{error}</Alert>}
                    
                    <Box display="flex" alignItems="center" gap={2}>
                        <Button
                            variant="contained"
                            component="label"
                            disabled={isLoading}
                        >
                            Scegli File
                            <input
                                type="file"
                                hidden
                                accept=".xlsx, .xls"
                                onChange={handleFileChange}
                            />
                        </Button>
                        <Typography variant="body2" color="textSecondary">
                            {file ? file.name : 'Nessun file selezionato'}
                        </Typography>
                    </Box>

                    {isLoading && (
                        <Box display="flex" flexDirection="column" alignItems="center" gap={2} mt={2}>
                            <CircularProgress />
                            <Typography variant="body2">
                                Caricamento e salvataggio nel database in corso... L'operazione potrebbe richiedere alcuni secondi.
                            </Typography>
                        </Box>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="inherit" disabled={isLoading}>
                    Annulla
                </Button>
                <Button 
                    onClick={handleUpload} 
                    variant="contained" 
                    color="primary" 
                    disabled={!file || isLoading}
                >
                    {isLoading ? 'Caricamento...' : 'Carica Giocatori'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
