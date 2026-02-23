import { LucideIcon } from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  headline: string;
  skills: string[];
  experienceLevel: 'Fresher' | '0-1 Years' | '1-3 Years' | '3+ Years';
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

export enum AnalysisStatus {
  IDLE = 'idle',
  LOADING = 'loading',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface AtsResult {
  score: number;
  missingKeywords: string[];
  feedback: string;

  summary: string;
}

export interface RoadmapStep {
  title: string;
  description: string;
  status: 'completed' | 'in-progress' | 'pending';
  resources: string[];
}

export type ModuleStatus = 'completed' | 'active' | 'locked';

export interface TrainingModule {
  id: string;
  title: string;
  subtitle?: string;
  status: ModuleStatus;
  side: 'left' | 'right';
  topPos: string; // CSS percentage string
  score?: number | null;
}

export interface Question {
  id: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  question: string;
  options: string[];
  answerIndex: number;
}

export interface RoadmapNode {
  id: string;
  label: string;
}

export interface CareerRoadmapData {
  id: string;
  title: string;
  nodes: RoadmapNode[];
  edges: string[][];
}

export interface HrQuestion {
  id: number;
  question: string;
}

export interface Job {
  title: string;
  company: string;
  location: string;
  url: string;
  score: number;
}