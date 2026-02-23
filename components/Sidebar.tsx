import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FileEdit,
  Briefcase,
  BookOpen,
  BarChart2,
  LogOut,
  ShieldAlert,
  Globe
} from './ui/Icons';
import { NavItem, UserProfile } from '../types';

const navItems: NavItem[] = [
  { id: 'trends', label: 'Job Trend Analysis', icon: LayoutDashboard, path: '/' },
  { id: 'training', label: 'Training Mode', icon: BookOpen, path: '/training-mode' },
  { id: 'builder', label: 'Role-Based Resume Builder', icon: FileEdit, path: '/builder' },
  { id: 'ats', label: 'Resume ATS Analyzer', icon: FileText, path: '/ats' },
  { id: 'matching', label: 'Smart Job Matching', icon: Briefcase, path: '/matching' },
  { id: 'fake-job', label: 'Fake Job Detection', icon: ShieldAlert, path: '/fake-job-detection' },
  { id: 'accessibility', label: 'Opportunity Accessibility', icon: Globe, path: '/opportunity-accessibility' },
  { id: 'progress', label: 'Progress Dashboard', icon: BarChart2, path: '/progress' },
];

interface SidebarProps {
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, isOpen, onClose, userProfile }) => {
  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`fixed inset-0 z-20 bg-black/50 transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <aside className={`
        fixed inset-y-0 left-0 z-30 w-72 bg-white dark:bg-neutral-800 border-r border-gray-100 dark:border-neutral-700 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-full
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 border-b border-gray-50 dark:border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white font-bold">C</div>
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">CareerFlow AI</span>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto no-scrollbar py-4 px-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.id}
              to={item.path}
              onClick={() => window.innerWidth < 1024 && onClose()}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group
                ${isActive
                  ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-700 hover:text-gray-900 dark:hover:text-white'}
              `}
            >
              {({ isActive }) => (
                <>
                  <item.icon className={`w-5 h-5 transition-colors ${isActive ? 'text-primary-600' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} />
                  {item.label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50 dark:border-neutral-700 space-y-2">
          <NavLink
            to="/profile"
            onClick={() => window.innerWidth < 1024 && onClose()}
            className={({ isActive }) => `
              flex items-center gap-3 w-full p-2 text-sm font-medium rounded-lg transition-all duration-200 group
              ${isActive ? 'bg-primary-50 dark:bg-primary-900/20' : 'hover:bg-gray-50 dark:hover:bg-neutral-700'}
            `}
          >
            {/* FIX: Use a render prop for NavLink children to get access to isActive state. */}
            {({ isActive }) => (
              <>
                <div className="w-9 h-9 rounded-full bg-primary-600 flex items-center justify-center text-white font-semibold">
                  {userProfile.name.charAt(0)}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className={`font-semibold truncate ${isActive ? 'text-primary-800 dark:text-primary-300' : 'text-gray-800 dark:text-gray-200'}`}>{userProfile.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{userProfile.email}</p>
                </div>
              </>
            )}
          </NavLink>
          <button
            onClick={onLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;