import { Routes, Route } from 'react-router-dom';
import ProblemListPage from './pages/ProblemListPage';
import ProblemView from './pages/ProblemView';
import './App.css';

function App() {
  return (
    <div className="app-layout">
      <main className="main-content">
        <Routes>
          <Route path="/" element={<ProblemListPage />} />
          <Route path="/problems/:problemId" element={<ProblemView />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
