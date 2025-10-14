import { useState, useEffect } from 'react';
 
// ==============================================================================
// SVG Icon Components (for a professional look without external libraries)
// ==============================================================================
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 mr-2">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
  </svg>
);

const ListIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

const CodeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline>
    </svg>
);

const NetworkIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><path d="M12 12V8"></path>
    </svg>
);

const QuestionTypeIcon = ({ type }) => {
    switch(type) {
        case 'MCQ': return <ListIcon />;
        case 'Code Snippet': return <CodeIcon />;
        case 'DSA': return <NetworkIcon />;
        default: return null;
    }
};


// ==============================================================================
// Main Application Component
// ==============================================================================
function App() {
  const [topics, setTopics] = useState('');
  const [questions, setQuestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // State for progression
  const [unlockedDifficulties, setUnlockedDifficulties] = useState(['Medium']);
  const [activeTab, setActiveTab] = useState('Medium');
  const [unlockedQuestionIndex, setUnlockedQuestionIndex] = useState({ 'Medium': 0, 'Hard': 0, 'Ultra Hard': 0 });

  // State to manage smooth appearance of questions
  const [visibleQuestions, setVisibleQuestions] = useState({ 'Medium': [], 'Hard': [], 'Ultra Hard': [] });

  useEffect(() => {
    if (questions) {
      const newVisible = { ...visibleQuestions };
      const currentUnlocked = unlockedQuestionIndex[activeTab];
      
      // Filter questions that should be visible
      newVisible[activeTab] = questions[activeTab].filter((_, qIndex) => qIndex <= currentUnlocked);
      setVisibleQuestions(newVisible);
    }
  }, [unlockedQuestionIndex, activeTab, questions]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuestions(null);
    setUnlockedDifficulties(['Medium']);
    setActiveTab('Medium');
    setUnlockedQuestionIndex({ 'Medium': 0, 'Hard': 0, 'Ultra Hard': 0 });
    setVisibleQuestions({ 'Medium': [], 'Hard': [], 'Ultra Hard': [] });

    let intervalId;
    try {
      const generateResponse = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: topics }),
      });

      if (!generateResponse.ok) throw new Error((await generateResponse.json()).error || 'Failed to start job.');

      const { jobId } = await generateResponse.json();

      intervalId = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/status/${jobId}`);
          if (!statusResponse.ok) throw new Error('Error checking job status.');

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
          setError(pollError.message);
        }
      }, 5000);
    } catch (initialError) {
      setLoading(false);
      setError(initialError.message);
      if (intervalId) clearInterval(intervalId);
    }
  };
  
  const handleCompleteDifficulty = (difficulty) => {
    const nextDifficulty = { 'Medium': 'Hard', 'Hard': 'Ultra Hard' };
    const next = nextDifficulty[difficulty];
    if (next) {
      setUnlockedDifficulties(prev => [...prev, next]);
      setActiveTab(next);
    }
  };

  const handleUnlockNextQuestion = () => {
    if (unlockedQuestionIndex[activeTab] < questions[activeTab].length - 1) {
      setUnlockedQuestionIndex(prev => ({ ...prev, [activeTab]: prev[activeTab] + 1 }));
    }
  };

  const getDifficultyColor = (difficulty, type = 'text') => {
    const colors = {
      'Medium': { text: 'text-green-500', border: 'border-green-500', bg: 'bg-green-500', bg_hover: 'hover:bg-green-600' },
      'Hard': { text: 'text-orange-500', border: 'border-orange-500', bg: 'bg-orange-500', bg_hover: 'hover:bg-orange-600' },
      'Ultra Hard': { text: 'text-red-500', border: 'border-red-500', bg: 'bg-red-600', bg_hover: 'hover:bg-red-700' },
      'default': { text: 'text-gray-500', border: 'border-gray-500', bg: 'bg-gray-500', bg_hover: 'hover:bg-gray-600' }
    };
    return (colors[difficulty] || colors['default'])[type];
  };

  const allQuestionsInLevelUnlocked = questions && unlockedQuestionIndex[activeTab] === questions[activeTab].length - 1;

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 rounded-lg shadow-xl overflow-hidden p-6 md:p-8 space-y-8">
        <div className="text-center">
            <h1 className="text-4xl font-bold text-white">Tech Interview Prep</h1>
            <p className="text-gray-400 mt-2">Generate a question set and progress through the levels.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input type="text" value={topics} onChange={(e) => setTopics(e.target.value)} placeholder="Enter topics (e.g., 'JavaScript, Arrays')" className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-700 text-white placeholder-gray-400" disabled={loading} />
          <button type="submit" className="w-full flex items-center justify-center px-4 py-3 text-white font-semibold bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed" disabled={loading}>
            {loading ? <><svg className="animate-spin h-5 w-5 mr-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Generating...</span></> : 'Generate Questions'}
          </button>
        </form>

        {loading && <div className="text-center p-4 text-gray-400">This may take a minute. The AI is thinking...</div>}
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center"><strong>Error:</strong> {error}</div>}

        {questions && (
          <div className="mt-8 space-y-4 animate-fade-in">
            <div className="flex border-b border-gray-700">
              {Object.keys(questions).map((difficulty) => (
                <button key={difficulty} disabled={!unlockedDifficulties.includes(difficulty)} onClick={() => setActiveTab(difficulty)} className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 text-sm font-medium text-center transition-colors duration-200 focus:outline-none ${activeTab === difficulty ? `${getDifficultyColor(difficulty, 'bg')} text-white` : unlockedDifficulties.includes(difficulty) ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-600 cursor-not-allowed'}`}>
                  {!unlockedDifficulties.includes(difficulty) && <LockIcon />} {difficulty}
                </button>
              ))}
            </div>

            <div className="space-y-4 p-4">
              {visibleQuestions[activeTab]?.map((q, qIndex) => (
                <div key={qIndex} className="p-4 bg-gray-700 rounded-md animate-fade-in-up">
                  <p className="font-medium text-gray-200 flex items-center gap-3">
                    <span className={`flex-shrink-0 p-2 rounded-full bg-gray-800 ${getDifficultyColor(activeTab, 'text')}`}><QuestionTypeIcon type={q.type} /></span> 
                    <span>{q.text}</span>
                  </p>
                </div>
              ))}

              {questions[activeTab].map((q, qIndex) => (
                <div key={qIndex}>
                    {qIndex > unlockedQuestionIndex[activeTab] && (
                        <div className="p-4 bg-gray-700/50 border-2 border-dashed border-gray-600 rounded-md text-center text-gray-500 flex items-center justify-center">
                            <LockIcon /> Question Locked
                        </div>
                    )}
                </div>
              ))}
              
              {!allQuestionsInLevelUnlocked && (
                <button onClick={handleUnlockNextQuestion} className="w-full mt-2 px-4 py-2 text-sm text-white bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300">Reveal Next Question</button>
              )}
              
              {activeTab !== 'Ultra Hard' && allQuestionsInLevelUnlocked && (
                 <button onClick={() => handleCompleteDifficulty(activeTab)} className={`w-full mt-4 px-4 py-3 font-semibold text-white ${getDifficultyColor(activeTab, 'bg')} ${getDifficultyColor(activeTab, 'bg_hover')} rounded-lg shadow-lg transition-all duration-300`}>Complete {activeTab} & Proceed to Next Level</button>
              )}
              {activeTab === 'Ultra Hard' && allQuestionsInLevelUnlocked && (
                <div className="text-center p-4 mt-4 bg-green-500/20 border border-green-500 rounded-lg text-green-300 font-semibold">
                  🎉 Congratulations! You have completed all levels!
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

