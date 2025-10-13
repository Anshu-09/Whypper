import { useState } from 'react';

// This is the main application component with the new difficulty and question progression system.
function App() {
  const [topics, setTopics] = useState('');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==============================================================================
  // STATE FOR PROGRESSION
  // ==============================================================================
  const [unlockedDifficulties, setUnlockedDifficulties] = useState(['Medium']);
  const [activeTab, setActiveTab] = useState('Medium');
  // NEW: State to track the index of the last unlocked question per difficulty
  const [unlockedQuestionIndex, setUnlockedQuestionIndex] = useState({
    'Medium': 0,
    'Hard': 0,
    'Ultra Hard': 0,
  });


  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuestions(null);
    // Reset all progression on new generation
    setUnlockedDifficulties(['Medium']);
    setActiveTab('Medium');
    setUnlockedQuestionIndex({ 'Medium': 0, 'Hard': 0, 'Ultra Hard': 0 });

    let intervalId;

    try {
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topics }),
      });

      if (!generateResponse.ok) {
        const errorData = await generateResponse.json();
        throw new Error(errorData.error || 'Failed to start the generation job.');
      }

      const { jobId } = await generateResponse.json();

      intervalId = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/status/${jobId}`);
          if (!statusResponse.ok) {
            clearInterval(intervalId);
            setError('Error checking job status.');
            setLoading(false);
            return;
          }

          const data = await statusResponse.json();

          if (data.status === 'completed') {
            clearInterval(intervalId);
            setLoading(false);
            setQuestions(data.result);
          } else if (data.status === 'failed') {
            clearInterval(intervalId);
            setLoading(false);
            setError('The model failed to generate questions. Please try different topics.');
          }
        } catch (pollError) {
          clearInterval(intervalId);
          setLoading(false);
          setError('An error occurred while polling for results.');
        }
      }, 5000);

    } catch (initialError) {
      setLoading(false);
      setError(initialError.message);
      if (intervalId) clearInterval(intervalId);
    }
  };
  
  const handleCompleteDifficulty = (difficulty) => {
    if (difficulty === 'Medium') {
      setUnlockedDifficulties(['Medium', 'Hard']);
      setActiveTab('Hard');
    } else if (difficulty === 'Hard') {
      setUnlockedDifficulties(['Medium', 'Hard', 'Ultra Hard']);
      setActiveTab('Ultra Hard');
    }
  };

  // ==============================================================================
  // NEW FUNCTION TO UNLOCK THE NEXT QUESTION
  // ==============================================================================
  const handleUnlockNextQuestion = () => {
    if (unlockedQuestionIndex[activeTab] < questions[activeTab].length - 1) {
        setUnlockedQuestionIndex(prev => ({
            ...prev,
            [activeTab]: prev[activeTab] + 1
        }));
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Medium': return 'border-green-500 text-green-500';
      case 'Hard': return 'border-orange-500 text-orange-500';
      case 'Ultra Hard': return 'border-red-500 text-red-500';
      default: return 'border-gray-500 text-gray-500';
    }
  };
  
  const getActiveTabColor = (difficulty) => {
    switch (difficulty) {
      case 'Medium': return 'bg-green-500 text-white';
      case 'Hard': return 'bg-orange-500 text-white';
      case 'Ultra Hard': return 'bg-red-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  // A helper variable to check if all questions in the current level are unlocked
  const allQuestionsInLevelUnlocked = questions && unlockedQuestionIndex[activeTab] === questions[activeTab].length - 1;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">Question Generator</span>
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Enter topics to generate a technical interview question set and progress through the levels.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            value={topics}
            onChange={(e) => setTopics(e.target.value)}
            placeholder="Enter topics (e.g., 'JavaScript, Arrays')"
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none dark:bg-gray-700 dark:text-white"
            disabled={loading}
          />
          <button type="submit" className="w-full flex items-center justify-center px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
            ) : ('Generate Questions')}
          </button>
        </form>

        {loading && <div className="text-center p-4 text-gray-500 dark:text-gray-400">Generating questions, please wait... This may take a minute.</div>}
        {error && <div className="bg-red-500 text-white p-4 rounded-lg text-center">Error: {error}</div>}

        {questions && (
          <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">Generated Question Set</h2>
            
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {Object.keys(questions).map((difficulty) => (
                <button
                  key={difficulty}
                  disabled={!unlockedDifficulties.includes(difficulty)}
                  onClick={() => setActiveTab(difficulty)}
                  className={`flex-1 py-2 px-4 text-sm font-medium text-center rounded-t-lg transition-colors duration-200 focus:outline-none ${
                    activeTab === difficulty
                      ? getActiveTabColor(difficulty)
                      : unlockedDifficulties.includes(difficulty)
                        ? 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                        : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  }`}
                >
                  {unlockedDifficulties.includes(difficulty) ? difficulty : `🔒 ${difficulty}`}
                </button>
              ))}
            </div>

            <div className="space-y-4 p-4 border border-t-0 border-gray-200 dark:border-gray-700 rounded-b-lg">
              {questions[activeTab].map((q, qIndex) => (
                <div key={qIndex}>
                    {/* --- NEW LOGIC: RENDER QUESTION OR LOCKED PLACEHOLDER --- */}
                    {qIndex <= unlockedQuestionIndex[activeTab] ? (
                        <div className="p-3 bg-gray-100 dark:bg-gray-600 rounded-md space-y-3">
                            <p className="font-semibold text-gray-800 dark:text-gray-100">
                                <span className={`font-bold ${getDifficultyColor(activeTab)}`}>{q.type}:</span> {q.text}
                            </p>
                            {/* NEW: Show button only on the last unlocked question */}
                            {qIndex === unlockedQuestionIndex[activeTab] && !allQuestionsInLevelUnlocked && (
                                <button
                                    onClick={handleUnlockNextQuestion}
                                    className="w-full mt-2 px-4 py-2 text-sm text-white bg-blue-500 rounded-lg shadow-lg hover:bg-blue-600 transition-all duration-300"
                                >
                                    Reveal Next Question
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="p-3 bg-gray-200 dark:bg-gray-700 rounded-md text-center text-gray-500 dark:text-gray-400">
                            🔒 Question Locked
                        </div>
                    )}
                </div>
              ))}
              
              {/* --- UPDATED BUTTON TO COMPLETE THE LEVEL --- */}
              {activeTab !== 'Ultra Hard' && unlockedDifficulties.includes(activeTab) && allQuestionsInLevelUnlocked && (
                 <button 
                   onClick={() => handleCompleteDifficulty(activeTab)}
                   className="w-full mt-4 px-4 py-2 text-white bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 focus:outline-none"
                 >
                   Complete {activeTab} & Proceed
                 </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

