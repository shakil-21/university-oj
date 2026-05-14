import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import Navbar from '../components/Navbar';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await login(email, password);
            navigate('/');
        } catch (err) {
            setError(err.response?.data?.error || 'Login failed');
        }
    };

    return (
        <>
            <Navbar />
            <div className="container" style={{ maxWidth: '400px', marginTop: '50px' }}>
                <div className="card">
                    <h2 style={{ textAlign: 'center' }}>Login</h2>
                    {error && <p style={{ color: 'var(--error)' }}>{error}</p>}
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
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
                        <button type="submit" className="btn btn-primary">Login</button>
                    </form>
                    <p style={{ marginTop: '1rem', textAlign: 'center' }}>
                        Don't have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register</Link>
                    </p>
                </div>
            </div>
        </>
    );
}

export default Login;
