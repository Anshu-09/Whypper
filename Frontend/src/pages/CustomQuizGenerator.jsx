import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; 

function CustomQuizGenerator() {
  // === 1. STATE MANAGEMENT ===
  // State for the form inputs
  const [language, setLanguage] = useState('JavaScript');
  const [topics, setTopics] = useState('');
  
  // State for the API job
  const [isLoading, setIsLoading] = useState(false);
  const [jobId, setJobId] = useState(null);
  const [error, setError] = useState(null);

  // 'useNavigate' is a hook from React Router to programmatically change pages
  const navigate = useNavigate();

  // === 2. POLLING EFFECT ===
  // This 'useEffect' hook runs ONLY when the 'jobId' or 'isLoading' state changes
  useEffect(() => {
    // If we aren't in a loading state or have no job, do nothing.
    if (!jobId || !isLoading) {
      return;
    }

    // Function to check the job status
    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/status/${jobId}`);
        if (!response.ok) {
          throw new Error('Failed to check job status');
        }
        const data = await response.json();

        if (data.status === 'completed') {
          // SUCCESS! The quiz is ready.
          setIsLoading(false);
          setJobId(null);
          // Navigate to the new '/quiz' page and pass the quiz data
          navigate('/quiz', { state: { quizData: data.result } });

        } else if (data.status === 'failed') {
          // FAILURE! The job failed on the backend.
          setIsLoading(false);
          setJobId(null);
          setError('Failed to generate quiz. The API might be down or the request timed out.');
        }
        // If status is 'pending', we do nothing and let the interval run again.

      } catch (err) {
        setIsLoading(false);
        setJobId(null);
        setError(err.message);
      }
    };

    // Start polling: check the status every 2 seconds (2000ms)
    const interval = setInterval(checkStatus, 2000);

    // This is a "cleanup" function. React runs this if the component
    // unmounts to prevent memory leaks.
    return () => clearInterval(interval);

  }, [jobId, isLoading, navigate]); // Dependencies for the effect

  // === 3. SUBMIT HANDLER ===
  const handleGenerateQuiz = async (e) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    setError(null);
    setJobId(null);

    try {
      // Call the backend endpoint to START the job
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: topics,
          language: language,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start generation job');
      }

      const data = await response.json();
      // Save the job ID. This will trigger the 'useEffect' to start polling.
      setJobId(data.jobId);

    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white hero-background px-4 py-12">
      <div className="text-center w-11/12 max-w-lg">
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Custom Quiz Generator
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Build your own personalized challenge.
        </p>

        {/* 4. THE FORM: We use 'onSubmit' for the form handler */}
        <form onSubmit={handleGenerateQuiz} className="flex flex-col gap-6 w-full">

          {/* Language Selector */}
          <select 
            className="w-full p-4 text-lg text-white font-medium bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            value={language} // Bind value to state
            onChange={(e) => setLanguage(e.target.value)} // Update state on change
            disabled={isLoading} // Disable while loading
          >
            <option className="bg-gray-900 text-lg">JavaScript</option>
            <option className="bg-gray-900 text-lg">Python</option>
            <option className="bg-gray-900 text-lg">Java</option>
          </select>

          {/* Topic Input */}
          <input
            type="text"
            placeholder="Enter topics (e.g., arrays, loops)"
            className="w-full p-4 text-lg text-white font-medium bg-gray-800 border border-gray-700 rounded-lg placeholder-gray-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400"
            value={topics} // Bind value to state
            onChange={(e) => setTopics(e.target.value)} // Update state on change
            disabled={isLoading} // Disable while loading
            required // Make the field required
          />

          {/* Generate Button (Solid) */}
          <button 
            type="submit" // Make this a submit button
            className={`
              w-full py-4 px-8 text-black font-bold text-lg rounded-lg transition-all duration-300
              transform
              ${isLoading 
                ? 'bg-gray-500 cursor-not-allowed' // Style for loading
                : 'bg-cyan-400 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/40 hover:-translate-y-0.5'
              }
            `}
            disabled={isLoading} // Disable button when loading
          >
            {isLoading ? 'Generating... (This can take a minute)' : 'Generate My Quiz'}
          </button>

          {/* Back Button (Subtle) */}
          <Link to="/dpp" className="w-full">
            <button 
              type="button" // Important: not a submit button
              className="w-full py-2 px-6 text-gray-400 font-medium bg-gray-800/30 rounded-lg transition-all duration-300 hover:bg-gray-700/50 hover:text-gray-200"
            >
              Back to Dashboard
            </button>
          </Link>
          
          {/* 5. ERROR MESSAGE */}
          {error && (
            <div className="p-4 bg-red-800/50 border border-red-600 text-red-200 rounded-lg">
              <strong>Error:</strong> {error}
            </div>
          )}

        </form>
      </div>
    </div>
  );
}

export default CustomQuizGenerator;