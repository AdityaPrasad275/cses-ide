import { useState } from 'react';
import './App.css';

function App() {
  // useState is a React Hook. It lets us store and manage data in our component.
  // Here, 'code' will hold the text from the textarea.
  // 'setCode' is the function we use to update it.
  const [code, setCode] = useState(`#include <iostream>

int main() {
    std::cout << "Hello, World!";
    return 0;
}`);

  // This function will be called when the "Run" button is clicked.
  const handleSubmit = async () => {
    console.log('Sending code to backend:', code);

    try {
      // 'fetch' is the browser API we use to make network requests.
      // We're sending a request to our backend's /api/code endpoint.
      const response = await fetch('http://localhost:3001/api/code', {
        // 'method' specifies the type of request. We use POST because we are sending data.
        method: 'POST',
        // 'headers' tell the server what kind of data we're sending.
        headers: {
          'Content-Type': 'application/json',
        },
        // 'body' is the actual data we're sending. We use JSON.stringify
        // to convert our JavaScript object into a JSON string.
        body: JSON.stringify({ code }),
      });

      // We wait for the server's response and convert it from JSON.
      const result = await response.json();

      // We log the server's response to the browser's developer console.
      console.log('Received response from backend:', result);
      alert(`Server says: ${result.message}`);

    } catch (error) {
      console.error('Error sending code to backend:', error);
      alert('Failed to connect to the backend. Is the server running?');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>CSES IDE</h1>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          rows={15}
          cols={80}
          style={{ backgroundColor: '#282c34', color: 'white', fontSize: '16px' }}
        />
        <button onClick={handleSubmit} style={{ marginTop: '10px' }}>
          Run Code
        </button>
      </header>
    </div>
  );
}

export default App;