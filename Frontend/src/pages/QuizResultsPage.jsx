// src/pages/QuizResultsPage.js

import { useLocation, Link, Navigate } from 'react-router-dom';

function QuizResultsPage() {
  const location = useLocation();
  const state = location.state;

  // If no state is passed, redirect to the home page
  if (!state || state.score === undefined || state.total === undefined) {
    return <Navigate to="/" />;
  }

  const { score, total } = state;
  const percentage = Math.round((score / total) * 100);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white hero-background px-4 py-12">
      <div className="text-center w-11/12 max-w-lg p-10 bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg">
        
        <h1 className="text-2xl font-bold text-gray-300 mb-2">Quiz Complete!</h1>
        <h2 className="text-5xl font-bold text-cyan-400 mb-6">
          Your Score: {percentage}%
        </h2>
        <p className="text-xl text-gray-400 mb-10">
          You answered <strong>{score}</strong> out of <strong>{total}</strong> questions correctly.
        </p>

        <div className="flex flex-col gap-4">
          <Link to="/custom-quiz">
            <button className="w-full py-3 px-8 text-black font-bold text-lg bg-cyan-400 rounded-lg transition-all duration-300 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/40">
              Generate New Quiz
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default QuizResultsPage;