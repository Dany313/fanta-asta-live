import React, { useState, useEffect } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionActions from '@mui/material/AccordionActions';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PlayerInviteCard from './PlayerInviteCard';
export default function InvitePanel({ teams }) {


    return (
        <div>
            <Accordion>
                <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1-content"
                    id="panel1-header"
                >
                    <h3 style={{ margin: '0 0 15px 0' }}>🔗 Invia i link ai partecipanti</h3>
                </AccordionSummary>
                <AccordionDetails>
                    <div>
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            {teams.map(team => (
                                <PlayerInviteCard team={team} />
                            ))}
                        </div>
                    </div>
                </AccordionDetails>
            </Accordion>
        </div>
    );
}