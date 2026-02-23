import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HrQuestion } from '../types';
import { CheckCircle, X, Sparkles, Play, UserCheck, ChevronRight } from './ui/Icons';

const StartScreen: React.FC<{ onStart: () => void; }> = ({ onStart }) => (
    <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center"
        >
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <UserCheck className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">HR Round Practice</h1>
            <p className="text-gray-500 mt-3">Prepare for behavioral questions by formulating your own answers.</p>
            
            <ul className="text-left space-y-3 my-8 bg-gray-50 p-6 rounded-xl border border-gray-100">
                <li className="flex items-start gap-3">
                    <Sparkles className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <span>You will be presented with 5 common HR interview questions.</span>
                </li>
                 <li className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-gray-500 mt-0.5 shrink-0" />
                    <span>Type your answers to practice. There is no time limit for this exercise.</span>
                </li>
            </ul>

            <button 
                onClick={onStart} 
                className="w-full flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
                <Play className="w-5 h-5" />
                Start Practice
            </button>
        </motion.div>
    </div>
);


interface HrRoundProps {
  onComplete: () => void;
}

const HrRound: React.FC<HrRoundProps> = ({ onComplete }) => {
  const [testState, setTestState] = useState<'idle' | 'running' | 'finished'>('idle');
  const [questions, setQuestions] = useState<HrQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>(Array(5).fill(''));
  const [currentAnswer, setCurrentAnswer] = useState('');

  const finishTest = useCallback(() => {
    setTestState('finished');
  }, []);

  const loadQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(`./data/hr-round-questions.json`);
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
    setCurrentQuestionIndex(0);
    setUserAnswers(Array(5).fill(''));
    setCurrentAnswer('');
    setTestState('idle');
    loadQuestions();
  };

  useEffect(() => { loadQuestions() }, [loadQuestions]);
  
  const handleNextQuestion = () => {
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = currentAnswer;
    setUserAnswers(updatedAnswers);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setCurrentAnswer(updatedAnswers[currentQuestionIndex + 1]);
    } else {
      finishTest();
    }
  };

  if (loading) {
    return <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center"><div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div></div>;
  }

  if (testState === 'idle') {
    return <StartScreen onStart={startTest} />;
  }

  if (testState === 'finished') {
    return (
      <div className="fixed inset-0 z-50 bg-gray-50 flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8 text-center my-8"
        >
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-gray-900">Practice Completed!</h1>
          <p className="text-gray-500 mt-2">Well done! Reflecting on these questions is a great step in your preparation.</p>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              onClick={resetTest} 
              className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-emerald-100 text-emerald-600 hover:bg-emerald-50 font-semibold py-3.5 rounded-xl transition-all"
            >
              <Sparkles className="w-5 h-5" />
              Practice Again
            </button>
            <button 
              onClick={onComplete} 
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-emerald-600/20"
            >
              Return to Roadmap
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
  
  const currentQuestion = questions[currentQuestionIndex];
  const progress = (currentQuestionIndex / questions.length) * 100;
  
  return (
    <div className="fixed inset-0 z-50 bg-gray-50 p-4 lg:p-8 flex flex-col">
      <header className="w-full max-w-4xl mx-auto flex items-center justify-between gap-6 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm"><UserCheck size={16}/></div>
          <h1 className="font-bold text-lg text-gray-900 hidden sm:block">HR Round Practice</h1>
        </div>
      </header>
      
      <div className="w-full max-w-4xl mx-auto mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Progress</span>
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
                className="bg-emerald-600 h-2 rounded-full" 
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
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 leading-tight mb-6">{currentQuestion.question}</h2>
            <textarea
              className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50 outline-none resize-y text-sm text-gray-700 bg-white"
              placeholder="Type your answer here..."
              value={currentAnswer}
              onChange={(e) => setCurrentAnswer(e.target.value)}
            />
            <button
              onClick={handleNextQuestion}
              disabled={!currentAnswer.trim()}
              className="mt-8 w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {currentQuestionIndex === questions.length - 1 ? 'Finish Practice' : 'Next Question'}
               <ChevronRight className="w-5 h-5"/>
            </button>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default HrRound;
