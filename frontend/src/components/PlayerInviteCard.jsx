export default function PlayerInviteCard({ team }) {
    return (
        <div key={team.id} style={{
            backgroundColor: '#f1f2f6', padding: '10px', borderRadius: '5px',
            display: 'flex', alignItems: 'center', gap: '10px', fontSize: '14px'
        }}>
            <strong>{team.name}</strong>
            <button
                onClick={() => {
                    navigator.clipboard.writeText(`http://localhost:5173/join/${team.inviteToken}`);
                    alert(`Copiato!`);
                }}
                style={{ backgroundColor: '#7bed9f', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
            >
                Copia Link
            </button>
            <button
                onClick={() => {
                    if (window.confirm(`Vuoi davvero disconnettere ${team.name}?`)) socket.emit('kick_team', team.id);
                }}
                style={{ backgroundColor: '#ff4757', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '3px', cursor: 'pointer' }}
            >
                Scollega
            </button>
        </div>
    )
}