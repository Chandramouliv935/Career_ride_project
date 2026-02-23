import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Target, Check } from './ui/Icons';
import { analyzeResume, ATSAnalysisResult } from '../lib/atsClient';

const ResumeATS: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState('');
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Store the AbortController in a ref so we can cancel previous requests
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      setText(''); // Clear text when file is selected
      setError(null);
    }
  };

  const analyze = async () => {
    if (!text && !file) return;
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const data = await analyzeResume({
        file,
        text,
        role: jobRole
      }, controller.signal);

      setResult(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') return;
        setError(err.message);
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      if (abortControllerRef.current === controller) {
         setIsLoading(false);
         abortControllerRef.current = null;
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Resume ATS Analyzer</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Optimize your resume for Application Tracking Systems using AI.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {/* Target Role Input */}
          <div className="bg-white dark:bg-neutral-800 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 shadow-sm transition-colors duration-300">
            <label htmlFor="jobRole" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Target Job Role</label>
            <input
              type="text"
              id="jobRole"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-gray-900 dark:text-white focus:border-primary-500 focus:ring-4 focus:ring-primary-50 dark:focus:ring-primary-900/20 outline-none transition-all"
              placeholder="e.g. Software Engineer"
            />
          </div>

          {/* Upload Card */}
          <div className="bg-white dark:bg-neutral-800 p-8 rounded-xl border border-dashed border-gray-300 dark:border-neutral-600 hover:border-primary-500 dark:hover:border-primary-400 transition-colors text-center cursor-pointer group relative">
            <input
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <div className="w-12 h-12 bg-gray-50 dark:bg-neutral-900/50 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/20 transition-colors">
              <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {file ? file.name : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">PDF, TXT, or MD files supported</p>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-neutral-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#F9FAFB] dark:bg-neutral-900 text-gray-500 dark:text-gray-400 transition-colors duration-300">Or paste text</span>
            </div>
          </div>

          <textarea
            className="w-full h-64 p-4 rounded-xl border border-gray-200 dark:border-neutral-700 focus:border-primary-500 focus:ring-4 focus:ring-primary-50 dark:focus:ring-primary-900/20 outline-none resize-none text-sm font-mono text-gray-700 dark:text-gray-300 bg-white dark:bg-neutral-900 transition-colors duration-300"
            placeholder="Paste your resume content here..."
            value={text}
            onChange={(e) => {
                setText(e.target.value);
                setFile(null); // Clear file if text is entered
            }}
          ></textarea>

          <button
            onClick={analyze}
            disabled={isLoading || (!text && !file)}
            className="w-full bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-primary-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                Analyze Resume
              </>
            )}
          </button>
        </div>

        <div className="space-y-6">
          {!isLoading && !result && !error && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border border-gray-100 dark:border-neutral-700 rounded-xl bg-white dark:bg-neutral-800 text-center transition-colors duration-300">
              <div className="w-16 h-16 bg-gray-50 dark:bg-neutral-900/50 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-gray-300 dark:text-gray-600" />
              </div>
              <p className="font-medium text-gray-900 dark:text-gray-100">No Analysis Yet</p>
              <p className="text-sm mt-1">Upload your resume and define a role to see your ATS score.</p>
            </div>
          )}

          {error && (
            <div className="h-full flex flex-col items-center justify-center text-red-400 p-8 border border-red-100 dark:border-red-900/30 rounded-xl bg-red-50 dark:bg-red-900/10 text-center transition-colors duration-300">
              <AlertCircle className="w-10 h-10 mb-2 text-red-500 dark:text-red-400" />
              <p className="font-bold text-red-800 dark:text-red-200">Analysis Failed</p>
              <p className="text-sm text-red-600 dark:text-red-300 mt-1">{error}</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in-up">
              {/* Score Card */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm flex items-center justify-between transition-colors duration-300">
                <div>
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">ATS Score</p>
                  <h2 className={`text-4xl font-bold mt-1 ${result.score >= 80 ? 'text-green-600 dark:text-green-400' : result.score >= 60 ? 'text-orange-500 dark:text-orange-400' : 'text-red-500 dark:text-red-400'}`}>
                    {result.score}/100
                  </h2>
                </div>
                <div className="w-20 h-20 relative">
                  <svg viewBox="0 0 36 36" className="w-full h-full transform -rotate-90">
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      className="text-gray-100 dark:text-neutral-700"
                      strokeWidth="3"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke={result.score >= 80 ? '#10b981' : result.score >= 60 ? '#f97316' : '#ef4444'}
                      strokeWidth="3"
                      strokeDasharray={`${result.score}, 100`}
                    />
                  </svg>
                </div>
              </div>

              {/* Matched Skills - Replaced Summary */}
              {result.matched && result.matched.length > 0 && (
                 <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm transition-colors duration-300">
                   <h3 className="font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                     <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                     Matched Skills
                   </h3>
                   <div className="flex flex-wrap gap-2">
                     {result.matched.map((kw, i) => (
                       <span key={i} className="px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 text-sm font-medium rounded-full border border-green-100 dark:border-green-800">
                         {kw}
                       </span>
                     ))}
                   </div>
                 </div>
              )}

              {/* Missing Keywords */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm transition-colors duration-300">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                  Missing Keywords
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.missing?.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm font-medium rounded-full border border-red-100 dark:border-red-800">
                      {kw}
                    </span>
                  ))}
                  {(!result.missing || result.missing.length === 0) && (
                      <span className="text-gray-500 dark:text-gray-400 text-sm">No missing keywords found!</span>
                  )}
                </div>
              </div>

              {/* Feedback */}
              <div className="bg-white dark:bg-neutral-800 p-6 rounded-xl border border-gray-100 dark:border-neutral-700 shadow-sm transition-colors duration-300">
                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500 dark:text-blue-400" />
                  AI Feedback
                </h3>
                 <ul className="space-y-2">
                    {result.tips?.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400 transition-colors duration-300">
                        <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1.5 flex-shrink-0"></div>
                        {improvement}
                      </li>
                    ))}
                  </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeATS;