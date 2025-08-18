import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface Problem {
  id: string;
  title: string;
  difficulty: string;
}

const ProblemListPage = () => {
  const [problems, setProblems] = useState<Problem[]>([]);

  useEffect(() => {
    fetch('http://localhost:3001/api/problems')
      .then(res => res.json())
      .then(data => setProblems(data))
      .catch(err => console.error("Failed to fetch problems:", err));
  }, []);

  return (
    <div>
      <h1>CSES Problem Set</h1>
      <p>Select a problem to start solving.</p>
      <div className="problem-list">
        {problems.map(problem => (
          <div className="problem-list-item" key={problem.id}>
            <Link to={`/problems/${problem.id}`}>
              <h3>{problem.title}</h3>
              <p>Difficulty: {problem.difficulty}</p>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProblemListPage;
