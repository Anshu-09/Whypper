import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

function Home() {
  return (
    // Main container - applies our custom background
    <div className="flex flex-col items-center justify-center min-h-screen text-white hero-background px-4 py-12">
      
      {/* Centered content box */}
      <div className="text-center max-w-3xl">

        {/* 1. The Floating Icon */}
        <motion.div
          // 'animate' defines the animation
          animate={{ y: [-3, 3, -3] }} // Moves up and down by 3 pixels
          // 'transition' defines how it animates
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: 'yoyo', // 'yoyo' makes it go back and forth
            ease: 'easeInOut'
          }}
          className="text-cyan-400 text-4xl font-mono mb-6"
        >
          {">_"}
        </motion.div>

        {/* 2. The Gradient Title */}
        <h1 className="text-5xl md:text-7xl font-bold my-4 gradient-text">
          Face the Final Boss of Coding.
        </h1>

        {/* 3. The Subtitle */}
        <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-xl mx-auto">
          Whypper generates AI-powered tech interview quizzes that push your limits.
        </p>

        {/* 4. The Buttons */}
        <div className="flex flex-col md:flex-row justify-center gap-6">

          {/* Button 1: Daily Practice (Solid) */}
          <Link to="/dpp">
            <button className="
              py-3 px-8 text-black font-bold text-lg 
              bg-cyan-400 rounded-lg
              transition-all duration-300
              hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/40
              transform hover:-translate-y-0.5
            ">
              Daily Practice Problems
            </button>
          </Link>

          {/* Button 2: Custom Quiz (Ghost/Outline) */}
          <Link to="/custom-quiz">
            <button className="
              py-3 px-8 text-gray-300 font-semibold text-lg
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

export default Home;