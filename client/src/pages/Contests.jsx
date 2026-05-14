import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';

function Contests() {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        axios.get('/api/contests')
            .then(res => {
                setContests(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Contests</h1>
                {loading ? (
                    <p>Loading contests...</p>
                ) : contests.length === 0 ? (
                    <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
                        <h3>No Contests Found</h3>
                        <p>There are no active contests at the moment.</p>
                        <p>Check back later or ask an Admin to create one!</p>
                    </div>
                ) : (
                    <div className="problem-list">
                        {contests.map(contest => (
                            <div key={contest._id} className="card">
                                <h3>{contest.title}</h3>
                                <p>Start: {new Date(contest.startTime).toLocaleString()}</p>
                                <p>End: {new Date(contest.endTime).toLocaleString()}</p>
                                <Link to={`/contest/${contest._id}`} className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>
                                    Enter Contest
                                </Link>
                                <Link to={`/contest/${contest._id}/leaderboard`} className="btn" style={{ display: 'inline-block', marginTop: '1rem', marginLeft: '1rem', background: '#30363d' }}>
                                    Leaderboard
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}

export default Contests;
