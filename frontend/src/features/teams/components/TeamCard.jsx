import React, { useState, useEffect } from 'react';
import axios from 'axios';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ModeEditIcon from '@mui/icons-material/ModeEdit';
import DeleteIcon from '@mui/icons-material/Delete';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';

const TeamCard = ({ id, name, onDelete, onUpdate }) => {
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <Card sx={{ minWidth: 275 }}>
            <CardContent>
                <Stack direction="row" justifyContent='space-between' alignItems="center" spacing={2}>
                    <Typography variant="h5" component="div">
                        {name}
                    </Typography>
                    <IconButton aria-haspopup="true" color="primary" aria-label="add" onClick={handleClick}>
                        <MoreVertIcon />
                    </IconButton>
                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                    >
                        <MenuItem onClick={onUpdate}>
                            <Button startIcon={<ModeEditIcon />}>
                                Modifica
                            </Button></MenuItem>
                        <MenuItem onClick={() => onDelete(id)}>
                            <Button startIcon={<DeleteIcon />}>
                                Elimina
                            </Button>
                        </MenuItem>
                    </Menu>
                </Stack>
            </CardContent>
            <CardActions>
                <Button size="small" onClick={() => alert('unimplemented')}>
                    Vai alla lega
                </Button>
            </CardActions>
        </Card>
    );
};

export default TeamCard;
