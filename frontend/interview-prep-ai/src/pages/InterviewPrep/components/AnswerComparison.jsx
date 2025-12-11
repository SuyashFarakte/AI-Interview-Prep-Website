import React from 'react';
import { motion } from 'framer-motion';
import { LuCheck, LuX, LuCircleAlert } from 'react-icons/lu';
import './AnswerComparison.css';

const AnswerComparison = ({ question, userAnswer, aiAnswer, feedback }) => {
  const isAnswerGood = feedback?.isComplete;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="answer-comparison"
    >
      {/* Question */}
      <div className="comparison-section question-section">
        <h3 className="section-title">Question</h3>
        <p className="section-content">{question}</p>
      </div>

      {/* Your Answer */}
      <div className="comparison-section your-answer-section">
        <div className="section-header">
          <h3 className="section-title">Your Answer</h3>
          <span className={`answer-status ${isAnswerGood ? 'good' : 'needs-work'}`}>
            {isAnswerGood ? (
              <>
                <LuCheck size={16} /> Complete
              </>
            ) : (
              <>
                <LuCircleAlert size={16} /> Needs Work
              </>
            )}
          </span>
        </div>
        <p className="section-content user-answer">{userAnswer}</p>
      </div>

      {/* AI Answer */}
      <div className="comparison-section ai-answer-section">
        <h3 className="section-title">Expected Answer (AI Reference)</h3>
        <p className="section-content ai-answer">{aiAnswer}</p>
      </div>

      {/* Feedback */}
      {feedback?.feedback && (
        <div className="comparison-section feedback-section">
          <h3 className="section-title">Feedback</h3>
          <p className="section-content feedback-text">{feedback.feedback}</p>
        </div>
      )}

      {/* Key Differences Highlight */}
      <div className="comparison-section insights-section">
        <h3 className="section-title">Key Points to Remember</h3>
        <ul className="insights-list">
          <li>Compare your answer with the expected answer above</li>
          <li>Check if you covered all main topics</li>
          <li>Look for any missing technical details</li>
          <li>Note the structure and clarity of the AI answer</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default AnswerComparison;
