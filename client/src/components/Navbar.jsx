import { Link } from 'react-router-dom';
import { useContext } from 'react';
import AuthContext from '../context/AuthContext';

function Navbar() {
    const { user, logout } = useContext(AuthContext);

    return (
        <nav className="navbar">
            <div className="container navbar-content">
                <Link to="/" className="logo">University OJ</Link>
                <div>
                    <Link to="/contests" className="btn" style={{ marginRight: '1rem', background: 'transparent', border: '1px solid var(--border)' }}>Contests</Link>
                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <>
                                    <Link to="/create-problem" className="btn" style={{ marginRight: '0.5rem', background: '#2ea043' }}>+ Problem</Link>
                                    <Link to="/create-contest" className="btn" style={{ marginRight: '1rem', background: '#2ea043' }}>+ Contest</Link>
                                </>
                            )}
                            <Link to={`/profile/${user.username}`} style={{ marginRight: '1rem', color: 'inherit', textDecoration: 'none' }}>{user.username}</Link>
                            <button onClick={logout} className="btn" style={{ background: '#da3633' }}>Logout</button>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn" style={{ marginRight: '0.5rem', background: 'transparent', border: '1px solid var(--accent)' }}>Login</Link>
                            <Link to="/register" className="btn">Register</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
