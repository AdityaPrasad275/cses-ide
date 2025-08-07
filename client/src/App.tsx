import { useState } from 'react';
import Editor from '@monaco-editor/react';
import './App.css';

function App() {
  const [code, setCode] = useState(`#include <iostream>
#include <vector>
#include <string>

int main() {
    std::cout << "Hello, World!";
    return 0;
}`);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  const handleRun = async () => {
    setOutput('Running...');
    try {
      const response = await fetch('http://localhost:3001/api/code', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
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
    // This can be changed later to run against official test cases.
    handleRun();
  };

  return (
    <div className="ide-layout">
      <div className="main-panes">
        <div className="problem-container">
          <h2>Problem: Missing Number</h2>
          <p>
            You are given all numbers between 1, 2, ..., n except one. Your task is to find the missing number.
          </p>
          <h3>Input</h3>
          <p>The first input line contains an integer n.</p>
          <p>The second line contains n-1 numbers. Each number is distinct and between 1 and n (inclusive).</p>
          <h3>Output</h3>
          <p>Print the missing number.</p>
        </div>
        <div className="editor-container">
          <Editor
            height="100%"
            defaultLanguage="cpp"
            defaultValue={code}
            onChange={(value) => setCode(value || '')}
            theme="vs-dark"
            options={{ minimap: { enabled: false } }}
          />
        </div>
      </div>
      <div className={`console-drawer ${isConsoleOpen ? 'open' : ''}`}>
        <div className="console-toolbar">
          <button onClick={() => setIsConsoleOpen(!isConsoleOpen)}>
            Console
          </button>
        </div>
        <div className="console-content">
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

