const teamService = require('../services/teamService');
const teamRepository = require('../repositories/teamRepository');
const leagueRepository = require('../repositories/leagueRepository');

// 1. Diciamo a Jest di "falsificare" i repository
jest.mock('../repositories/teamRepository');
jest.mock('../repositories/leagueRepository');

describe('TeamService - Creazione Squadra', () => {
    
    // Puliamo i mock prima di ogni test
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('dovrebbe lanciare un errore se la lega è già piena (10 squadre)', async () => {
        // Arrange: Prepariamo le finzioni. Diciamo che la lega esiste e ha già 10 squadre.
        leagueRepository.findById.mockResolvedValue({ id: 1, name: 'Serie A' });
        teamRepository.countTeamsByLeague.mockResolvedValue(10); 

        // Act & Assert: Verifichiamo che il service lanci esattamente l'errore atteso
        await expect(teamService.createTeam(1, 'Atletico Fanta', 500))
            .rejects
            .toThrow("Questa lega ha già raggiunto il numero massimo di 10 squadre.");
        
        // Verifichiamo che non abbia mai provato a salvare nel DB
        expect(teamRepository.create).not.toHaveBeenCalled();
    });

    it('dovrebbe creare la squadra se tutti i controlli passano', async () => {
        // Arrange: Lega valida, 5 squadre presenti, nome non utilizzato
        leagueRepository.findById.mockResolvedValue({ id: 1 });
        teamRepository.countTeamsByLeague.mockResolvedValue(5);
        teamRepository.findTeamByNameAndLeague.mockResolvedValue(null);
        teamRepository.create.mockResolvedValue({ id: 99, name: 'Real Fanta', remaining_budget: 500 });

        // Act
        const result = await teamService.createTeam(1, 'Real Fanta', 500);

        // Assert
        expect(result.id).toBe(99);
        expect(teamRepository.create).toHaveBeenCalledTimes(1); // Il DB è stato chiamato una volta
    });
});