import { useState, useContext } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';

function CreateProblem() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const contestId = searchParams.get('contestId');
    const [formData, setFormData] = useState({
        customId: '',
        title: '',
        description: '',
        inputFormat: '',
        outputFormat: '',
        timeLimit: 1000,
        memoryLimit: 256,
        tags: '',
        difficulty: 'Medium',
        hint: '',
        source: '',
        testCases: [{ input: '', output: '' }]
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleTestCaseChange = (index, field, value) => {
        const newTestCases = [...formData.testCases];
        newTestCases[index][field] = value;
        setFormData({ ...formData, testCases: newTestCases });
    };

    const addTestCase = () => {
        setFormData({ ...formData, testCases: [...formData.testCases, { input: '', output: '' }] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                constraints: {
                    timeLimit: parseInt(formData.timeLimit),
                    memoryLimit: parseInt(formData.memoryLimit)
                },
                tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
                difficulty: formData.difficulty,
                hint: formData.hint,
                source: formData.source
            };
            if (contestId) {
                payload.contestId = contestId;
            }
            await axios.post('/api/problems', payload);
            alert('Problem created!');
            navigate('/');
        } catch (err) {
            alert('Error creating problem: ' + (err.response?.data?.error || err.message));
            console.error(err);
        }
    };

    if (!user || user.role !== 'admin') {
        return (
            <>
                <Navbar />
                <div className="container"><h2>Access Denied</h2></div>
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="container">
                <h1>{contestId ? 'Create Problem for Contest' : 'Create Problem'}</h1>
                <div className="card">
                    <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                            <input name="customId" placeholder="Problem ID (e.g. 1001)" value={formData.customId} onChange={handleChange} required style={inputStyle} />
                            <input name="title" placeholder="Title" value={formData.title} onChange={handleChange} required style={inputStyle} />
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <input type="number" name="timeLimit" placeholder="Time Limit (ms)" value={formData.timeLimit} onChange={handleChange} style={inputStyle} />
                            <input type="number" name="memoryLimit" placeholder="Memory Limit (MB)" value={formData.memoryLimit} onChange={handleChange} style={inputStyle} />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <select name="difficulty" value={formData.difficulty} onChange={handleChange} style={inputStyle}>
                                <option value="Easy">Easy</option>
                                <option value="Medium">Medium</option>
                                <option value="Hard">Hard</option>
                            </select>
                            <input name="tags" placeholder="Tags (comma separated, e.g. DP, Math)" value={formData.tags} onChange={handleChange} style={inputStyle} />
                        </div>

                        <input name="source" placeholder="Source / Author (Optional)" value={formData.source} onChange={handleChange} style={inputStyle} />
                        <textarea name="hint" placeholder="Hint (Optional)" value={formData.hint} onChange={handleChange} style={inputStyle} rows="2" />

                        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required style={inputStyle} rows="4" />
                        <textarea name="inputFormat" placeholder="Input Format" value={formData.inputFormat} onChange={handleChange} style={inputStyle} />
                        <textarea name="outputFormat" placeholder="Output Format" value={formData.outputFormat} onChange={handleChange} style={inputStyle} />

                        <h3>Test Cases</h3>
                        {formData.testCases.map((tc, index) => (
                            <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                                <textarea placeholder="Input" value={tc.input} onChange={(e) => handleTestCaseChange(index, 'input', e.target.value)} style={inputStyle} />
                                <textarea placeholder="Output" value={tc.output} onChange={(e) => handleTestCaseChange(index, 'output', e.target.value)} style={inputStyle} />
                            </div>
                        ))}
                        <button type="button" onClick={addTestCase} className="btn" style={{ background: '#30363d' }}>+ Add Test Case</button>
                        <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem' }}>Create Problem</button>
                    </form>
                </div>
            </div>
        </>
    );
}

const inputStyle = {
    padding: '0.8rem',
    background: '#0d1117',
    border: '1px solid #30363d',
    color: 'white',
    borderRadius: '4px',
    fontFamily: 'inherit'
};

export default CreateProblem;
