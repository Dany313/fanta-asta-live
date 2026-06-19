const request = require('supertest');
const express = require('express');
const teamRoutes = require('../routes/teamRoutes'); // Assumendo che le rotte siano qui
const db = require('../config/db');

// Facciamo il mock del modulo DB. Ogni volta che il codice chiama db.query,
// userà la nostra implementazione finta invece di interrogare il vero database.
jest.mock('../config/db');

// Creiamo una mini-app Express solo per i test
const app = express();
app.use(express.json());
app.use('/api/teams', teamRoutes);

describe('Team Controller - API Endpoints', () => {

  // Resettiamo i mock prima di ogni test per evitare interferenze
  beforeEach(() => {
    db.query.mockClear();
  });

  describe('GET /api/teams', () => {
    it('dovrebbe restituire un array di team come DTO e status 200', async () => {
      // 1. Setup: Definiamo i dati finti che il DB dovrebbe restituire
      const mockDbRows = {
        rows: [
          { id: 1, name: 'Team A', remaining_budget: 500, max_possible_bid: 475, invite_token: 'tokenA' },
          { id: 2, name: 'Team B', remaining_budget: 450, max_possible_bid: 425, invite_token: 'tokenB' },
        ]
      };
      // Configuriamo il mock per restituire questi dati quando viene chiamato
      db.query.mockResolvedValueOnce(mockDbRows);

      // 2. Act: Eseguiamo la chiamata API con supertest
      const response = await request(app).get('/api/teams');

      // 3. Assert: Verifichiamo i risultati
      expect(response.statusCode).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBe(2);
      // Verifichiamo che il DTO abbia nascosto il token!
      expect(response.body[0]).toEqual({
        id: 1, name: 'Team A', remainingBudget: 500, maxPossibleBid: 475
      });
      expect(response.body[0].inviteToken).toBeUndefined();
    });
  });
});