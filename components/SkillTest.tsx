import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Question } from '../types';
import { CheckCircle, Timer, ShieldAlert, X, AlertCircle, Sparkles, Fullscreen, Play } from './ui/Icons';

const TEST_DURATION_MINUTES = 15;
const NUMBER_OF_QUESTIONS = 20;
const MAX_CHEAT_ATTEMPTS = 3;

// --- Helper Functions ---
const shuffleArray = <T,>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const CAREER_MAP: { [key: string]: string } = {
  'Software Engineer': 'software-engineer',
  'Data Analyst / Scientist': 'data-analyst',
  'Cybersecurity Analyst': 'cybersecurity',
  'Cloud / DevOps Engineer': 'cloud-devops',
  'AI / Machine Learning Engineer': 'ai-ml',
};

// --- Sub-components ---
const StartScreen: React.FC<{ onStart: () => void; careerTitle: string | null }> = ({ onStart, careerTitle }) => (
    <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center"
        >
            <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Fullscreen className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Skill Test: {careerTitle}</h1>
            <p className="text-gray-500 mt-3">Ready to assess your skills? Please review the rules below.</p>
            
            <ul className="text-left space-y-3 my-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <li className="flex items-start gap-3">
                    <Timer className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <span>A <strong className="text-gray-800">{TEST_DURATION_MINUTES}-minute</strong> timer will begin once you start.</span>
                </li>
                 <li className="flex items-start gap-3">
                    <Fullscreen className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <span>The test must be completed in <strong className="text-gray-800">full-screen mode</strong>.</span>
                </li>
                <li className="flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                    <span>Switching tabs, copying, or exiting full-screen is prohibited. <strong className="text-red-700">3 violations</strong> will auto-submit the test.</span>
                </li>
            </ul>

            <button 
                onClick={onStart} 
                className="w-full flex items-center justify-center gap-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-600/20"
            >
                <Play className="w-5 h-5" />
                Start Secure Test
            </button>
        </motion.div>
    </div>
);


// --- Main Component ---
interface SkillTestProps {
  onComplete: (finalScore: number) => void;
  careerTitle: string | null;
}

const SkillTest: React.FC<SkillTestProps> = ({ onComplete, careerTitle }) => {
  const [testState, setTestState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [questionPool, setQuestionPool] = useState<{
    easy: Question[];
    medium: Question[];
    hard: Question[];
  }>({ easy: [], medium: [], hard: [] });
  
  const [testQuestions, setTestQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [answers, setAnswers] = useState<{ question: Question; selected: number; isCorrect: boolean }[]>([]);
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_MINUTES * 60);
  
  const [cheatAttempts, setCheatAttempts] = useState(0);
  const [cheatReason, setCheatReason] = useState('');
  const [showCheatWarning, setShowCheatWarning] = useState(false);

  const finishTest = useCallback(() => {
    if (document.fullscreenElement) {
        document.exitFullscreen().catch(err => console.error(err));
    }
    setTestState('finished');
  }, []);

  const handleCheatAttempt = useCallback((reason: string) => {
    if (testState !== 'running') return;
    setCheatReason(reason);
    setCheatAttempts(prev => {
      const newCount = prev + 1;
      if (newCount >= MAX_CHEAT_ATTEMPTS) {
        finishTest();
      }
      return newCount;
    });
    setShowCheatWarning(true);
  }, [testState, finishTest]);

  const getNextQuestion = useCallback((preferredDifficulty: 'easy' | 'medium' | 'hard') => {
    const pool = { ...questionPool };
    const difficultyOrder: ('easy' | 'medium' | 'hard')[] = [preferredDifficulty];
    if (preferredDifficulty === 'easy') difficultyOrder.push('medium', 'hard');
    else if (preferredDifficulty === 'medium') difficultyOrder.push('easy', 'hard');
    else difficultyOrder.push('medium', 'easy');

    for (const difficulty of difficultyOrder) {
      const qBank = pool[difficulty];
      if (qBank.length > 0) {
        const nextQuestion = qBank.shift();
        if (nextQuestion) {
          setQuestionPool(pool);
          return nextQuestion;
        }
      }
    }
    return null;
  }, [questionPool]);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    const mappedCareer = careerTitle ? CAREER_MAP[careerTitle] || 'software-engineer' : 'software-engineer';
    const fileName = `${mappedCareer}-questions.json`;
    
    try {
      const response = await fetch(`./data/${fileName}`);
      if (!response.ok) throw new Error(`Failed to load ${fileName}`);
      const data: Question[] = await response.json();
      
      const easy = shuffleArray(data.filter(q => q.difficulty === 'easy'));
      const medium = shuffleArray(data.filter(q => q.difficulty === 'medium'));
      const hard = shuffleArray(data.filter(q => q.difficulty === 'hard'));
      
      const initialPool = { easy, medium, hard };
      const firstQuestion = initialPool.medium.shift() || initialPool.easy.shift();
      
      if (firstQuestion) {
        setQuestionPool(initialPool);
        setTestQuestions([firstQuestion]);
      }
    } catch (err) {
      console.error('Error fetching questions:', err);
    } finally {
      setLoading(false);
    }
  }, [careerTitle]);

  const startTest = () => {
    document.documentElement.requestFullscreen().catch(err => {
      console.error(`Fullscreen error: ${err.message}`);
      alert('Fullscreen mode is required. Please enable it for this site.');
    });
    setTestState('running');
  };

  const resetTest = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(err => console.error(err));
    }
    setAnswers([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setTimeLeft(TEST_DURATION_MINUTES * 60);
    setCheatAttempts(0);
    setCheatReason('');
    setShowCheatWarning(false);
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

    const preventDefault = (e: Event) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'v'].includes(e.key)) {
        handleCheatAttempt('Shortcut used');
      }
    };
    const handleVisibilityChange = () => {
      if (document.hidden) handleCheatAttempt('Tab switched');
    };
    const handleFullscreenChange = () => {
        if (!document.fullscreenElement && testState === 'running') {
            handleCheatAttempt('Exited full-screen');
        }
    };

    document.addEventListener('contextmenu', preventDefault);
    document.addEventListener('copy', () => handleCheatAttempt('Copy attempted'));
    document.addEventListener('paste', () => handleCheatAttempt('Paste attempted'));
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      clearInterval(timer);
      document.removeEventListener('contextmenu', preventDefault);
      document.removeEventListener('copy', () => handleCheatAttempt('Copy attempted'));
      document.removeEventListener('paste', () => handleCheatAttempt('Paste attempted'));
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [testState, finishTest, handleCheatAttempt]);

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;
    
    const currentQuestion = testQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.answerIndex;
    
    setAnswers(prev => [...prev, { question: currentQuestion, selected: selectedAnswer, isCorrect }]);
    setSelectedAnswer(null);

    if (currentQuestionIndex < NUMBER_OF_QUESTIONS - 1) {
      const currentDifficulty = currentQuestion.difficulty;
      let nextDifficulty: 'easy' | 'medium' | 'hard' = currentDifficulty;
      if (isCorrect) nextDifficulty = currentDifficulty === 'easy' ? 'medium' : 'hard';
      else nextDifficulty = currentDifficulty === 'hard' ? 'medium' : 'easy';
      
      const nextQuestion = getNextQuestion(nextDifficulty);
      if (nextQuestion) {
        setTestQuestions(prev => [...prev, nextQuestion]);
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        finishTest();
      }
    } else {
      finishTest();
    }
  };
  
  const currentQuestion = useMemo(() => testQuestions[currentQuestionIndex], [testQuestions, currentQuestionIndex]);

  if (loading || !currentQuestion) {
    return <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin"></div></div>;
  }

  if (testState === 'idle') {
    return <StartScreen onStart={startTest} careerTitle={careerTitle} />;
  }

  if (testState === 'finished') {
    const finalScore = answers.reduce((score, ans) => {
        if (ans.isCorrect) {
          if (ans.question.difficulty === 'easy') return score + 1;
          if (ans.question.difficulty === 'medium') return score + 2;
          if (ans.question.difficulty === 'hard') return score + 3;
        }
        return score;
    }, 0);
    const totalPossibleScore = testQuestions.reduce((total, q) => {
      if (q.difficulty === 'easy') return total + 1;
      if (q.difficulty === 'medium') return total + 2;
      if (q.difficulty === 'hard') return total + 3;
      return total;
    }, 0);
    const accuracy = answers.length > 0 ? (answers.filter(a => a.isCorrect).length / answers.length) * 100 : 0;
    const difficultyData = ['easy', 'medium', 'hard'].map(level => ({
        name: level.charAt(0).toUpperCase() + level.slice(1),
        count: answers.filter(a => a.question.difficulty === level).length,
    }));
    const percentageScore = totalPossibleScore > 0 ? Math.round((finalScore / totalPossibleScore) * 100) : 0;

    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-2xl bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center my-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Test Completed!</h1>
          <p className="text-gray-500 mt-2">Here's your performance summary.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-8 text-left">
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">Final Score</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{finalScore} <span className="text-sm text-gray-400">/ {totalPossibleScore}</span></p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">Accuracy</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{accuracy.toFixed(0)}%</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs font-medium text-gray-500 uppercase">Time Taken</p>
              <p className="text-2xl font-bold text-primary-600 mt-1">{formatTime((TEST_DURATION_MINUTES * 60) - timeLeft)}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-100 mb-8">
            <h3 className="text-lg font-bold text-gray-900 mb-4 text-left">Difficulty Breakdown</h3>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={difficultyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{fill: '#6b7280', fontSize: 13}} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{fill: '#9ca3af', fontSize: 12}} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={resetTest} 
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-primary-100 text-primary-600 hover:bg-primary-50 font-semibold py-3.5 rounded-xl transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Retry Test
            </button>
            <button 
              onClick={() => onComplete(percentageScore)} 
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-primary-600/20"
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
    <div className="fixed inset-0 z-50 bg-gray-50 p-4 lg:p-8 flex flex-col no-select" style={{ userSelect: 'none' }}>
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">C</div>
          <h1 className="font-bold text-lg text-gray-900 hidden sm:block">{careerTitle || 'Skill'} Test</h1>
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
                className="bg-primary-600 h-2 rounded-full" 
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
            <p className={`text-xs font-semibold uppercase tracking-wider mb-4 ${
                currentQuestion.difficulty === 'easy' ? 'text-green-600' :
                currentQuestion.difficulty === 'medium' ? 'text-orange-500' : 'text-red-600'
            }`}>
                {currentQuestion.difficulty}
            </p>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-8">{currentQuestion.question}</h2>
            <div className="space-y-4">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedAnswer(index)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 text-gray-800 font-medium
                    ${selectedAnswer === index
                      ? 'bg-primary-50 border-primary-500 scale-105 shadow-md'
                      : 'bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                    }`}
                >
                  <span className="mr-3">{String.fromCharCode(65 + index)}.</span>
                  {option}
                </button>
              ))}
            </div>
            <button
              onClick={handleNextQuestion}
              disabled={selectedAnswer === null}
              className="mt-10 w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === NUMBER_OF_QUESTIONS - 1 ? 'Finish Test' : 'Next Question'}
            </button>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showCheatWarning && (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-red-600 text-white font-medium px-5 py-3 rounded-xl shadow-2xl"
            >
                <ShieldAlert className="w-5 h-5"/>
                Violation ({cheatReason}). Attempt {cheatAttempts}/{MAX_CHEAT_ATTEMPTS}.
                <button onClick={() => setShowCheatWarning(false)} className="ml-2 opacity-70 hover:opacity-100"><X className="w-5 h-5" /></button>
            </motion.div>
        )}
      </AnimatePresence>
      <style>{`.no-select { -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }`}</style>
    </div>
  );
};

export default SkillTest;