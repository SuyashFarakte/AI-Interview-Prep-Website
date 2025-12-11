import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuChevronLeft, LuChevronRight, LuCheck, LuVolume2, LuVolumeX, LuBot, LuMic, LuMicOff } from 'react-icons/lu';
import AnswerComparison from './AnswerComparison';
import ReportGenerator from './ReportGenerator';
import './InterviewSimulator.css';

const InterviewSimulator = ({ questions, sessionData, onExit }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [isReviewMode, setIsReviewMode] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [hasMicSupport, setHasMicSupport] = useState(true);
  const recognitionRef = useRef(null);

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  // Handle user answer input
  const handleAnswerChange = (e) => {
    setUserAnswers({
      ...userAnswers,
      [currentQuestionIndex]: e.target.value,
    });
  };

  // Move to next question
  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      // All questions answered, show report
      setShowReport(true);
    }
  };

  // Move to previous question
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const toggleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
      return;
    }
    try {
      setIsListening(true);
      recognitionRef.current.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  // Jump to specific question
  const jumpToQuestion = (index) => {
    setCurrentQuestionIndex(index);
  };

  // Calculate completion percentage
  const answeredCount = Object.keys(userAnswers).length;
  const completionPercentage = (answeredCount / totalQuestions) * 100;

  // Init speech recognition for mic input
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setHasMicSupport(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join(' ');
      setUserAnswers((prev) => ({
        ...prev,
        [currentQuestionIndex]: `${(prev[currentQuestionIndex] || '').trim()} ${transcript}`.trim(),
      }));
    };

    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
      recognitionRef.current = null;
    };
  }, [currentQuestionIndex]);

  // Speak the current question aloud
  const speakQuestion = () => {
    if (!currentQuestion?.question || typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentQuestion.question);
    utterance.rate = 0.96;
    utterance.pitch = 1;
    utterance.onend = () => setIsSpeaking(false);
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Stop speaking
  const stopSpeaking = () => {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      }
    };
  }, [currentQuestionIndex]);

  if (showReport) {
    return (
      <ReportGenerator
        questions={questions}
        userAnswers={userAnswers}
        sessionData={sessionData}
        onExit={onExit}
      />
    );
  }

  return (
    <div className="interview-simulator">
      {/* Header with progress */}
      <div className="interview-header">
        <div className="progress-info">
          <h2>Interview Simulation</h2>
          <p className="progress-text">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(currentQuestionIndex + 1) / totalQuestions * 100}%` }}
            ></div>
          </div>
        </div>
        <div className="completion-status">
          <div className="stat">
            <span className="stat-label">Answered:</span>
            <span className="stat-value">{answeredCount}/{totalQuestions}</span>
          </div>
          <div className="completion-ring">
            <svg viewBox="0 0 100 100" className="circular-progress">
              <circle
                className="background"
                cx="50"
                cy="50"
                r="45"
              ></circle>
              <circle
                className="progress"
                cx="50"
                cy="50"
                r="45"
                style={{
                  strokeDasharray: `${completionPercentage * 2.827}px`,
                }}
              ></circle>
            </svg>
            <span className="percentage">{Math.round(completionPercentage)}%</span>
          </div>
        </div>
      </div>

      {/* Main question display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQuestionIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="question-container"
        >
          <div className="interviewer-panel">
            <div className="interviewer-avatar">
              <LuBot className="interviewer-icon" />
            </div>
            <div className="interviewer-meta">
              <p className="interviewer-title">Interviewer</p>
              <p className="interviewer-line">"{currentQuestion?.question ? 'Let me ask you this...' : 'Loading question...'}"</p>
            </div>
            <div className="speech-controls">
              <button
                className="speak-btn"
                onClick={speakQuestion}
                disabled={isSpeaking}
              >
                <LuVolume2 size={18} />
                Play Question
              </button>
              {isSpeaking && (
                <button
                  className="speak-btn stop-btn"
                  onClick={stopSpeaking}
                >
                  <LuVolumeX size={18} />
                  Stop
                </button>
              )}
            </div>
          </div>

          {/* Question */}
          <div className="question-section">
            <h3 className="question-title">Question</h3>
            <p className="question-text">{currentQuestion.question}</p>
          </div>

          {/* Answer Input */}
          <div className="answer-input-section">
            <label htmlFor="userAnswer" className="answer-label">
              Your Answer
            </label>
            <textarea
              id="userAnswer"
              className="answer-textarea"
              placeholder="Type your answer here..."
              value={userAnswers[currentQuestionIndex] || ''}
              onChange={handleAnswerChange}
              rows="6"
            />
            <div className="mic-row">
              <button
                type="button"
                className="mic-btn"
                onClick={toggleMic}
                disabled={!hasMicSupport}
              >
                {isListening ? <LuMicOff size={16} /> : <LuMic size={16} />}
                {hasMicSupport ? (isListening ? 'Stop Mic' : 'Speak Answer') : 'Mic not supported'}
              </button>
              <p className="mic-hint">Speech input appends to your answer. Allow mic permission.</p>
            </div>
            <p className="character-count">
              {(userAnswers[currentQuestionIndex] || '').length} characters
            </p>
          </div>

          {/* Display AI Answer for reference (hidden by default) */}
          {isReviewMode && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="ai-answer-section"
            >
              <h3 className="ai-answer-title">AI Expected Answer</h3>
              <p className="ai-answer-text">{currentQuestion.answer}</p>
            </motion.div>
          )}

          {/* Toggle Review Button */}
          <button
            className="toggle-review-btn"
            onClick={() => setIsReviewMode(!isReviewMode)}
          >
            {isReviewMode ? 'Hide AI Answer' : 'Show AI Answer'}
          </button>
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="navigation-section">
        <button
          className="nav-btn prev-btn"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          <LuChevronLeft /> Previous
        </button>

        <div className="question-dots">
          {questions.map((_, index) => (
            <button
              key={index}
              className={`dot ${
                index === currentQuestionIndex ? 'active' : ''
              } ${userAnswers[index] ? 'answered' : ''}`}
              onClick={() => jumpToQuestion(index)}
              title={`Question ${index + 1} ${userAnswers[index] ? '(answered)' : ''}`}
            >
              {userAnswers[index] && <LuCheck size={12} />}
            </button>
          ))}
        </div>

        <button
          className="nav-btn next-btn"
          onClick={handleNext}
        >
          {currentQuestionIndex === totalQuestions - 1 ? (
            <>Generate Report</>
          ) : (
            <>Next <LuChevronRight /></>
          )}
        </button>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <button className="action-btn skip-btn" onClick={handleNext}>
          Skip Question
        </button>
        <button className="action-btn exit-btn" onClick={() => setShowReport(true)}>
          View Report / Exit
        </button>
      </div>
    </div>
  );
};

export default InterviewSimulator;
