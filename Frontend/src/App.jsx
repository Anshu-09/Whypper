import { BrowserRouter, Routes, Route } from 'react-router-dom';

// 1. IMPORT YOUR NEW LAYOUT
import Layout from './Components/Layout';

// Import your page components
import Home from './pages/Home';
// import PracticeDashboard from './pages/PracticeDashboard';
import CustomQuizGenerator from './pages/CustomQuizGenerator';
import QuizListPage from './pages/QuizListPage';
import QuizPage from './pages/QuizPage';
import QuizResultsPage from './pages/QuizResultsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 2. SET UP THE LAYOUT ROUTE
          This parent route renders your <Layout /> component.
          All the nested routes will be rendered inside the <Outlet />
        */}
        <Route path="/" element={<Layout />}>
          {/* 'index' tells the router to render this component 
            when the path is exactly the parent's path ('/')
          */}
          <Route index element={<Home />} />
          
          {/* 3. NEST YOUR OTHER PAGES
            Note that the 'path' no longer needs a preceding '/'
            (e..g, 'dpp' instead of '/dpp')
          */}
           <Route path="dpp" element={<QuizListPage />} /> 
          <Route path="custom-quiz" element={<CustomQuizGenerator />} />
          <Route path="quiz-list" element={<QuizListPage />} />
          <Route path="quiz" element={<QuizPage />} />
          <Route path="quiz-results" element={<QuizResultsPage />} />
          
          {/* You'll also need a dynamic route for your quiz sets later */}
          {/* <Route path="quiz-list/:topicId" element={<QuizSetPage />} /> */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;