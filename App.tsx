import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import ResumeATS from './components/ResumeATS';
import Profile from './components/Profile';
import TrainingMode from './components/TrainingMode';
import ProgressDashboard from './components/ProgressDashboard';

import SmartJobMatching from './components/SmartJobMatching';
import FakeJobDetection from './components/FakeJobDetection';
import RoleBasedResumeBuilder from './components/RoleBasedResumeBuilder';
import OpportunityAccessibility from './components/OpportunityAccessibility';
import { UserProfile, TrainingModule } from './types';
import { ThemeProvider } from './lib/ThemeContext';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8 text-center bg-white rounded-xl border border-gray-100">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
    <p className="text-gray-500">Feature under development for this demo.</p>
  </div>
);

const initialModules: TrainingModule[] = [
  { id: 'career_path', title: 'Career Path', subtitle: 'Define your direction', status: 'active', side: 'left', topPos: '10%' },
  { id: 'skill_test', title: 'Skill Test', subtitle: 'Assess your knowledge', status: 'locked', side: 'right', topPos: '22%', score: null },
  { id: 'roadmap', title: 'Roadmap', subtitle: 'Personalized learning', status: 'locked', side: 'left', topPos: '34%' },
  { id: 'aptitude', title: 'Aptitude', subtitle: 'Problem-solving skills', status: 'locked', side: 'right', topPos: '46%' },
  { id: 'communication', title: 'Communication', subtitle: 'Workplace scenarios', status: 'locked', side: 'left', topPos: '58%', score: null },
  { id: 'hr_round', title: 'HR Round', subtitle: 'Behavioral prep', status: 'locked', side: 'right', topPos: '70%' },
  { id: 'goal', title: 'Goal: Hired!', subtitle: 'Congratulations!', status: 'locked', side: 'left', topPos: '85%' },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({
    name: 'Alex Doe',
    email: 'alex.doe@university.edu',
    role: 'Software Engineer Fresher',
    headline: 'Aspiring Full Stack Developer with a passion for building scalable web applications.',
    skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
    experienceLevel: 'Fresher',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
  });

  const [modules, setModules] = useState<TrainingModule[]>(initialModules);
  const [selectedCareer, setSelectedCareer] = useState<string | null>(null);

  useEffect(() => {
    // On app start, try to load profile and progress from localStorage
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) setUserProfile(JSON.parse(savedProfile));

    const savedModules = localStorage.getItem('trainingModules');
    if (savedModules) {
      setModules(JSON.parse(savedModules));
    } else {
      // If no saved modules, reset score for skill_test
      setModules(initialModules);
    }

    const savedCareer = localStorage.getItem('selectedCareer');
    if (savedCareer) setSelectedCareer(savedCareer);
  }, []);

  const handleUpdateProfile = (newProfile: UserProfile) => {
    setUserProfile(newProfile);
    localStorage.setItem('userProfile', JSON.stringify(newProfile));
  };

  // Move to next module in sequence
  const handleModuleComplete = (moduleId: string, score?: number) => {
    const currentIndex = modules.findIndex(m => m.id === moduleId);
    if (currentIndex !== -1) {
      const updatedModules = modules.map((m, index) => {
        // Complete the current module
        if (index === currentIndex) {
          const completedModule = { ...m, status: 'completed' as const };
          if (score !== undefined) {
            completedModule.score = score;
          }
          return completedModule;
        }
        // Activate the immediate next module if it's not the last one
        if (index === currentIndex + 1 && currentIndex < modules.length - 1) {
          return { ...m, status: 'active' as const };
        }
        return m;
      });

      setModules(updatedModules);
      localStorage.setItem('trainingModules', JSON.stringify(updatedModules));
    }
  };

  const handleCareerConfirm = (pathId: string, pathTitle: string) => {
    setSelectedCareer(pathTitle);
    localStorage.setItem('selectedCareer', pathTitle);

    // Complete career_path and activate skill_test
    handleModuleComplete('career_path');
  };

  const handleReset = () => {
    setModules(initialModules);
    setSelectedCareer(null);
    localStorage.removeItem('trainingModules');
    localStorage.removeItem('selectedCareer');
  };

  if (!isAuthenticated) {
    return <Auth onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      <HashRouter>
        <Layout onLogout={() => setIsAuthenticated(false)} userProfile={userProfile}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/trends" element={<Dashboard />} />
            <Route path="/ats" element={<ResumeATS />} />
            <Route path="/builder" element={<RoleBasedResumeBuilder />} />
            <Route path="/matching" element={<SmartJobMatching />} />
            <Route
              path="/training-mode"
              element={
                <TrainingMode
                  modules={modules}
                  selectedCareer={selectedCareer}
                  onCareerConfirm={handleCareerConfirm}
                  onModuleComplete={handleModuleComplete}
                  onReset={handleReset}
                />
              }
            />
            <Route path="/progress" element={<ProgressDashboard modules={modules} selectedCareer={selectedCareer} />} />
            <Route path="/assessment" element={<PlaceholderPage title="Skill Assessment" />} />
            <Route path="/interview-prep" element={<PlaceholderPage title="Interview Prep" />} />
            <Route path="/goal" element={<PlaceholderPage title="Goal: Hired!" />} />
            <Route path="/fake-job-detection" element={<FakeJobDetection />} />
            <Route path="/opportunity-accessibility" element={<OpportunityAccessibility />} />
            <Route
              path="/profile"
              element={<Profile userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />}
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </HashRouter>
    </ThemeProvider>
  );
};

export default App;