
import RosterList from './components/RosterList';
import { useParams } from 'react-router-dom';
import { getRoster } from '../../api/rosterApi';
import { getPlayers } from '../../api/playersApi';
import { useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import { addPlayerToRoster, putPlayerPrice, removePlayerFromRoster } from '../../api/rosterApi';

const RosterPage = () => {
    const queryClient = useQueryClient();
    
    const { teamId } = useParams();

     //Queries
    const { data: roster = [], isLoading: loading } = useQuery({
        queryKey: ['rosters', teamId],
        queryFn: () => getRoster(teamId)
    });

    const { data: allPlayers = [], isLoading: loadingPlayers } = useQuery({
        queryKey: ['players'],
        queryFn: getPlayers,
        select: (data) => data.filter(player => !roster.some(r => r.player_id === player.id)) // Filtra i giocatori già nel roster
    });

        // Mutations
    const { mutate: postMutation } = useMutation({
        mutationFn: async (player) => {
            const purchasePrice = prompt(`Inserisci il prezzo di acquisto per ${player.name}:`, 1);
            if (purchasePrice === null || isNaN(purchasePrice)) throw new Error("Cancelled");
            return addPlayerToRoster({ team_id: teamId, player_id: player.id, price: parseInt(purchasePrice, 10) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rosters'] });
        },
        onError: (error) => {
            if (error.message === "Cancelled") return;
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la creazione");
        }
    });

    const { mutate: putMutation } = useMutation({
        mutationFn: async (playerId) => {
            const purchasePrice = prompt(`Inserisci il nuovo prezzo di acquisto:`, 1);
            if (purchasePrice === null || isNaN(purchasePrice)) throw new Error("Cancelled");
            return putPlayerPrice({ team_id: teamId, player_id: playerId, price: parseInt(purchasePrice, 10) });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rosters'] });
        },
        onError: (error) => {
            if (error.message === "Cancelled") return;
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la modfica");
        }
    });

    const { mutate: deleteMutation } = useMutation({
        mutationFn: async (playerId) => {
            if (!window.confirm('Sei sicuro di voler eliminare questo giocatore?')) throw new Error("Cancelled");
            return removePlayerFromRoster({ team_id: teamId, player_id: playerId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['rosters'] });
        },
        onError: (error) => {
            if (error.message === "Cancelled") return;
            console.error("Errore", error);
            if (error.response && error.response.status === 401) handleLogout();
            else alert("Errore durante la cancellazione");
        }
    });


    return (
        <div>
            <h2>{teamId ? `Squadra ${teamId}` : "Tutte le squadre"}</h2>
            {loading ? <p>Caricamento...</p> : (
                <RosterList
                    players={roster}
                    allPlayers={allPlayers}
                    onAdd={postMutation}
                    onUpdate={putMutation}
                    onDelete={deleteMutation}
                />
            )}
        </div>
    );
};

export default RosterPage;
