import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

function Contest() {
    const { user } = useContext(AuthContext);
    const { id } = useParams();
    const [contest, setContest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [solvedProblems, setSolvedProblems] = useState(new Set());

    useEffect(() => {
        axios.get(`/api/contests/${id}`)
            .then(res => {
                setContest(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
            
        // Fetch solved problems to prevent crashing the check later
        axios.get('/api/auth/solved')
            .then(res => setSolvedProblems(new Set(res.data)))
            .catch(err => {
                // Ignore if not logged in
                if (err.response && err.response.status !== 401) {
                    console.error('Solved problems error:', err);
                }
            });
    }, [id]);

    if (loading) return (
        <>
            <Navbar />
            <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <p>Loading contest...</p>
            </div>
        </>
    );

    if (!contest) return (
        <>
            <Navbar />
            <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Contest not found</h2>
            </div>
        </>
    );

    const isUpcoming = new Date(contest.startTime) > new Date();
    const isRunning = new Date(contest.startTime) <= new Date() && new Date(contest.endTime) > new Date();
    const isEnded = new Date(contest.endTime) <= new Date();

    return (
        <>
            <Navbar />
            <div className="container">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h1>{contest.title}</h1>
                    <Link to={`/contest/${id}/leaderboard`} className="btn" style={{ background: '#30363d' }}>
                        View Leaderboard
                    </Link>
                </div>

                <div className="card">
                    <p style={{ whiteSpace: 'pre-wrap' }}>{contest.description || 'No description provided.'}</p>

                    <div style={{ marginTop: '1rem', display: 'grid', gridTemplateColumns: 'auto auto', gap: '1rem', justifyContent: 'start' }}>
                        <div>
                            <strong>Start:</strong> {new Date(contest.startTime).toLocaleString()}
                        </div>
                        <div>
                            <strong>End:</strong> {new Date(contest.endTime).toLocaleString()}
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <strong>Status: </strong>
                        {isUpcoming && <span style={{ color: '#d29922' }}>Upcoming</span>}
                        {isRunning && <span style={{ color: '#2ea043' }}>Running</span>}
                        {isEnded && <span style={{ color: '#da3633' }}>Ended</span>}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2rem' }}>
                    <h2>Problems</h2>
                    {user && user.role === 'admin' && (
                        <Link to={`/create-problem?contestId=${contest._id}`} className="btn btn-primary">
                            + Add New Problem
                        </Link>
                    )}
                </div>
                <div className="problem-list">
                    {contest.problems && contest.problems.length > 0 ? (
                        contest.problems.map((problem) => {
                            if (!problem) return null; // Skip if problem is null (e.g., deleted)
                            const isSolved = solvedProblems.has(problem._id);
                            return (
                                <div key={problem._id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: isSolved ? '5px solid #2ea043' : 'none' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <h3>{problem.title}</h3>
                                        {isSolved && <span style={{ background: '#2ea043', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Solved</span>}
                                    </div>
                                    <Link
                                        to={`/problem/${problem._id}?contestId=${contest._id}`}
                                        className="btn btn-primary"
                                    >
                                        Solve
                                    </Link>
                                </div>
                            );
                        })
                    ) : (
                        <p>No problems in this contest.</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default Contest;
