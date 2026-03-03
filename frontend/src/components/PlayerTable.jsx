import React, { useState, useEffect } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import TablePagination from '@mui/material/TablePagination';
import CustomButton from './CustomButton';

export default function PlayerTable({ players, onPlayerClick, buttonText, buttonVariant }) {
  const [page, setPage] = useState(0);
  const rowsPerPage = 50;

  // Resetta la pagina a 0 se cambiano i filtri/dati
  useEffect(() => {
    setPage(0);
  }, [players]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  if (!players || players.length === 0) {
    return <p style={{ padding: '20px', textAlign: 'center' }}>Nessun giocatore da mostrare.</p>;
  }

  return (
    <Paper>
      <TableContainer>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell align="right">R</TableCell>
            <TableCell align="right">Squadra</TableCell>
            <TableCell align="right">Qt.A</TableCell>
            <TableCell align="right">Azione</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {players
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((player) => (
            <TableRow
              key={player.id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {player.name}
              </TableCell>
              <TableCell align="right">{player.role}</TableCell>
              <TableCell align="right">{player.club}</TableCell>
              <TableCell align="right">{player.current_price}</TableCell>
              <TableCell align="right">
                <CustomButton
                  variant={buttonVariant}
                  onClick={() => onPlayerClick(player)}
                >
                  {buttonText}
                </CustomButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    <TablePagination
        rowsPerPageOptions={[50]}
        component="div"
        count={players.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
      />
    </Paper>
  );
}