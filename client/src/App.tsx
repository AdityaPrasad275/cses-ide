import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [code, setCode] = useState(`#include <iostream>

int main() {
    std::cout << "Hello, World!";
    return 0;
}`);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleRun = async () => {
    console.log('Running code:', code);
    // Mock running the code and setting output
    setOutput('Hello, World!'); 
  };

  const handleSubmit = async () => {
    console.log('Submitting code to backend:', code);
    try {
      const response = await fetch('http://localhost:3001/api/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      console.log('Received response from backend:', result);
      setOutput(`Server says: ${result.message}`);
    } catch (error) {
      console.error('Error submitting code to backend:', error);
      setOutput('Failed to connect to the backend. Is the server running?');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CSES IDE</h1>
      </header>
      <div className="main-content">
        <div className="problem-container">
          <h2>Problem Title</h2>
          <p>
            This is where the problem description will go. For now, it's just a placeholder.
            We'll fetch CSES problems later.
          </p>
        </div>
        <div className="editor-container">
          <Editor
            height="70vh"
            defaultLanguage="cpp"
            defaultValue={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
          />
          <div className="button-container">
            <button onClick={handleRun}>Run</button>
            <button onClick={handleSubmit}>Submit</button>
          </div>
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
}

export default App;
