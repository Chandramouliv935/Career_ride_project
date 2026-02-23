import React, { useState } from 'react';
import { Upload, Briefcase, MapPin, ExternalLink, AlertCircle } from './ui/Icons';
import { Job } from '../types';

type Status = 'idle' | 'loading' | 'success' | 'error';

const getMatchColor = (score: number) => {
  if (score > 80) return 'bg-green-500';
  if (score >= 60) return 'bg-orange-500';
  return 'bg-red-500';
};

const JobCard: React.FC<{ job: Job }> = ({ job }) => (
  <div className="relative bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary-200 transition-all duration-300 flex flex-col justify-between">
    <div>
      <h3 className="font-bold text-gray-900">{job.title}</h3>
      <p className="text-sm text-gray-600 mt-1">{job.company}</p>
      <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
        <MapPin className="w-3 h-3" />
        <span>{job.location}</span>
      </div>
    </div>
    <div className="mt-4">
      <div className="flex justify-between items-center text-xs mb-1">
        <span className="font-medium text-gray-700">Match Score</span>
        <span className="font-semibold text-gray-900">{job.score}%</span>
      </div>
      <div className="w-full h-2 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full ${getMatchColor(job.score)} transition-all`}
          style={{ width: `${Math.min(Math.max(job.score, 0), 100)}%` }}
        />
      </div>
      <a
        href={job.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors"
      >
        Apply Now
        <ExternalLink className="w-4 h-4 ml-2" />
      </a>
    </div>
  </div>
);

const SmartJobMatching: React.FC = () => {
  const [resumeText, setResumeText] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [jobs, setJobs] = useState<Job[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      // We send the raw file directly to n8n. Clear any pasted text to avoid ambiguity.
      setResumeText('');
      setError(null);
    }
  };

  const findJobs = async () => {
    if (!file && !resumeText.trim()) return;

    setStatus('loading');
    setError(null);
    setJobs([]);

    try {
      const formData = new FormData();

      if (file) {
        formData.append('file', file);
      } else if (resumeText.trim()) {
        formData.append('text', resumeText.trim());
      }

      // Directly call the n8n webhook URL
      const response = await fetch('http://localhost:5678/webhook/job-match', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status} ${response.statusText}`);
      }

      let data = await response.json();
      
      // Handle both array and object response formats
      // Format 1: Direct array check
      // Format 2: { matches: [...] } wrapper check
      let rawJobs: any[] = [];
      
      if (Array.isArray(data)) {
        rawJobs = data;
      } else if (data && typeof data === 'object' && Array.isArray(data.matches)) {
        rawJobs = data.matches;
      } else {
        // If data matches the single job structure, wrap it in array
        if (data && typeof data === 'object' && data.title) {
            rawJobs = [data];
        } else {
            console.warn('Unexpected API response format:', data);
            // Don't crash, just show 0 jobs if format is unrecognizable but valid JSON
            // unless strictly required to error. User said "do not crash when empty jobs returned".
        }
      }

      const transformedJobs: Job[] = rawJobs
        .map((job: any) => ({
          title: job.title || 'Unknown Role',
          company: job.company || 'Unknown Company',
          location: job.location || 'Remote',
          url: job.apply_url || job.url || '#',
          score: typeof job.match_score === 'number' ? job.match_score : 
                 (typeof job.score === 'number' ? job.score : 0),
        }))
        .filter(
          (job: Job) =>
            job.title && 
            job.title !== 'Unknown Role' // Basic filter
        )
        .sort((a: Job, b: Job) => b.score - a.score);

      setJobs(transformedJobs);
      setStatus('success');
    } catch (err) {
      console.error('Error calling job match API:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(`Unable to analyze resume (${errorMessage}). Please check if n8n is running.`);
      setStatus('error');
    }
  };
  
  const renderResults = () => {
    switch (status) {
      case 'loading':
        return (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
            <p className="font-semibold text-gray-800">Finding jobs for you...</p>
            <p className="text-sm text-gray-500">This may take a moment.</p>
          </div>
        );
      case 'success':
        return (
          <>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.slice(0, Math.max(5, jobs.length)).map((job, index) => (
                  <JobCard key={`${job.url}-${index}`} job={job} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <h3 className="font-bold text-gray-800">No matching jobs found.</h3>
                <p className="text-sm text-gray-500 mt-1">
                  No matching jobs found. Try improving your resume skills.
                </p>
              </div>
            )}
          </>
        );
      case 'error':
        return (
          <div className="text-center py-12 bg-red-50 border border-red-200 rounded-xl">
             <AlertCircle className="w-12 h-12 mx-auto text-red-400 mb-4" />
             <h3 className="font-bold text-red-800">An Error Occurred</h3>
             <p className="text-sm text-red-600 mt-1 max-w-sm mx-auto">
               {error ?? 'Unable to analyze resume. Please try another file.'}
             </p>
          </div>
        );
      case 'idle':
      default:
        return (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <h3 className="font-bold text-gray-800">Your Future Awaits</h3>
            <p className="text-sm text-gray-500 mt-1">Upload your resume to find job matches.</p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Smart Job Matching</h1>
        <p className="text-gray-500 mt-1">Let AI find the best job opportunities based on your resume.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Input */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4 sticky top-8">
          <div className="relative border border-dashed border-gray-300 rounded-xl p-8 text-center group hover:border-primary-500 transition-colors">
            <input 
              type="file" 
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 mx-auto bg-gray-100 group-hover:bg-primary-50 rounded-full flex items-center justify-center transition-colors">
              <Upload className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />
            </div>
            <p className="font-medium text-gray-800 mt-2">{file ? file.name : 'Upload your resume'}</p>
            <p className="text-xs text-gray-500 mt-1">.pdf, .txt or .md files only</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">or paste content</span></div>
          </div>

          <textarea
            className="w-full h-48 p-4 rounded-xl border border-gray-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 outline-none resize-y text-sm font-mono text-gray-700"
            placeholder="Paste your resume content here..."
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              if (e.target.value.trim()) {
                setFile(null);
              }
            }}
          ></textarea>

          <button
            onClick={findJobs}
            disabled={status === 'loading' || (!file && !resumeText.trim())}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {status === 'loading' ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Briefcase className="w-5 h-5" />
                Find Matching Jobs
              </>
            )}
          </button>
        </div>

        {/* Right Column: Results */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm min-h-[600px]">
            {renderResults()}
        </div>
      </div>
    </div>
  );
};

export default SmartJobMatching;