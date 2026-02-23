import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Check, GitMerge } from './ui/Icons';
import { CareerRoadmapData, RoadmapNode } from '../types';

const CAREER_TITLE_TO_ID_MAP: { [key: string]: string } = {
  'Software Engineer': 'software-engineer',
  'Data Analyst / Scientist': 'data-analyst',
  'Cybersecurity Analyst': 'cybersecurity',
  'Cloud / DevOps Engineer': 'cloud-devops',
  'AI / Machine Learning Engineer': 'ai-ml',
};

interface CareerRoadmapProps {
  selectedCareer: string | null;
  onClose: () => void;
  onComplete: () => void;
}

const RoadmapCard: React.FC<{ node: RoadmapNode, index: number }> = ({ node, index }) => {
    const isLeft = index % 2 === 0;
    const isGoal = node.id === 'goal';
    
    const cardVariants = {
        hidden: { opacity: 0, x: isLeft ? -50 : 50 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    return (
        <motion.div
            variants={cardVariants}
            className={`relative w-full flex ${isLeft ? 'justify-start' : 'justify-end'} ${isGoal ? '!justify-center' : ''}`}
        >
            <div className="absolute top-1/2 h-px bg-gray-200 w-1/2"></div>
             {/* Timeline Dot */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-white border-2 border-gray-300 rounded-full z-10"></div>
            
            <div className={`relative w-[calc(50%-2rem)] p-4 bg-white rounded-lg border border-gray-200 shadow-sm
                ${isGoal ? 'mx-auto text-center' : ''}
            `}>
                <p className="font-semibold text-gray-800 text-sm">{node.label}</p>
            </div>
        </motion.div>
    );
};

const CareerRoadmap: React.FC<CareerRoadmapProps> = ({ selectedCareer, onClose, onComplete }) => {
  const [roadmap, setRoadmap] = useState<CareerRoadmapData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRoadmaps = async () => {
      try {
        setLoading(true);
        const response = await fetch('./data/career-roadmaps.json');
        const data = await response.json();
        const careerId = selectedCareer ? CAREER_TITLE_TO_ID_MAP[selectedCareer] : null;
        const matchedRoadmap = data.careers.find((r: CareerRoadmapData) => r.id === careerId);
        setRoadmap(matchedRoadmap || null);
      } catch (error) {
        console.error("Failed to load career roadmaps:", error);
        setRoadmap(null);
      } finally {
        setLoading(false);
      }
    };
    fetchRoadmaps();
  }, [selectedCareer]);
  
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-fade-in-fast">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-gray-50 rounded-2xl shadow-2xl w-full max-w-2xl h-[90vh] flex flex-col m-4"
      >
        <header className="flex items-center justify-between p-6 border-b border-gray-200 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-violet-100 text-violet-600 rounded-lg flex items-center justify-center">
              <GitMerge className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Career Roadmap</h2>
              <p className="text-sm text-gray-500">{selectedCareer}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </header>

        <main className="flex-1 p-8 overflow-y-auto">
          {loading && <div className="text-center text-gray-500">Loading roadmap...</div>}
          {!loading && !roadmap && <div className="text-center text-red-500">Could not load roadmap for "{selectedCareer}".</div>}
          
          {roadmap && (
            <motion.div 
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="relative flex flex-col items-center space-y-8"
            >
                {/* Center Timeline */}
                <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-gray-200"></div>

                {roadmap.nodes.map((node, index) => (
                    <RoadmapCard key={node.id} node={node} index={index} />
                ))}
            </motion.div>
          )}
        </main>
        
        <footer className="p-6 border-t border-gray-200 shrink-0 mt-auto">
          <button
            onClick={onComplete}
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl transition-all shadow-lg shadow-primary-600/20 active:scale-[0.98]"
          >
            <Check className="w-5 h-5" />
            Mark as Complete
          </button>
        </footer>
      </motion.div>
    </div>
  );
};

export default CareerRoadmap;