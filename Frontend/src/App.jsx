import { useState } from 'react';

// This is the main application component with corrected asynchronous logic.
function App() {
  const [topics, setTopics] = useState('');
  const [questions, setQuestions] = useState(null); // Renamed from 'response' for clarity
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ==============================================================================
  // NEW handleSubmit FUNCTION WITH POLLING LOGIC
  // ==============================================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setQuestions(null);

    // We'll store the polling interval ID here to clear it later
    let intervalId;

    try {
      // Step 1: Call /api/generate ONCE to start the job
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
      console.log('Job started with ID:', jobId);

      // Step 2: Start polling the /api/status endpoint every 5 seconds
      intervalId = setInterval(async () => {
        try {
          const statusResponse = await fetch(`/api/status/${jobId}`);
          
          if (!statusResponse.ok) {
            // If we can't even check the status, stop polling and show an error
            clearInterval(intervalId);
            setError('Error checking job status. Please refresh and try again.');
            setLoading(false);
            return;
          }

          const data = await statusResponse.json();

          if (data.status === 'completed') {
            clearInterval(intervalId); // CRITICAL: Stop polling on success
            setLoading(false);
            setQuestions(data.result); // Display the final result
            console.log('Job completed!', data.result);
          } else if (data.status === 'failed') {
            clearInterval(intervalId); // CRITICAL: Stop polling on failure
            setLoading(false);
            setError('The model failed to generate questions. Please try different topics.');
          }
          // If status is 'pending', we do nothing and let the interval run again.

        } catch (pollError) {
          clearInterval(intervalId);
          setLoading(false);
          setError('An error occurred while polling for results.');
        }
      }, 5000); // Poll every 5 seconds (5000 milliseconds)

    } catch (initialError) {
      // This catches errors from the very first '/api/generate' call
      setLoading(false);
      setError(initialError.message);
      if (intervalId) clearInterval(intervalId); // Clean up interval if it was somehow set
    }
  };


  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Medium':
        return 'bg-green-600';
      case 'Hard':
        return 'bg-orange-500';
      case 'Ultra Hard':
        return 'bg-red-600';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-lg shadow-xl overflow-hidden p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-teal-500">Question Generator</span>
        </h1>
        <p className="text-center text-gray-600 dark:text-gray-400">
          Enter a comma-separated list of topics (e.g., "JavaScript, Arrays, Algorithms") to generate a technical interview question set.
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
          <button
            type="submit"
            className="w-full flex items-center justify-center px-4 py-2 text-white bg-gradient-to-r from-blue-500 to-teal-500 rounded-lg shadow-lg hover:from-blue-600 hover:to-teal-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Generate Questions'
            )}
          </button>
        </form>

        {loading && (
          <div className="text-center p-4 text-gray-500 dark:text-gray-400">
            Generating questions, please wait... This may take a minute.
          </div>
        )}

        {error && (
          <div className="bg-red-500 text-white p-4 rounded-lg text-center">
            Error: {error}
          </div>
        )}

        {questions && (
          <div className="mt-8 space-y-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white text-center">Generated Question Set</h2>
            {Object.entries(questions).map(([difficulty, qList], index) => (
              <div key={index} className="space-y-4 p-6 border border-gray-200 dark:border-gray-700 rounded-lg shadow-md bg-gray-50 dark:bg-gray-700">
                <h3 className={`text-xl font-bold text-white p-2 rounded-md ${getDifficultyColor(difficulty)} text-center`}>
                  {difficulty}
                </h3>
                <div className="space-y-4">
                  {qList.map((q, qIndex) => (
                    <div key={qIndex} className="space-y-2 p-3 bg-gray-100 dark:bg-gray-600 rounded-md">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">
                        <span className="text-blue-500 dark:text-blue-300">{q.type}:</span> {q.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
