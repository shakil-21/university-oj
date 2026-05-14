import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Leaderboard() {
    const { id } = useParams();
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get(`/api/contests/${id}/leaderboard`)
            .then(res => {
                setLeaderboard(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [id]);

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Contest Leaderboard</h1>
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid #30363d', textAlign: 'left' }}>
                                <th style={{ padding: '1rem' }}>Rank</th>
                                <th style={{ padding: '1rem' }}>User</th>
                                <th style={{ padding: '1rem' }}>Solved</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leaderboard.map((entry, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #30363d' }}>
                                    <td style={{ padding: '1rem' }}>{index + 1}</td>
                                    <td style={{ padding: '1rem' }}>{entry.username}</td>
                                    <td style={{ padding: '1rem' }}>{entry.solvedCount}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}

export default Leaderboard;
