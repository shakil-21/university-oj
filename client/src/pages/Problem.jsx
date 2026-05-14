import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import Editor from '@monaco-editor/react';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';

function Problem() {
    const { user } = useContext(AuthContext); // Get user from context
    const { id } = useParams();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const contestId = searchParams.get('contestId');
    const [problem, setProblem] = useState(null);
    const [code, setCode] = useState('// Write your C++ code here\n#include <iostream>\n\nint main() {\n    std::cout << "Hello World";\n    return 0;\n}');
    const [language, setLanguage] = useState('cpp');
    const [status, setStatus] = useState('');
    const [output, setOutput] = useState('');

    useEffect(() => {
        axios.get(`/api/problems/${id}`)
            .then(res => setProblem(res.data))
            .catch(err => console.error(err));
    }, [id]);

    const handleSubmit = async () => {
        if (!user) {
            alert('Please login to submit code');
            return;
        }
        setStatus('Submitting...');
        setOutput('');
        try {
            const res = await axios.post('/api/submissions', {
                problemId: id,
                contestId,
                code,
                language
            });
            const submissionId = res.data.submissionId;
            setStatus('Pending...');

            // Poll for status
            const intervalId = setInterval(async () => {
                try {
                    const pollRes = await axios.get(`/api/submissions/${submissionId}`);
                    const { status, output, executionTime, memoryUsed } = pollRes.data;

                    if (status !== 'Pending' && status !== 'Processing') {
                        clearInterval(intervalId);
                        setStatus(`Result: ${status}\nTime: ${executionTime}ms\nMemory: ${memoryUsed}KB`);
                        setOutput(output);
                    } else {
                        setStatus(`Status: ${status}...`);
                    }
                } catch (err) {
                    clearInterval(intervalId);
                    setStatus('Error checking status');
                    console.error(err);
                }
            }, 1000); // Poll every 1 second
        } catch (err) {
            setStatus('Error submitting code.');
            console.error(err);
        }
    };

    if (!problem) return <div>Loading...</div>;

    return (
        <>
            <Navbar />
            <div className="container">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    <div>
                        <h1>{problem.customId ? `${problem.customId}. ` : ''}{problem.title}</h1>
                        <div style={{ marginBottom: '1rem', color: '#8b949e', fontSize: '0.9rem' }}>
                            <span style={{ marginRight: '1rem' }}><strong>Time Limit:</strong> {problem.constraints?.timeLimit || 1000}ms</span>
                            <span><strong>Memory Limit:</strong> {problem.constraints?.memoryLimit || 256}MB</span>
                        </div>
                        <div className="card">
                            <p>{problem.description}</p>
                            <h4>Input Format</h4>
                            <p>{problem.inputFormat}</p>
                            <h4>Output Format</h4>
                            <p>{problem.outputFormat}</p>
                        </div>
                    </div>

                    <div>
                        <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                style={{ padding: '0.5rem', borderRadius: '4px', background: '#161b22', color: 'white', border: '1px solid #30363d' }}
                            >
                                <option value="cpp">C++</option>
                                <option value="py">Python</option>
                            </select>
                            <button className="btn btn-success" onClick={handleSubmit}>Submit Code</button>
                        </div>

                        <div className="editor-container">
                            <Editor
                                height="500px"
                                defaultLanguage="cpp"
                                language={language === 'cpp' ? 'cpp' : 'python'}
                                value={code}
                                theme="vs-dark"
                                onChange={(val) => setCode(val)}
                            />
                        </div>

                        {status && (
                            <div className="card">
                                <h4>Status</h4>

                                <pre style={{ fontWeight: 'bold', color: status.includes('AC') ? '#2ea043' : status.includes('WA') || status.includes('Error') ? '#da3633' : 'inherit' }}>
                                    {status}
                                </pre>
                                {output && (
                                    <div style={{ marginTop: '1rem', background: '#0d1117', padding: '0.5rem', borderRadius: '4px' }}>
                                        <strong>Output/Error:</strong>
                                        <pre style={{ whiteSpace: 'pre-wrap' }}>{output}</pre>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Problem;
