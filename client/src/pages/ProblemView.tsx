import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import '../App.css';

// Define the type for a problem
interface Problem {
  id: string;
  title: string;
  description: string;
  difficulty: string;
}

const ProblemView = () => {
  const { problemId } = useParams<{ problemId: string }>();
  const [problem, setProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState(`#include <iostream>
#include <vector>
#include <string>

int main() {
    // Your code here
    return 0;
}`);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(true); // Open by default

  useEffect(() => {
    if (problemId) {
      // Reset state when problem changes
      setProblem(null);
      setOutput('');
      setInput('');
      setCode(`#include <iostream>\n#include <vector>\n#include <string>\n\nint main() {\n    // Code for ${problemId}\n    return 0;
}`);

      fetch(`http://localhost:3001/api/problems/${problemId}`)
        .then(res => res.json())
        .then(data => setProblem(data))
        .catch(err => console.error("Failed to fetch problem:", err));
    }
  }, [problemId]);

  const handleRun = async () => {
    if (!problem) return;
    setOutput('Running...');
    //setIsConsoleOpen(true);
    try {
      const response = await fetch(`http://localhost:3001/api/run`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input }),
      });
      const result = await response.json();
      setOutput(result.output);
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('Failed to connect to the backend. Is the server running?');
    }
  };

  const handleSubmit = async () => {
    if (!problem) return;
    setOutput('Submitting...');
    try {
      const response = await fetch(`http://localhost:3001/api/submit/${problem.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      let submissionOutput = `Verdict: ${result.verdict}`;
      if (result.testCase) {
        submissionOutput += ` on test case ${result.testCase}`;
      }
      if (result.error) {
        submissionOutput += `\nError: ${result.error}`;
      }
      setOutput(submissionOutput);
    } catch (error) {
      console.error('Error submitting code:', error);
      setOutput('Failed to connect to the backend. Is the server running?');
    }
  };

  if (!problem) {
    return <div>Loading problem...</div>;
  }

  return (
    <div className="ide-layout">
      <div className="ide-toolbar">
        {/* <Link to="/">
          <button>Back to Home</button>
        </Link> */}
      </div>
      <div className="main-panes">
        <div className="problem-container">
          <div className="problem-header">
            <h2>{problem.title}</h2>
            <Link to="/">
              <button className="home-button">Home</button>
            </Link>
          </div>
          <p>{problem.description}</p>
        </div>
        <div className="editor-container">
          <div className="editor-toolbar">
            <div className="button-container">
              <button onClick={handleRun}>Run</button>
              <button onClick={handleSubmit}>Submit</button>
            </div>
          </div>
          <Editor
            height="100%"
            defaultLanguage="cpp"
            value={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        </div>
      </div>
      <div className="console-drawer open">
        <div className="console-content">
          <div className="io-container">
            <div className="input-area">
              <h3>Input</h3>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter input here..."
              />
            </div>
            <div className="output-area">
              <h3>Output</h3>
              <textarea
                value={output}
                readOnly
                placeholder="Output will be shown here..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProblemView;