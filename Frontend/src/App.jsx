import { useState, useMemo } from 'react';
import CodeSnippet from './pages/Codesnippet.jsx';
import {BrowserRouter , Routes , Route } from 'react-router-dom';

import Home from './pages/Home'; //importing all the page components
import PracticeDashboard from './pages/PracticeDashboard';
import QuizListPage from './pages/QuizListPage';
import CustomQuiz from './pages/CustomQuiz';
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
  

  return ( // BrowserRouter is the component that handles all the routing 
    <BrowserRouter>
      {/* 'Routes' is a wrapper that holds all your individual page routes. */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dpp" element={<PracticeDashboard />} />
        <Route path="/quiz-list" element={<QuizListPage />} />
        <Route path="/custom-quiz" element={<CustomQuiz />} />
        {/* <Route path="/quiz-list/:topicId" element={<QuizSetPage />} />
           */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;