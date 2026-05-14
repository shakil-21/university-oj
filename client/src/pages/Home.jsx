import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

function Home() {
    const { user } = useContext(AuthContext);
    const [problems, setProblems] = useState([]);
    const [solvedProblems, setSolvedProblems] = useState(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const problemsRes = await axios.get('/api/problems');
                setProblems(problemsRes.data);

                if (user) {
                    const solvedRes = await axios.get('/api/auth/solved');
                    setSolvedProblems(new Set(solvedRes.data));
                }
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchData();
    }, [user]);

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Problems</h1>
                {loading ? (
                    <p>Loading problems...</p>
                ) : (
                    <div className="problem-list">
                        {problems.map(problem => {
                            const isSolved = solvedProblems.has(problem._id);
                            return (
                                <Link to={`/problem/${problem._id}`} key={problem._id} className="card problem-item" style={isSolved ? { borderLeft: '5px solid #2ea043' } : {}}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <h3>{problem.customId ? `${problem.customId}. ` : ''}{problem.title}</h3>
                                            <span style={{
                                                padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', border: '1px solid',
                                                borderColor: problem.difficulty === 'Easy' ? '#2ea043' : problem.difficulty === 'Medium' ? '#d29922' : '#da3633',
                                                color: problem.difficulty === 'Easy' ? '#2ea043' : problem.difficulty === 'Medium' ? '#d29922' : '#da3633'
                                            }}>
                                                {problem.difficulty}
                                            </span>
                                            {problem.tags && problem.tags.map(tag => (
                                                <span key={tag} style={{ background: '#30363d', color: '#c9d1d9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem' }}>{tag}</span>
                                            ))}
                                        </div>
                                        {isSolved && <span style={{ background: '#2ea043', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>Solved</span>}
                                    </div>
                                    <span className="btn btn-sm">Solve</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
                {problems.length === 0 && !loading && (
                    <p>No problems found. Run the seeder or create one!</p>
                )}
            </div>
        </>
    );
}

export default Home;
