import { useState, useMemo } from 'react';
import CodeSnippet from './Components/Codesnippet.jsx';

// ==============================================================================
// SVG Icon Components
// ==============================================================================
const ListIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>;
const CodeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>;
const NetworkIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><path d="M12 12V8"></path></svg>;

// ==============================================================================
// Main Application Component
// ==============================================================================
function App() {
  const [language, setLanguage] = useState('java');
  const [topics, setTopics] = useState('');
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [userCode, setUserCode] = useState('');
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [quizState, setQuizState] = useState('idle');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const handleGenerate = async () => {
    if (!topics.trim()) return;
    
    setLoading(true);
    setError(null);
    setQuestions([]);
    setQuizState('loading');

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Language: ${language}, Topics: ${topics}`,
          language: language
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to start question generation.");
      }

      const { jobId } = await response.json();
      
      let jobCompleted = false;
      let attempts = 0;
      const maxAttempts = 60;
      
      while (!jobCompleted && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const statusResponse = await fetch(`/api/status/${jobId}`);
        if (!statusResponse.ok) {
          throw new Error("Failed to check job status.");
        }
        
        const statusData = await statusResponse.json();
        
        if (statusData.status === 'completed' && statusData.result) {
          const allQuestions = [
            ...(statusData.result.Medium || []),
            ...(statusData.result.Hard || []),
            ...(statusData.result['Ultra Hard'] || [])
          ];
          
          if (allQuestions.length === 0) {
            throw new Error("The AI returned an empty set of questions. Please try different topics.");
          }
          
          setQuestions(allQuestions); 
          setCurrentQuestionIndex(0);
          setScore(0);
          setSelectedAnswer(null);
          setUserCode('');
          setAnswerSubmitted(false);
          setIsCorrect(null);
          setQuizState('active');
          jobCompleted = true;
          
        } else if (statusData.status === 'failed') {
          throw new Error("Question generation failed. Please try again.");
        }
        
        attempts++;
      }
      
      if (!jobCompleted) {
        throw new Error("Question generation timed out. Please try again.");
      }

    } catch (err) {
      setError(err.message);
      setQuizState('idle');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmit = () => {
    const currentQuestion = questions[currentQuestionIndex];
    
    if (currentQuestion.type === 'MCQ') {
      if (selectedAnswer === null) {
        return;
      }
      
      const correctAnswerLetter = currentQuestion.answer.trim().charAt(0).toUpperCase();
      const selectedAnswerLetter = selectedAnswer.trim().charAt(0).toUpperCase();
      
      const correct = correctAnswerLetter === selectedAnswerLetter;
      setIsCorrect(correct);
      setAnswerSubmitted(true);
      
      if (correct) {
        setScore(score + 1);
      } else {
        setTimeout(() => {
          setQuizState('game-over');
        }, 1500);
        return;
      }
    } else {
      // For Code Snippet and DSA questions, just show the solution
      // In a real app, you'd validate the user's code against test cases
      setIsCorrect(true);
      setAnswerSubmitted(true);
      setScore(score + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setUserCode('');
      setAnswerSubmitted(false);
      setIsCorrect(null);
    } else {
      setQuizState('finished');
    }
  };

  const handleRestart = () => {
    setQuizState('idle');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setSelectedAnswer(null);
    setUserCode('');
    setAnswerSubmitted(false);
    setIsCorrect(null);
    setTopics('');
  };

  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-xl p-8 space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white">Tech Interview Quiz</h1>
          <p className="text-gray-400 mt-2">Answer questions correctly to unlock the next ones.</p>
        </div>

        {quizState === 'idle' && (
          <div className="space-y-4">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)} 
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="java">Java</option>
              <option value="javascript">JavaScript</option>
              <option value="python">Python</option>
            </select>
            <input 
              type="text" 
              value={topics} 
              onChange={(e) => setTopics(e.target.value)} 
              placeholder="Enter topics (e.g., 'loops, arrays')" 
              className="w-full px-4 py-3 border border-gray-600 rounded-lg bg-gray-700 text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !topics.trim()} 
              className="w-full px-4 py-3 text-white font-semibold bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Generating...' : 'Generate Quiz'}
            </button>
          </div>
        )}

        {loading && <div className="text-center p-4 text-gray-400">The AI is thinking...</div>}
        {error && <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg text-center"><strong>Error:</strong> {error}</div>}

        {quizState === 'active' && currentQuestion && (
          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-400 text-right mb-1">
                Question {currentQuestionIndex + 1} of {questions.length} | Score: {score}
              </p>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="p-6 bg-gray-700 rounded-lg space-y-4">
              {currentQuestion.type === 'Code Snippet' || currentQuestion.type === 'DSA' ? (
                <div>
                  <p className="font-medium text-lg text-gray-200 flex items-center gap-3 mb-3">
                    <span className="flex-shrink-0 p-2 rounded-full bg-gray-800 text-blue-400">
                      {currentQuestion.type === 'Code Snippet' ? <CodeIcon /> : <NetworkIcon />}
                    </span>
                    <span>{currentQuestion.text}</span>
                  </p>
                  
                  {!answerSubmitted ? (
                    <div className="space-y-3">
                      <div className="bg-gray-800 p-3 rounded-lg text-gray-300 text-sm">
                        <p className="italic">💡 Write your solution in the editor below. Click "Submit Answer" to see the expected solution.</p>
                      </div>
                      <CodeSnippet 
                        code={userCode || '// Write your code here...'} 
                        onChange={setUserCode}
                        readOnly={false}
                        language={language}
                      />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-green-900/30 border border-green-600 p-3 rounded-lg">
                        <p className="text-green-400 font-semibold">✓ Expected Solution:</p>
                      </div>
                      <CodeSnippet 
                        code={currentQuestion.answer || "// Solution"} 
                        readOnly={true}
                        language={language}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="font-medium text-lg text-gray-200 flex items-center gap-3 mb-4">
                    <span className="flex-shrink-0 p-2 rounded-full bg-gray-800 text-blue-400">
                      <ListIcon />
                    </span>
                    <span>{currentQuestion.text}</span>
                  </p>
                  
                  {currentQuestion.options?.map((option, index) => {
                    const optionLetter = option.charAt(0);
                    const isSelected = selectedAnswer === option;
                    const showFeedback = answerSubmitted;
                    const correctAnswer = currentQuestion.answer.charAt(0);
                    const isCorrectOption = optionLetter === correctAnswer;
                    
                    let optionClass = "flex items-center text-gray-300 p-3 rounded-lg border border-gray-600 cursor-pointer transition-all";
                    
                    if (showFeedback) {
                      if (isCorrectOption) {
                        optionClass = "flex items-center text-white p-3 rounded-lg border-2 border-green-500 bg-green-500/20";
                      } else if (isSelected && !isCorrect) {
                        optionClass = "flex items-center text-white p-3 rounded-lg border-2 border-red-500 bg-red-500/20";
                      } else {
                        optionClass = "flex items-center text-gray-400 p-3 rounded-lg border border-gray-600";
                      }
                    } else if (isSelected) {
                      optionClass = "flex items-center text-white p-3 rounded-lg border-2 border-blue-500 bg-blue-500/20";
                    } else {
                      optionClass += " hover:border-blue-400 hover:bg-gray-600/50";
                    }
                    
                    return (
                      <div key={index} className="mb-2">
                        <label className={optionClass}>
                          <input 
                            type="radio" 
                            name={`question-${currentQuestionIndex}`} 
                            value={option}
                            checked={isSelected}
                            onChange={(e) => !answerSubmitted && setSelectedAnswer(e.target.value)}
                            disabled={answerSubmitted}
                            className="mr-3 h-4 w-4 text-blue-500"
                          />
                          <span>{option}</span>
                        </label>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            <div className="flex justify-end gap-3">
              {!answerSubmitted ? (
                <button 
                  onClick={handleAnswerSubmit}
                  disabled={(currentQuestion.type === 'MCQ' && selectedAnswer === null) || 
                           ((currentQuestion.type === 'Code Snippet' || currentQuestion.type === 'DSA') && !userCode.trim())}
                  className="px-6 py-2 text-white font-semibold bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Answer
                </button>
              ) : (
                <button 
                  onClick={handleNextQuestion}
                  className="px-6 py-2 text-white font-semibold bg-green-600 rounded-lg shadow-lg hover:bg-green-700 transition-all"
                >
                  {currentQuestionIndex === questions.length - 1 ? 'Finish Quiz' : 'Next Question →'}
                </button>
              )}
            </div>
          </div>
        )}
        
        {quizState === 'finished' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">🎉</div>
            <h2 className="text-3xl font-bold text-white">Quiz Completed!</h2>
            <p className="text-xl text-gray-300">
              Your Score: <span className="font-bold text-green-400">{score}</span> / <span className="font-bold">{questions.length}</span>
            </p>
            <div className="text-lg text-gray-400">
              {score === questions.length ? "Perfect score! Outstanding! 🌟" : 
               score >= questions.length * 0.8 ? "Excellent work! 👏" :
               score >= questions.length * 0.6 ? "Good job! Keep practicing! 💪" :
               "Keep learning and try again! 📚"}
            </div>
            <button 
              onClick={handleRestart}
              className="px-6 py-3 text-white font-semibold bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all"
            >
              Start a New Quiz
            </button>
          </div>
        )}

        {quizState === 'game-over' && (
          <div className="text-center space-y-4">
            <div className="text-6xl">❌</div>
            <h2 className="text-3xl font-bold text-white">Game Over!</h2>
            <p className="text-xl text-gray-300">
              You got a question wrong. Your final score: <span className="font-bold text-red-400">{score}</span> / <span className="font-bold">{questions.length}</span>
            </p>
            <p className="text-gray-400">Better luck next time! Keep practicing! 💪</p>
            <button 
              onClick={handleRestart}
              className="px-6 py-3 text-white font-semibold bg-blue-600 rounded-lg shadow-lg hover:bg-blue-700 transition-all"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;