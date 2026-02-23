import React from 'react';
import { CheckCircle, Star, Lock, PieChart, BarChart2 } from './ui/Icons';
import { TrainingModule } from '../types';

// --- Sub-components ---

const StatCard: React.FC<{ title: string; value: string; icon: React.ElementType; iconBg: string }> = ({ title, value, icon: Icon, iconBg }) => (
  <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center gap-6">
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${iconBg}`}>
      <Icon className="w-7 h-7 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  </div>
);

const ProgressBar: React.FC<{ value: number }> = ({ value }) => (
  <div className="w-full bg-gray-100 rounded-full h-2.5">
    <div 
      className="bg-primary-600 h-2.5 rounded-full transition-all duration-500"
      style={{ width: `${value}%` }}
    ></div>
  </div>
);

const ModuleCard: React.FC<{ module: TrainingModule; selectedCareer: string | null; }> = ({ module, selectedCareer }) => {
  const { title, status, score } = module;
  
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'active': return <Star className="w-6 h-6 text-violet-500 fill-current" />;
      case 'locked': return <Lock className="w-6 h-6 text-gray-400" />;
      default: return null;
    }
  };

  const getStatusBadge = () => {
    const baseClasses = "text-xs font-semibold px-2.5 py-0.5 rounded-full";
    switch (status) {
      case 'completed': return <span className={`${baseClasses} bg-green-50 text-green-700`}>Completed</span>;
      case 'active': return <span className={`${baseClasses} bg-violet-50 text-violet-700`}>In Progress</span>;
      case 'locked': return <span className={`${baseClasses} bg-gray-50 text-gray-600`}>Locked</span>;
      default: return null;
    }
  };

  return (
    <div className={`bg-white p-5 rounded-xl border border-gray-100 shadow-sm transition-all ${status === 'locked' ? 'opacity-60' : ''}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {getStatusIcon()}
          <span className="font-bold text-gray-800">{title}</span>
        </div>
        {getStatusBadge()}
      </div>
      
      {module.id === 'career_path' && selectedCareer && status === 'completed' && (
         <div className="mt-4 pt-4 border-t border-gray-100">
           <p className="text-xs text-gray-500 font-medium">SELECTED PATH</p>
           <p className="font-semibold text-primary-700 mt-1">{selectedCareer}</p>
         </div>
      )}

      {typeof score === 'number' && status === 'completed' && (
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-baseline">
            <p className="text-sm font-medium text-gray-600">Score</p>
            <p className="text-lg font-bold text-primary-700">{score}%</p>
          </div>
          <ProgressBar value={score} />
        </div>
      )}
    </div>
  );
};


// --- Main Component ---
interface ProgressDashboardProps {
  modules: TrainingModule[];
  selectedCareer: string | null;
}

const ProgressDashboard: React.FC<ProgressDashboardProps> = ({ modules, selectedCareer }) => {
  // Calculate statistics
  const completedModules = modules.filter(m => m.status === 'completed');
  const totalModules = modules.length - 1; // Exclude goal
  const overallCompletion = totalModules > 0 ? Math.round((completedModules.length / totalModules) * 100) : 0;
  
  const scoredModules = completedModules.filter(m => typeof m.score === 'number');
  const averageScore = scoredModules.length > 0
    ? Math.round(scoredModules.reduce((acc, m) => acc + (m.score || 0), 0) / scoredModules.length)
    : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Progress Dashboard</h1>
        <p className="text-gray-500 mt-1">Track your journey and performance at a glance.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatCard 
          title="Overall Completion" 
          value={`${overallCompletion}%`}
          icon={PieChart}
          iconBg="bg-primary-500"
        />
        <StatCard 
          title="Average Test Score" 
          value={averageScore > 0 ? `${averageScore}%` : 'N/A'}
          icon={BarChart2}
          iconBg="bg-emerald-500"
        />
      </div>

      {/* Module Breakdown */}
      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Module Breakdown</h2>
        <div className="space-y-4">
          {modules.map(module => (
            <ModuleCard key={module.id} module={module} selectedCareer={selectedCareer} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
