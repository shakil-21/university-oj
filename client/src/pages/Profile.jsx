import { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

function Profile() {
    const { username } = useParams();
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    // If no username param, try to load current user profile
    const targetUsername = username || user?.username;

    useEffect(() => {
        if (targetUsername) {
            axios.get(`/api/auth/profile/${targetUsername}`)
                .then(res => {
                    setProfile(res.data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, [targetUsername]);

    if (loading) return <div>Loading...</div>;
    if (!profile) return <div>User not found</div>;

    const getTierColor = (colorName) => {
        const colors = {
            'Gray': '#808080',
            'Bronze': '#CD7F32',
            'Silver': '#C0C0C0',
            'Yellow': '#E6C300',
            'Cyan': '#00CCCC',
            'Purple': '#800080',
            'Red': '#E60000',
            'Black': '#000000'
        };
        return colors[colorName] || '#808080';
    };

    return (
        <>
            <Navbar />
            <div className="container">
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                        <h1 style={{ margin: 0 }}>{profile.username}</h1>
                        {profile.tierDetails && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{
                                    backgroundColor: getTierColor(profile.tierDetails.color),
                                    color: (profile.tierDetails.color === 'Yellow' || profile.tierDetails.color === 'Cyan') ? '#000' : '#fff',
                                    padding: '4px 8px',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem'
                                }}>
                                    {profile.tierDetails.name}
                                </span>
                                <strong style={{ fontSize: '1.1rem', color: getTierColor(profile.tierDetails.color) }}>
                                    {profile.currentRating}
                                </strong>
                            </div>
                        )}
                    </div>
                    <p>Email: {profile.email}</p>
                    <p>Role: {profile.role}</p>
                    <p>Joined: {new Date(profile.createdAt).toLocaleDateString()}</p>

                    {/* Stats */}
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Statistics</h3>
                        <p>Solved Problems: {profile.solvedCount}</p>
                        <p>Total Submissions: {profile.totalSubmissions}</p>
                    </div>

                    {/* Recent Submissions */}
                    <div style={{ marginTop: '2rem' }}>
                        <h3>Recent Submissions</h3>
                        {profile.recentSubmissions && profile.recentSubmissions.length > 0 ? (
                            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
                                <thead>
                                    <tr style={{ background: '#161b22', textAlign: 'left' }}>
                                        <th style={{ padding: '0.5rem' }}>Problem ID</th>
                                        <th style={{ padding: '0.5rem' }}>Status</th>
                                        <th style={{ padding: '0.5rem' }}>Time</th>
                                        <th style={{ padding: '0.5rem' }}>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {profile.recentSubmissions.map(sub => (
                                        <tr key={sub._id} style={{ borderBottom: '1px solid #30363d' }}>
                                            <td style={{ padding: '0.5rem' }}>{sub.problemId}</td>
                                            <td style={{ padding: '0.5rem' }}>
                                                <span style={{
                                                    color: sub.status === 'AC' ? '#2ea043' :
                                                        sub.status === 'WA' ? '#da3633' :
                                                            '#d29922'
                                                }}>
                                                    {sub.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.5rem' }}>{new Date(sub.submittedAt).toLocaleTimeString()}</td>
                                            <td style={{ padding: '0.5rem' }}>{new Date(sub.submittedAt).toLocaleDateString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No submissions yet.</p>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Profile;
