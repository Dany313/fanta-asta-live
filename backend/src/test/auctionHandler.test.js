const { createServer } = require('http');
const { Server } = require('socket.io');
const Client = require('socket.io-client');
const registerAuctionHandlers = require('../sockets/handlers/auctionHandler');
const db = require('../config/db');
const { resetAuction } = require('../sockets/handlers/auctionState');

jest.mock('../config/db');

describe('Auction Socket Handler', () => {
  let io, serverSocket, clientSocket, httpServer;

  // Prima di tutti i test, creiamo un server e un client
  beforeAll((done) => {
    httpServer = createServer();
    io = new Server(httpServer);

    // Registriamo i nostri handler reali sul server di test
    io.on('connection', (socket) => {
      serverSocket = socket;
      registerAuctionHandlers(io, socket);
    });

    httpServer.listen(() => {
      const port = httpServer.address().port;
      clientSocket = new Client(`http://localhost:${port}`);
      clientSocket.on('connect', done);
    });
  });

  // Dopo tutti i test, chiudiamo le connessioni
  afterAll(() => {
    io.close();
    clientSocket.close();
    httpServer.close();
  });

  // Prima di ogni test, puliamo lo stato e i mock
  beforeEach(() => {
    db.query.mockClear();
    resetAuction();
  });

  // Test per l'evento 'start_auction'
  it("dovrebbe iniziare un'asta e notificare tutti i client", (done) => {
    // 1. Setup: Dati finti per il giocatore e per i team dal DB
    const mockPlayerData = { id: 10, name: 'BARELLA', role: 'C' };
    const mockTeamsData = {
      rows: [{ id: 1, name: 'Team A', remaining_budget: 500, max_possible_bid: 475 }]
    };
    db.query.mockResolvedValueOnce(mockTeamsData);

    // 2. Listen: Ci mettiamo in ascolto dell'evento di risposta 'auction_started'
    clientSocket.on('auction_started', (state) => {
      // 3. Assert: Verifichiamo che lo stato ricevuto sia corretto
      expect(state.player).toEqual(mockPlayerData);
      expect(state.highestBid).toBe(0);
      expect(state.status).toBe('ACTIVE');
      expect(db.query).toHaveBeenCalledTimes(1); // Verifichiamo che il DB sia stato chiamato
      
      clientSocket.off('auction_started'); // Puliamo il listener
      done(); // Diciamo a Jest che il test asincrono è finito
    });

    // 4. Act: Il client emette l'evento per iniziare l'asta
    clientSocket.emit('start_auction', mockPlayerData);
  });

  // Test per l'evento 'place_bid'
  it('dovrebbe accettare un-offerta valida e aggiornare lo stato', (done) => {
    // 1. Setup: Prima dobbiamo avviare un'asta
    const mockPlayerData = { id: 20, name: 'IMMOBILE', role: 'A' };
    const mockTeamsData = {
      rows: [{ id: 2, name: 'Team B', remaining_budget: 300, max_possible_bid: 276 }]
    };
    db.query.mockResolvedValueOnce(mockTeamsData);
    
    // Avviamo l'asta (non testiamo l'avvio qui, lo diamo per scontato)
    clientSocket.emit('start_auction', mockPlayerData);

    // 2. Listen: Ascoltiamo l'aggiornamento
    clientSocket.on('auction_update', (state) => {
      // 3. Assert: Verifichiamo che l'offerta sia stata registrata
      expect(state.highestBid).toBe(15);
      expect(state.highestBidderName).toBe('Team B');
      expect(state.history.length).toBe(1);
      expect(state.history[0].amount).toBe(15);

      clientSocket.off('auction_update');
      done();
    });

    // Diamo un piccolo ritardo per essere sicuri che 'start_auction' sia stato processato
    setTimeout(() => {
      // 4. Act: Piazziamo l'offerta
      const bidData = { teamId: 2, teamName: 'Team B', amount: 15 };
      clientSocket.emit('place_bid', bidData);
    }, 100); // 100ms di solito sono sufficienti
  });

  // Test per l'evento 'place_bid' con puntata non valida
  it('dovrebbe rifiutare un-offerta non valida troppo alta e emettere bid_error', (done) => {
    // 1. Setup: Avviamo un'asta.
    const mockPlayerData = { id: 20, name: 'IMMOBILE', role: 'A' };
    const mockTeamsData = {
      rows: [{ id: 2, name: 'Team B', remaining_budget: 300, max_possible_bid: 276 }]
    };
    db.query.mockResolvedValueOnce(mockTeamsData);
    
    // Attendiamo che l'asta sia effettivamente iniziata prima di procedere
    clientSocket.once('auction_started', () => {
        // 2. Listen: Ascoltiamo l'evento di errore che ci aspettiamo.
        clientSocket.on('bid_error', (error) => {
            // 3. Assert: Verifichiamo il messaggio di errore.
            expect(error.message).toBe('Offerta supera il limite massimo (276)');
            
            // Puliamo i listener per evitare che interferiscano con altri test
            clientSocket.off('bid_error');
            clientSocket.off('auction_update');
            done(); // Il test è finito correttamente.
        });

        // Listener "trappola": se per errore viene chiamato 'auction_update', facciamo fallire il test.
        clientSocket.on('auction_update', () => {
            done(new Error("`auction_update` non doveva essere chiamato per un'offerta non valida"));
        });

        // 4. Act: Piazziamo l'offerta non valida.
        const invalidBidData = { teamId: 2, teamName: 'Team B', amount: 277 }; // 277 > 276
        clientSocket.emit('place_bid', invalidBidData);
    });

    // Avviamo l'asta
    clientSocket.emit('start_auction', mockPlayerData);
  });
});