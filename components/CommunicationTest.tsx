import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../types';
import { CheckCircle, Timer, X, Sparkles, Play, MessageSquare } from './ui/Icons';

const TEST_DURATION_MINUTES = 5;
const NUMBER_OF_QUESTIONS = 5;

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const StartScreen: React.FC<{ onStart: () => void; }> = ({ onStart }) => (
    <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center"
        >
            <div className="w-16 h-16 bg-sky-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-8 h-8 text-sky-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Communication Skills Test</h1>
            <p className="text-gray-500 mt-3">Assess your professional communication skills with these situational questions.</p>
            
            <ul className="text-left space-y-3 my-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <li className="flex items-start gap-3">
                    <Timer className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <span>A <strong className="text-gray-800">{TEST_DURATION_MINUTES}-minute</strong> timer will begin once you start.</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <span>There are <strong className="text-gray-800">{NUMBER_OF_QUESTIONS} multiple-choice</strong> questions.</span>
                </li>
            </ul>

            <button 
                onClick={onStart} 
                className="w-full flex items-center justify-center gap-3 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-600/20"
            >
                <Play className="w-5 h-5" />
                Start Test
            </button>
        </motion.div>
    </div>
);


interface CommunicationTestProps {
  onComplete: (finalScore: number) => void;
}

const CommunicationTest: React.FC<CommunicationTestProps> = ({ onComplete }) => {
  const [testState, setTestState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ question: Question; selected: number; isCorrect: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MINUTES * 60);

  const finishTest = useCallback(() => {
    setTestState('finished');
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`./data/communication-questions.json`);
      if (!response.ok) throw new Error(`Failed to load questions`);
      const data = await response.json();
      setQuestions(data);
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const startTest = () => setTestState('running');
  
  const resetTest = () => {
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTimeLeft(TEST_DURATION_MINUTES * 60);
    setTestState('idle');
    loadQuestions();
  };

  useEffect(() => { loadQuestions() }, [loadQuestions]);

  useEffect(() => {
    if (testState !== 'running') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testState, finishTest]);

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answerIndex;
    
    setAnswers(prev => [...prev, { question: currentQuestion, selected: selectedAnswer, isCorrect }]);
    setSelectedAnswer(null);

    if (currentQuestionIndex < NUMBER_OF_QUESTIONS - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      finishTest();
    }
  };
  
  const currentQuestion = useMemo(() => questions[currentQuestionIndex], [questions, currentQuestionIndex]);

  if (loading || !currentQuestion) {
    return <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-sky-600 rounded-full animate-spin"></div></div>;
  }

  if (testState === 'idle') {
    return <StartScreen onStart={startTest} />;
  }

  if (testState === 'finished') {
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const percentageScore = (correctAnswers / NUMBER_OF_QUESTIONS) * 100;

    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center my-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Test Completed!</h1>
          <p className="text-gray-500 mt-2">Here's your communication skill summary.</p>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 my-8">
              <p className="text-sm font-medium text-gray-500 uppercase">Final Score</p>
              <p className="text-4xl font-bold text-sky-600 mt-2">{percentageScore.toFixed(0)}%</p>
              <p className="text-gray-500 mt-1">You answered {correctAnswers} out of {NUMBER_OF_QUESTIONS} questions correctly.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={resetTest} 
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-sky-100 text-sky-600 hover:bg-sky-50 font-semibold py-3.5 rounded-xl transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Retry Test
            </button>
            <button 
              onClick={() => onComplete(percentageScore)} 
              className="flex-1 bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-sky-600/20"
            >
              Return to Roadmap
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  const progress = (currentQuestionIndex / NUMBER_OF_QUESTIONS) * 100;
  
  return (
    <div className="fixed inset-0 z-50 bg-gray-50 p-4 lg:p-8 flex flex-col">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sky-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"><MessageSquare size={16}/></div>
          <h1 className="font-bold text-lg text-gray-900 hidden sm:block">Communication Test</h1>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-200">
          <Timer className="w-5 h-5 text-gray-400" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>
      
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Progress</span>
            <span>Question {currentQuestionIndex + 1} of {NUMBER_OF_QUESTIONS}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
                className="bg-sky-600 h-2 rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-3xl bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 my-4"
          >
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-8">{currentQuestion.question}</h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-gray-800 font-medium
                    ${selectedAnswer === index
                      ? 'bg-sky-50 border-sky-500 scale-105 shadow-md'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-3 font-bold">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="mt-10 w-full bg-sky-600 hover:bg-sky-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-sky-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === NUMBER_OF_QUESTIONS - 1 ? 'Finish Test' : 'Next Question'}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CommunicationTest;
