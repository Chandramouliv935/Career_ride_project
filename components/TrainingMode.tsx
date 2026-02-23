import React, { useState } from 'react';
import { Check, Lock, Star, Sparkles, ChevronRight, Target, Map, Code, Database, Shield, Cloud, BrainCircuit, X, Play, MessageSquare, UserCheck, RefreshCw } from './ui/Icons';
import { TrainingModule } from '../types';
import SkillTest from './SkillTest';
import CareerRoadmap from './CareerRoadmap';
import AptitudeTest from './AptitudeTest';
import CommunicationTest from './CommunicationTest';
import HrRound from './HrRound';
import CareerChatbot from './CareerChatbot';


// --- Types ---

const careerPaths = [
    { id: 'swe', title: 'Software Engineer', subtitle: 'Backend / Full-Stack', icon: Code },
    { id: 'data', title: 'Data Analyst / Scientist', subtitle: 'Insights from data', icon: Database },
    { id: 'security', title: 'Cybersecurity Analyst', subtitle: 'Protect digital assets', icon: Shield },
    { id: 'cloud', title: 'Cloud / DevOps Engineer', subtitle: 'Infrastructure & scale', icon: Cloud },
    { id: 'ai', title: 'AI / Machine Learning Engineer', subtitle: 'Build intelligent systems', icon: BrainCircuit },
];

// --- Sub-components ---

const LevelNode: React.FC<{ module: TrainingModule; index: number; onClick: () => void; }> = ({ module, index, onClick }) => {
  const isCompleted = module.status === 'completed';
  const isActive = module.status === 'active';
  const isLocked = module.status === 'locked';
  const isLeft = module.side === 'left';
  const isGoal = module.id === 'goal';

  const cardDelay = 0.5 + index * 0.2;

  // Positioning logic
  let containerStyle: React.CSSProperties = {
    top: module.topPos,
    animation: `popIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${cardDelay}s forwards`,
    opacity: 0,
    zIndex: isActive ? 30 : 20,
  };

  let containerClass = 'absolute -translate-y-1/2 flex items-center group';
  
  if (isGoal) {
    // Goal: Span full width and center using layout structure
    containerClass += ' left-0 w-full justify-center';
  } else if (isLeft) {
    // Left side nodes: right edge of card at 320px from left (center is 400, branch is 80)
    containerClass += ' right-[480px] text-left';
  } else { 
    // Right side nodes: left edge of card at 480px from left
    containerClass += ' left-[480px] text-left';
  }
  
  const getModuleIcon = () => {
    switch(module.id) {
        case 'communication': return <MessageSquare className="w-6 h-6"/>;
        case 'hr_round': return <UserCheck className="w-6 h-6" />;
        default: 
            if (isGoal) return <Target className="w-7 h-7" />;
            if (isCompleted) return <Check className="w-6 h-6" strokeWidth={3} />;
            if (isActive) return <Star className="w-6 h-6 animate-spin-slow" strokeWidth={0} fill="currentColor" />;
            return <Lock className="w-5 h-5" />;
    }
  };

  return (
    <div className={containerClass} style={containerStyle}>
      <button
        onClick={isActive ? onClick : undefined}
        disabled={!isActive && !isGoal}
        className={`
          relative transition-all duration-300 bg-white group-hover:scale-[1.02] active:scale-[0.98]
          ${isGoal 
            ? 'flex flex-col items-center justify-center text-center p-6 rounded-2xl min-w-[280px] border border-gray-200 shadow-xl shadow-gray-200/40 mt-14' 
            : 'flex items-center gap-4 p-4 rounded-2xl min-w-[240px]'
          }
          ${isActive && !isGoal 
            ? 'shadow-lg shadow-violet-500/20 border-2 border-violet-200 cursor-pointer' 
            : isCompleted && !isGoal 
              ? 'shadow-md shadow-gray-200/50 border border-gray-100' 
              : isLocked && !isGoal 
                ? 'shadow-sm border border-gray-100 opacity-70'
                : '' 
          }
        `}
        aria-label={module.title}
      >
        {/* Active Ripple Effect (Non-Goal) */}
        {isActive && !isGoal && (
          <div className="absolute inset-0 rounded-2xl animate-ping-slow bg-violet-400/20 -z-10"></div>
        )}

        {/* Icon Box */}
        <div className={`
          flex items-center justify-center shrink-0 rounded-xl transition-colors
          ${isGoal ? 'w-14 h-14 mb-3 bg-gray-50 text-gray-600 border border-gray-100' : 'w-12 h-12 text-white'}
          ${isActive && !isGoal ? 'bg-violet-600' : ''}
          ${isCompleted && !isGoal ? 'bg-emerald-500' : ''}
          ${isLocked && !isGoal ? 'bg-gray-100 text-gray-400' : ''}
        `}>
           {getModuleIcon()}
        </div>

        {/* Text Content */}
        <div className={`flex flex-col ${isGoal ? 'items-center' : ''}`}>
          <h3 className={`font-bold tracking-tight ${isGoal ? 'text-xl text-gray-900 mb-0.5' : 'text-sm text-gray-800'}`}>
            {module.title}
          </h3>
          <p className={`font-medium text-gray-500 ${isGoal ? 'text-sm' : 'text-xs mt-0.5'}`}>
            {module.subtitle}
          </p>
        </div>

        {/* Chevron for Standard Active Nodes */}
        {!isLocked && !isGoal && !isCompleted && (
          <ChevronRight className="w-5 h-5 ml-auto text-violet-400" />
        )}
      </button>
    </div>
  );
};


const RoadmapScreen: React.FC<{ modules: TrainingModule[], onModuleClick: (moduleId: string) => void, animateToModuleId: string | null }> = ({ modules, onModuleClick, animateToModuleId }) => (
  <div className="relative w-[800px] h-[900px] mx-auto mt-8 animate-fade-in mb-12">
    {/* SVG Layer for Lines */}
    <svg 
      className="absolute top-0 left-0 w-full h-full pointer-events-none" 
      viewBox="0 0 800 900" 
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="lightPulseGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" stopOpacity="0" />
            <stop offset="50%" stopColor="#c4b5fd" stopOpacity="1" />
            <stop offset="100%" stopColor="#a78bfa" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Central Vertical Timeline Line */}
      <line 
        x1="400" y1="0" x2="400" y2="900" 
        stroke="#e2e8f0" 
        strokeWidth="2" 
        strokeLinecap="round"
        strokeDasharray="4 6" 
      />
      
      {/* Branches and Central Dots */}
      {modules.map((mod, i) => {
        const isGoal = mod.id === 'goal';
        const topPercent = parseFloat(mod.topPos);
        const y = (topPercent / 100) * 900;
        const isLeft = mod.side === 'left';
        
        const horizontalLineLength = 80; 
        const branchX = isLeft ? 400 - horizontalLineLength : 400 + horizontalLineLength;
        
        const isUnlocked = mod.status !== 'locked' || isGoal;
        const strokeColor = isUnlocked ? '#a78bfa' : '#cbd5e1'; 

        return (
          <g key={`module-graphic-${mod.id}`}>
            {/* Connection Point on Timeline (Non-Goal) */}
            {!isGoal && (
              <circle 
                cx="400" cy={y} r="5"
                fill="white" 
                stroke={strokeColor}
                strokeWidth="2" 
                className="animate-pop-in-sm" 
                style={{animationDelay: `${i * 0.15}s`, opacity: 0}} 
              />
            )}

             {/* Side Branch Lines */}
            {!isGoal && (
              <line 
                x1="400" y1={y} x2={branchX} y2={y}
                stroke={strokeColor}
                strokeWidth="2"
                className="animate-draw-branch"
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              />
            )}
            
            {/* Goal Vertical Connection Anchor */}
            {isGoal && (
               <circle 
                cx="400" cy={y - 50} r="4" 
                fill="#cbd5e1"
                className="animate-pop-in-sm"
               />
            )}
            
            {/* Active Path Pulse */}
            {animateToModuleId === mod.id && !isGoal && (
                <line
                    x1="400" y1={y} x2={branchX} y2={y}
                    stroke="url(#lightPulseGradient)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className="animate-light-pulse"
                    style={{ transform: isLeft ? 'scaleX(-1)' : 'scaleX(1)', transformOrigin: isLeft ? 'right' : 'left' }}
                />
            )}
          </g>
        );
      })}
    </svg>

    {/* Nodes Layer */}
    <div className="relative z-10 w-full h-full">
      {modules.map((module, index) => (
        <LevelNode key={module.id} module={module} index={index} onClick={() => onModuleClick(module.id)} />
      ))}
    </div>
  </div>
);

const IntroScreen: React.FC<{onStart: () => void}> = ({ onStart }) => (
  <div className="h-[80vh] flex flex-col items-center justify-center text-center p-4 animate-fade-in">
    <div className="w-16 h-16 bg-violet-100 rounded-2xl flex items-center justify-center mb-6">
      <Map className="w-8 h-8 text-violet-600" />
    </div>
    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Path to Excellence</h1>
    <p className="max-w-xl mt-4 text-gray-500 text-lg font-medium leading-relaxed">
      A personalized, step-by-step roadmap designed to transform your potential into a successful career in engineering.
    </p>
    <button
      onClick={onStart}
      className="mt-10 flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98]"
    >
      Begin Journey
      <ChevronRight className="w-5 h-5" />
    </button>
  </div>
);

const CareerSelectionModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (pathId: string, pathTitle: string) => void; }> = ({ isOpen, onClose, onConfirm }) => {
    const [selectedPath, setSelectedPath] = useState<string | null>(null);

    if (!isOpen) return null;
    
    const handleConfirm = () => {
        if (selectedPath) {
            const path = careerPaths.find(p => p.id === selectedPath);
            if (path) {
                onConfirm(path.id, path.title);
            }
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/40 backdrop-blur-sm animate-fade-in-fast">
            <div className="bg-white rounded-3xl shadow-2xl p-10 max-w-4xl w-full m-4 animate-pop-in-sm text-center">
                <div className="flex justify-between items-center mb-8">
                    <div className="w-14 h-14 bg-violet-50 rounded-2xl flex items-center justify-center">
                        <Target className="w-8 h-8 text-violet-600" />
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Select Your Career Path</h2>
                <p className="max-w-xl mt-3 text-gray-500 text-lg font-medium mx-auto">
                    Choose the direction that excites you most. We'll tailor everything to help you succeed.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-10 w-full">
                    {careerPaths.map(path => {
                        const isSelected = selectedPath === path.id;
                        return (
                            <button
                                key={path.id}
                                onClick={() => setSelectedPath(path.id)}
                                className={`p-6 rounded-2xl border-2 text-left transition-all duration-300 ${
                                    isSelected 
                                    ? 'border-primary-500 bg-primary-50 shadow-lg shadow-primary-500/10' 
                                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                                }`}
                            >
                                <div className="flex items-center gap-4 mb-3">
                                    <div className={`p-3 rounded-xl ${isSelected ? 'bg-primary-600 text-white' : 'bg-gray-50 text-gray-400'}`}>
                                        <path.icon className="w-6 h-6" />
                                    </div>
                                    <span className={`font-bold text-lg ${isSelected ? 'text-primary-900' : 'text-gray-800'}`}>{path.title}</span>
                                </div>
                                <p className="text-sm text-gray-500 leading-relaxed">{path.subtitle}</p>
                            </button>
                        )
                    })}
                </div>
                <button
                    onClick={handleConfirm}
                    disabled={!selectedPath}
                    className="mt-12 flex items-center justify-center w-full max-w-sm mx-auto gap-3 bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 px-8 rounded-2xl transition-all shadow-xl shadow-primary-600/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Start Skill Test
                    <Play className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

interface TrainingModeProps {
  modules: TrainingModule[];
  selectedCareer: string | null;
  onCareerConfirm: (pathId: string, pathTitle: string) => void;
  onModuleComplete: (moduleId: string, score?: number) => void;
  onReset: () => void;
}

const TrainingMode: React.FC<TrainingModeProps> = ({ modules, selectedCareer, onCareerConfirm, onModuleComplete, onReset }) => {
  const [introDismissed, setIntroDismissed] = useState(false);
  const [isCareerModalOpen, setIsCareerModalOpen] = useState(false);
  const [animateToModuleId, setAnimateToModuleId] = useState<string | null>(null);
  const [isSkillTestActive, setIsSkillTestActive] = useState(false);
  const [isAptitudeTestActive, setIsAptitudeTestActive] = useState(false);
  const [isCommunicationTestActive, setIsCommunicationTestActive] = useState(false);
  const [isHrRoundActive, setIsHrRoundActive] = useState(false);
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  
  const journeyHasStarted = modules[0].status !== 'active';
  const showIntro = !journeyHasStarted && !introDismissed;
  
  const anyTestActive = isSkillTestActive || isAptitudeTestActive || isCommunicationTestActive || isHrRoundActive;

  const handleModuleClick = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    if (module?.status === 'active') {
      switch (moduleId) {
        case 'career_path': setIsCareerModalOpen(true); break;
        case 'skill_test': setIsSkillTestActive(true); break;
        case 'roadmap': setIsRoadmapOpen(true); break;
        case 'aptitude': setIsAptitudeTestActive(true); break;
        case 'communication': setIsCommunicationTestActive(true); break;
        case 'hr_round': setIsHrRoundActive(true); break;
        default: break;
      }
    }
  };
  
  const handleCareerConfirm = (pathId: string, pathTitle: string) => {
    onCareerConfirm(pathId, pathTitle);
    setIsCareerModalOpen(false);
    setIsSkillTestActive(true);
  };
  
  const handleSkillTestComplete = (finalScore: number) => {
    onModuleComplete('skill_test', finalScore);
    const index = modules.findIndex(m => m.id === 'skill_test');
    triggerAnimation(index);
    setIsSkillTestActive(false);
  };
  
  const handleAptitudeTestComplete = (finalScore: number) => {
    onModuleComplete('aptitude', finalScore);
    const index = modules.findIndex(m => m.id === 'aptitude');
    triggerAnimation(index);
    setIsAptitudeTestActive(false);
  };

  const handleCommunicationTestComplete = (finalScore: number) => {
    onModuleComplete('communication', finalScore);
    const index = modules.findIndex(m => m.id === 'communication');
    triggerAnimation(index);
    setIsCommunicationTestActive(false);
  };

  const handleHrRoundComplete = () => {
    onModuleComplete('hr_round');
    const index = modules.findIndex(m => m.id === 'hr_round');
    triggerAnimation(index);
    setIsHrRoundActive(false);
  };
  
  const handleRoadmapComplete = () => {
    onModuleComplete('roadmap');
    const index = modules.findIndex(m => m.id === 'roadmap');
    triggerAnimation(index);
    setIsRoadmapOpen(false);
  };

  const triggerAnimation = (currentIndex: number) => {
      if (currentIndex < modules.length - 1) {
          const nextModuleId = modules[currentIndex + 1].id;
          setTimeout(() => {
            setAnimateToModuleId(nextModuleId);
            setTimeout(() => setAnimateToModuleId(null), 1200);
        }, 300);
      }
  };

  return (
    <div className="relative w-full overflow-x-auto no-scrollbar pb-20">
      {/* Background Aesthetic */}
      <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden min-w-[800px]">
        <div className="absolute top-0 left-0 w-2/3 h-1/2 bg-gradient-to-br from-violet-50/50 to-transparent blur-[120px]"></div>
        <div className="absolute bottom-0 right-0 w-2/3 h-1/2 bg-gradient-to-tl from-sky-50/50 to-transparent blur-[120px]"></div>
      </div>
      
      {showIntro && !anyTestActive ? (
        <IntroScreen onStart={() => setIntroDismissed(true)} />
      ) : (
        !anyTestActive && (
          <RoadmapScreen 
              modules={modules} 
              onModuleClick={handleModuleClick}
              animateToModuleId={animateToModuleId} 
          />
        )
      )}
      
      <CareerSelectionModal 
        isOpen={isCareerModalOpen}
        onClose={() => setIsCareerModalOpen(false)}
        onConfirm={handleCareerConfirm}
      />

      {isRoadmapOpen && (
        <CareerRoadmap 
          selectedCareer={selectedCareer}
          onClose={() => setIsRoadmapOpen(false)}
          onComplete={handleRoadmapComplete}
        />
      )}

      {isSkillTestActive && (
        <SkillTest
          onComplete={handleSkillTestComplete}
          careerTitle={selectedCareer}
        />
      )}
      
      {/* Reset Button */}
      {!showIntro && !anyTestActive && (
          <button
            onClick={() => {
                if (window.confirm("Are you sure you want to reset your progress? This cannot be undone.")) {
                    onReset();
                    setIntroDismissed(false);
                    setAnimateToModuleId(null);
                }
            }}
            className="absolute top-4 right-4 z-50 flex items-center gap-2 p-2 px-4 bg-white/80 hover:bg-white backdrop-blur-sm rounded-lg shadow-md text-gray-500 hover:text-red-500 transition-colors font-medium border border-gray-100"
            title="Reset Progress"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </button>
      )}
      
      {isAptitudeTestActive && (
        <AptitudeTest
          onComplete={handleAptitudeTestComplete}
        />
      )}

      {isCommunicationTestActive && (
        <CommunicationTest
          onComplete={handleCommunicationTestComplete}
        />
      )}

      {isHrRoundActive && (
        <HrRound
          onComplete={handleHrRoundComplete}
        />
      )}

      <CareerChatbot />

      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fadeInFast {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-fade-in-fast {
            animation: fadeInFast 0.3s ease-out forwards;
        }

        @keyframes drawBranch {
          from { stroke-dasharray: 200; stroke-dashoffset: 200; opacity: 0; }
          to { stroke-dasharray: 200; stroke-dashoffset: 0; opacity: 1; }
        }

        @keyframes popIn {
          0% { opacity: 0; transform: translateY(-40%) scale(0.95); }
          100% { opacity: 1; transform: translateY(-50%) scale(1); }
        }
        
        @keyframes popInSm {
          0% { opacity: 0; transform: scale(0.85); }
          100% { opacity: 1; transform: scale(1); }
        }

        .animate-pop-in-sm {
           animation: popInSm 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        
        @keyframes pingSlow {
          0% { transform: scale(1); opacity: 0.4; }
          100% { transform: scale(1.3); opacity: 0; }
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes lightPulse {
          0% { stroke-dashoffset: 120; opacity: 0; }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { stroke-dashoffset: -120; opacity: 0; }
        }

        .animate-light-pulse {
          stroke-dasharray: 40 120;
          animation: lightPulse 1.2s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .animate-draw-branch {
          animation: drawBranch 1s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        
        .animate-ping-slow {
          animation: pingSlow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        .animate-spin-slow {
          animation: spinSlow 12s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default TrainingMode;