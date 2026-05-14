import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Register() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await register(username, email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Registration failed');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
                <div className="card">
                    <h2 style={{ textAlign: 'center' }}>Register</h2>
                    {error && (
                        <div style={{
                            background: 'rgba(218, 54, 51, 0.2)',
                            border: '1px solid #da3633',
                            color: '#f85149',
                            padding: '0.8rem',
                            borderRadius: '4px',
                            marginBottom: '1rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <input
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={{ padding: '0.8rem', background: '#0d1117', border: '1px solid #30363d', color: 'white', borderRadius: '4px' }}
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{ padding: '0.8rem', background: '#0d1117', border: '1px solid #30363d', color: 'white', borderRadius: '4px' }}
                        />
                        <input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={{ padding: '0.8rem', background: '#0d1117', border: '1px solid #30363d', color: 'white', borderRadius: '4px' }}
                        />
                        <button type="submit" className="btn btn-primary">Register</button>
                    </form>
                    <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                        Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Login</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Register;
