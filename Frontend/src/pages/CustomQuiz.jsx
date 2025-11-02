import { Link } from 'react-router-dom';
// import { useState } from 'react'; 

function CustomQuizGenerator() {
  
  // const [language, setLanguage] = useState('javascript');
  // const [topics, setTopics] = useState('');

  return (
    // 1. Main Container
    <div className="flex flex-col items-center justify-center min-h-screen text-white hero-background px-4 py-12">
      
      {/* 2. Centered Content Box */}
      <div className="text-center w-11/12 max-w-lg">

        {/* 3. The Page-Specific Content */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Custom Quiz Generator
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Build your own personalized challenge.
        </p>

        {/* 4. The Form */}
        <div className="flex flex-col gap-6 w-full">

          {/* Language Selector */}
          <select 
            className="
              w-full p-4 text-lg text-white font-medium
              bg-gray-800 border border-gray-700 rounded-lg
              focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
            "
            // value={language}
            // onChange={(e) => setLanguage(e.target.value)}
          >
            <option className="bg-gray-900 text-lg">JavaScript</option>
            <option className="bg-gray-900 text-lg">Python</option>
            <option className="bg-gray-900 text-lg">Java</option>
          </select>

          {/* Topic Input */}
          <input
            type="text"
            placeholder="Enter topics (e.g., arrays, loops)"
            className="
              w-full p-4 text-lg text-white font-medium
              bg-gray-800 border border-gray-700 rounded-lg
              placeholder-gray-500
              focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400
            "
            // value={topics}
            // onChange={(e) => setTopics(e.target.value)}
          />

          {/* Generate Button (Solid) */}
          <button className="
            w-full py-4 px-8 text-black font-bold text-lg 
            bg-cyan-400 rounded-lg
            transition-all duration-300
            hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/40
            transform hover:-translate-y-0.5
          ">
            Generate My Quiz
          </button>

          {/* Back Button (Subtle) */}
          <Link to="/dpp" className="w-full">
            <button className="
              w-full py-2 px-6 text-gray-400 font-medium
              bg-gray-800/30 rounded-lg
              transition-all duration-300
              hover:bg-gray-700/50 hover:text-gray-200
            ">
              Back to Dashboard
            </button>
          </Link>
          
        </div>
      </div>
    </div>
  );
}

export default CustomQuizGenerator;