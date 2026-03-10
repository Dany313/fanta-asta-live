import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect } from 'react';
import { use } from 'react';

const SelectAdminTeamPage = () => {
    const { leagueId } = useParams();
    const navigate = useNavigate();
    const { data: teams = [], isLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: async () => {
            const { data } = await axios.get('http://localhost:3000/api/teams?leagueId=' + leagueId);
            return data;
        }
    });

    useEffect(() => {
        if(localStorage.getItem('adminTeamId')) {
            navigate(`/auction/${leagueId}`);
        }
    }, [leagueId, navigate]);

const handleTeamSelect = (teamId) => {
    localStorage.setItem('adminTeamId', teamId);
    navigate(`/auction/${leagueId}`);
};

    return(
        <div>
            <h2>Seleziona la tua squadra</h2>

                {teams.map(team => (
                    <button key={team.id} value={team.id} onClick={() => handleTeamSelect(team.id)}>
                        {team.name}
                    </button>
                ))}
        </div>
    );

};

export default SelectAdminTeamPage;
