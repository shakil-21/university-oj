import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

function CreateContest() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startTime: '',
        endTime: ''
    });

    useEffect(() => {
        // Form initialization if necessary
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/contests', formData);
            alert('Contest created successfully!');
            navigate('/contests');
        } catch (err) {
            console.error(err);
            alert('Failed to create contest');
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <>
                <Navbar />
                <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>Access Denied</h2>
                    <p>You must be an admin to view this page.</p>
                </div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>Create Contest</h1>
                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div>
                            <label>Contest Title</label>
                            <input name="title" value={formData.title} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div>
                            <label>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} style={inputStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label>Start Time</label>
                                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleChange} required style={inputStyle} />
                            </div>
                            <div>
                                <label>End Time</label>
                                <input type="datetime-local" name="endTime" value={formData.endTime} onChange={handleChange} required style={inputStyle} />
                            </div>
                        </div>

                        {/* Problems will be natively created via the unified Contest UI later */}

                        <button type="submit" className="btn btn-primary">Create Contest</button>
                    </form>
                </div>
            </div>
        </>
    );
}

const inputStyle = {
    width: '100%',
    padding: '0.8rem',
    background: '#0d1117',
    border: '1px solid #30363d',
    color: 'white',
    borderRadius: '4px',
    marginTop: '0.5rem'
};

export default CreateContest;
