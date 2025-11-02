// src/pages/QuizPage.js

import { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// --- Code Editor Imports ---
import CodeMirror from '@uiw/react-codemirror';
import { javascript } from '@codemirror/lang-javascript';
import { vscodeDark } from '@uiw/codemirror-theme-vscode';

// --- Icon Imports ---
import { BsCheckCircleFill, BsXCircleFill, BsClipboard, BsClipboardCheck } from 'react-icons/bs';

/**
 * Main Quiz Page Component
 */
function QuizPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const quizData = location.state?.quizData;

  // --- State Management ---
  
  // 1. Flatten all questions into a single array, memoized for performance
  const allQuestions = useMemo(() => {
    if (!quizData) return [];
    // Combine questions from all difficulty levels
    return [
      ...(quizData.Medium || []),
      ...(quizData.Hard || []),
      ...(quizData['Ultra Hard'] || []),
    ];
  }, [quizData]);

  // 2. Core quiz state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'Correct' or 'Wrong'

  // 3. State for user's answers
  const [selectedOption, setSelectedOption] = useState(null); // For MCQs
  const [codeAnswer, setCodeAnswer] = useState(''); // For Code/DSA

  // --- Derived State ---
  const currentQuestion = allQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === allQuestions.length - 1;

  // --- Event Handlers ---
  
  /**
   * Handles the 'Submit' button click.
   * Checks the answer, provides feedback, and updates the score.
   */
  const handleSubmit = () => {
    setShowAnswer(true);
    const correctAnswer = currentQuestion.answer;

    let isCorrect = false;
    
    if (currentQuestion.type === 'MCQ') {
      // For MCQ, check if the selected option letter (e.g., 'A') matches the answer
      if (selectedOption && selectedOption.startsWith(correctAnswer)) {
        isCorrect = true;
      }
    } else {
      // For Code/DSA, do a simple trim-based comparison
      // A real-world app would need a code execution sandbox
      if (codeAnswer.trim() === correctAnswer.trim()) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      setFeedback('Correct');
      setScore(score + 1);
    } else {
      setFeedback('Wrong');
    }
  };

  /**
   * Handles the 'Next Question' button click.
   * Moves to the next question or to the results page.
   */
  const handleNextQuestion = () => {
    if (isLastQuestion) {
      // Navigate to a results page (we'll create this next)
      navigate('/quiz-results', { state: { score: score, total: allQuestions.length } });
    } else {
      // Reset state for the next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowAnswer(false);
      setFeedback(null);
      setSelectedOption(null);
      setCodeAnswer(''); // Reset code editor
    }
  };

  // --- Error Handling (No Quiz Data) ---
  if (!quizData || allQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white hero-background px-4 py-12">
        <div className="text-center w-11/12 max-w-lg">
          <h1 className="text-3xl md:text-5xl font-bold text-red-400 mb-4">Error</h1>
          <p className="text-lg md:text-xl text-gray-400 mb-10">
            No quiz data found. Please generate a quiz first.
          </p>
          <Link to="/custom-quiz" className="w-full">
            <button className="w-full py-3 px-8 text-black font-bold text-lg bg-cyan-400 rounded-lg transition-all duration-300 hover:bg-cyan-300">
              Go to Generator
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Main Render ---
  return (
    <div className="flex flex-col items-center min-h-screen w-full hero-background text-white p-6 md:p-12">
      <div className="w-full max-w-4xl">
        
        {/* Header */}
        <h1 className="text-3xl md:text-5xl font-bold text-white mb-2 text-center gradient-text">
          Tech Interview Quiz
        </h1>
        <p className="text-lg md:text-xl text-gray-400 mb-8 text-center">
          Answer questions to test your limits.
        </p>

        {/* Progress Bar and Score */}
        <QuizProgress 
          current={currentQuestionIndex + 1} 
          total={allQuestions.length} 
          score={score} 
        />

        {/* Question Card */}
        <QuestionCard
          question={currentQuestion}
          onOptionChange={setSelectedOption}
          onCodeChange={setCodeAnswer}
          selectedOption={selectedOption}
          codeAnswer={codeAnswer}
          isDisabled={showAnswer} // Disable inputs after submission
        />

        {/* Feedback Box (appears after submit) */}
        <AnimatePresence>
          {showAnswer && (
            <FeedbackBox
              feedback={feedback}
              answer={currentQuestion.answer}
            />
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="flex justify-end mt-8">
          {!showAnswer ? (
            // SUBMIT BUTTON
            <button 
              onClick={handleSubmit}
              className="py-3 px-8 text-black font-bold text-lg bg-cyan-400 rounded-lg transition-all duration-300 hover:bg-cyan-300 hover:shadow-lg hover:shadow-cyan-400/40 transform hover:-translate-y-0.5"
            >
              Submit Answer
            </button>
          ) : (
            // NEXT QUESTION BUTTON
            <button 
              onClick={handleNextQuestion}
              className="py-3 px-8 text-black font-bold text-lg bg-green-500 rounded-lg transition-all duration-300 hover:bg-green-400 hover:shadow-lg hover:shadow-green-500/40 transform hover:-translate-y-0.5"
            >
              {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

// =================================================================
// SUB-COMPONENTS (All defined in the same file)
// =================================================================

/**
 * Displays the progress bar and score.
 */
function QuizProgress({ current, total, score }) {
  const progressPercent = (current / total) * 100;

  return (
    <div className="mb-6">
      {/* Score and Question Number */}
      <div className="flex justify-between items-center text-gray-300 mb-2">
        <span className="font-semibold">Question {current} of {total}</span>
        <span className="font-semibold text-cyan-400">Score: {score}</span>
      </div>
      {/* Progress Bar */}
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div 
          className="bg-cyan-400 h-2.5 rounded-full transition-all duration-300" 
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}

/**
 * Displays the current question, conditionally rendering
 * either MCQ options or a code editor.
 */
function QuestionCard({ question, onOptionChange, onCodeChange, selectedOption, codeAnswer, isDisabled }) {
  
  // State for the "Copied!" feedback
  const [copied, setCopied] = useState(false);

  // Copy to clipboard function
  const handleCopy = () => {
    // This is the iframe-safe method
    const ta = document.createElement('textarea');
    ta.value = codeAnswer;
    ta.style.position = 'absolute';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 1500); // Reset after 1.5s
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
    document.body.removeChild(ta);
  };
  
  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-xl shadow-lg p-6 md:p-8">
      {/* Question Text */}
      <p className="text-lg md:text-xl text-gray-200 leading-relaxed whitespace-pre-line mb-6">
        {question.text}
      </p>

      {/* Conditional Content: MCQ or Code */}
      {question.type === 'MCQ' && (
        <div className="flex flex-col gap-4">
          {question.options.map((option, index) => (
            <MCQOption
              key={index}
              optionText={option}
              isSelected={selectedOption === option}
              onSelect={() => onOptionChange(option)}
              isDisabled={isDisabled}
            />
          ))}
        </div>
      )}

      {(question.type === 'Code Snippet' || question.type === 'DSA') && (
        <div className="relative">
          {/* Copy Button */}
          <button 
            onClick={handleCopy}
            className="absolute top-2 right-2 z-10 p-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition-all"
            aria-label="Copy code"
          >
            {copied ? <BsClipboardCheck className="text-green-400" /> : <BsClipboard />}
          </button>
          
          <CodeMirror
            value={codeAnswer}
            height="300px"
            extensions={[javascript({ jsx: true })]}
            theme={vscodeDark}
            onChange={(value) => onCodeChange(value)}
            readOnly={isDisabled} // Make editor read-only after submit
            className="rounded-lg border border-gray-600"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Displays a single, clickable multiple-choice option.
 */
function MCQOption({ optionText, isSelected, onSelect, isDisabled }) {
  const letter = optionText.substring(0, 1); // e.g., "A"
  const text = optionText.substring(2); // e.g., ". 3"

  return (
    <button
      onClick={onSelect}
      disabled={isDisabled}
      className={`
        w-full p-4 border rounded-lg text-left transition-all duration-200
        flex items-center gap-4
        ${isDisabled ? 'cursor-not-allowed' : 'hover:bg-gray-700/50'}
        ${isSelected 
          ? 'bg-cyan-800/50 border-cyan-400' 
          : 'bg-gray-800 border-gray-700'
        }
      `}
    >
      <span className={`
        flex-shrink-0 w-8 h-8 rounded-full font-bold text-sm
        flex items-center justify-center
        ${isSelected
          ? 'bg-cyan-400 text-black'
          : 'bg-gray-700 text-gray-300'
        }
      `}>
        {letter}
      </span>
      <span className="text-gray-200">{text}</span>
    </button>
  );
}

/**
 * Displays the feedback ("Correct" / "Wrong") and the
 * correct answer after submission.
 */
function FeedbackBox({ feedback, answer }) {
  const isCorrect = feedback === 'Correct';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`
        mt-6 p-6 rounded-lg border
        ${isCorrect
          ? 'bg-green-800/30 border-green-500'
          : 'bg-red-800/30 border-red-500'
        }
      `}
    >
      <div className="flex items-center gap-3">
        {isCorrect ? (
          <BsCheckCircleFill className="text-green-400 text-2xl" />
        ) : (
          <BsXCircleFill className="text-red-400 text-2xl" />
        )}
        <h3 className="text-2xl font-bold">
          {isCorrect ? 'Correct!' : 'Wrong!'}
        </h3>
      </div>
      <p className="mt-4 text-gray-300 text-lg">
        The correct answer is:
      </p>
      <pre className="mt-2 p-4 bg-gray-900 rounded-md text-cyan-300 whitespace-pre-wrap break-words">
        {answer}
      </pre>
    </motion.div>
  );
}

export default QuizPage;