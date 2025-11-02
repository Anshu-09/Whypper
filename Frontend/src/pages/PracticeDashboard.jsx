import { Link } from 'react-router-dom';

function PracticeDashboard() {
  return (
    // 1. Main Container
    // We use the exact same classes as Home.js to get the background
    <div className="flex flex-col items-center justify-center min-h-screen text-white hero-background px-4 py-12">
      
      {/* 2. Centered Content Box */}
      {/* We use 'max-w-lg' to keep the menu card neat */}
      <div className="text-center w-11/12 max-w-lg">

        {/* 3. The Page-Specific Content */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
          Practice Dashboard
        </h1>
        
        <p className="text-lg md:text-xl text-gray-400 mb-10">
          Select your next challenge.
        </p>

        {/* 4. Button Container */}
        <div className="flex flex-col gap-6">

          {/* Button 1: View Quiz List (Solid) */}
          <Link to="/quiz-list">
            <button className="
              w-full py-3 px-8 text-black font-bold text-lg 
              bg-cyan-400 rounded-lg
              transition-all duration-300
              hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/40
              transform hover:-translate-y-0.5
            ">
              View Quiz List
            </button>
          </Link>

          {/* Button 2: Custom Quiz (Outline) */}
          <Link to="/custom-quiz">
            <button className="
              w-full py-3 px-8 text-gray-300 font-semibold text-lg
              bg-transparent border border-gray-600 rounded-lg
              transition-all duration-300
              hover:border-cyan-400 hover:text-cyan-400 
              hover:shadow-lg hover:shadow-cyan-400/40
              transform hover:-translate-y-0.5
            ">
              Custom Quiz Generator
            </button>
          </Link>

        </div>
      </div>
    </div>
  );
}

export default PracticeDashboard;