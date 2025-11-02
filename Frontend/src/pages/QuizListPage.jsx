import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
// Import the icons
import { BsCodeSlash, BsWindowDesktop, BsDatabase } from 'react-icons/bs';
import { FaReact, FaNodeJs, FaJava } from 'react-icons/fa';

// Define our topics with their new icons and colors
const topics = [
  { 
    id: 'javascript', 
    name: 'JavaScript', 
    // ▼ CHANGE HERE: Smaller icon
    icon: <BsCodeSlash size={24} />,
    color: 'cyan' 
  },
  { 
    id: 'react', 
    name: 'React Fundamentals', 
    icon: <FaReact size={24} />,
    color: 'blue' 
  },
  { 
    id: 'datastructures', 
    name: 'Data Structures', 
    icon: <BsDatabase size={24} />,
    color: 'purple' 
  },
  { 
    id: 'java', 
    name: 'Java', 
    icon: <FaJava size={24} />,
    color: 'red'
  },
  { 
    id: 'nodejs', 
    name: 'Node.js', 
    icon: <FaNodeJs size={24} />,
    color: 'green'
  },
  { 
    id: 'system-design', 
    name: 'System Design', 
    icon: <BsWindowDesktop size={24} />,
    color: 'pink'
  },
];

// Helper function (no changes)
const getColorClasses = (color) => {
  switch (color) {
    case 'cyan':
      return {
        border: 'border-cyan-400',
        text: 'text-cyan-400',
        shadow: 'shadow-cyan-400/20',
        hoverShadow: 'hover:shadow-cyan-400/50',
      };
    case 'blue':
      return {
        border: 'border-blue-400',
        text: 'text-blue-400',
        shadow: 'shadow-blue-400/20',
        hoverShadow: 'hover:shadow-blue-400/50',
      };
    case 'purple':
      return {
        border: 'border-purple-400',
        text: 'text-purple-400',
        shadow: 'shadow-purple-400/20',
        hoverShadow: 'hover:shadow-purple-400/50',
      };
    case 'red':
      return {
        border: 'border-red-400',
        text: 'text-red-400',
        shadow: 'shadow-red-400/20',
        hoverShadow: 'hover:shadow-red-400/50',
      };
    case 'green':
      return {
        border: 'border-green-400',
        text: 'text-green-400',
        shadow: 'shadow-green-400/20',
        hoverShadow: 'hover:shadow-green-400/50',
      };
    case 'pink':
      return {
        border: 'border-pink-400',
        text: 'text-pink-400',
        shadow: 'shadow-pink-400/20',
        hoverShadow: 'hover:shadow-pink-400/50',
      };
    default:
      return {
        border: 'border-gray-400',
        text: 'text-gray-400',
        shadow: 'shadow-gray-400/20',
        hoverShadow: 'hover:shadow-gray-400/50',
      };
  }
};


function QuizListPage() {
  return (
    <div className="flex flex-col items-center min-h-screen w-full hero-background text-white p-6 md:p-12">
      <div className="w-full max-w-6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold text-white">
            Available Topics
          </h2>
          <p className="mt-2 text-lg md:text-xl text-gray-400">
            Select a topic to start your challenge.
          </p>
        </div>
        
        {/* ▼ CHANGE HERE: More columns by default, smaller gap */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          
          {topics.map((topic) => {
            const colors = getColorClasses(topic.color);
            
            return (
              <Link 
                key={topic.id} 
                to={`/quiz-list/${topic.id}`}
                className="block"
              >
                <motion.div
                  whileHover={{ y: -5 }} 
                  className={`
                    // ▼ CHANGE HERE: Smaller padding
                    p-4 h-full bg-gray-800/50 border rounded-xl 
                    transition-all duration-300
                    ${colors.border} ${colors.shadow} 
                    hover:shadow-2xl ${colors.hoverShadow}
                  `}
                >
                  <motion.div
                    whileHover={{ scale: 1.1, rotate: [0, 10, -10, 0] }}
                    className={`inline-block p-3 bg-gray-900 rounded-lg ${colors.text}`}
                  >
                    {topic.icon}
                  </motion.div>
                  
                  {/* ▼ CHANGE HERE: Smaller text */}
                  <h3 className={`mt-4 text-xl font-bold ${colors.text}`}>
                    {topic.name}
                  </h3>
                  {/* ▼ CHANGE HERE: Smaller text */}
                  <p className="mt-2 text-sm text-gray-400">
                    Problems on {topic.name}.
                  </p>
                </motion.div>
              </Link>
            );
          })}
        </div>
        
        {/* Navigation Link (no change) */}
        <div className="text-center mt-12 pt-6">
          <Link 
            to="/dpp" 
            className="
              py-3 px-8 text-gray-300 font-semibold text-lg
              bg-transparent border border-gray-600 rounded-lg
              transition-all duration-300
              hover:border-cyan-400 hover:text-cyan-400 
              hover:shadow-lg hover:shadow-cyan-400/40
            "
          >
            Back to Dashboard
          </Link>
        </div>
        
      </div>
    </div>
  );
}

export default QuizListPage;