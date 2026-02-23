import React, { useState, useRef, useEffect } from 'react';
import { Upload, CheckCircle, AlertCircle, FileText, Target, X, Check } from './ui/Icons';
import { analyzeResume, ATSAnalysisResult } from '../lib/atsClient';

const ResumeATSAnalyzer: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [jobRole, setJobRole] = useState('Software Engineer');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ATSAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

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

  const handleAnalyzeResume = async () => {
    if (!file) {
      setError('Please select a resume file');
      return;
    }

    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    setError(null);
    setResult(null);
    setProgress(0);

    // Simulate progress for visual feedback
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 5;
      });
    }, 1000);

    try {
      const data = await analyzeResume(
        { 
          file, 
          role: jobRole 
        }, 
        controller.signal
      );

      clearInterval(progressInterval);
      setProgress(100);
      setResult(data);
    } catch (err: unknown) {
      clearInterval(progressInterval);
      setProgress(0);

      if (err instanceof Error) {
        // Don't show error if it was cancelled
        if (err.name === 'AbortError') {
          return; 
        }
        setError(err.message);
      } else {
        setError('An unexpected error occurred');
      }
    } finally {
      // Only turn off loading if this is still the active request
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
        abortControllerRef.current = null;
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
        setError('File size must be less than 10MB');
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Resume ATS Analyzer</h1>
        <p className="text-gray-500 mt-1">Analyze your resume with AI-powered ATS scoring</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <label className="block text-sm font-medium text-gray-700 mb-2">Target Job Role</label>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50 outline-none"
              placeholder="e.g. Software Engineer"
            />
          </div>

          <div className="bg-white p-8 rounded-xl border border-dashed border-gray-300 hover:border-blue-500 transition-colors text-center">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 hover:bg-blue-50 transition-colors">
                <Upload className="w-8 h-8 text-gray-400 hover:text-blue-600" />
              </div>
              <p className="text-sm font-medium text-gray-900">
                {file ? file.name : "Click to upload PDF resume"}
              </p>
              <p className="text-xs text-gray-500 mt-1">Maximum file size: 10MB</p>
            </label>
          </div>

          {file && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-800 font-medium">{file.name} selected</span>
            </div>
          )}

          <button
            onClick={handleAnalyzeResume}
            disabled={!file || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Analyzing Resume...</span>
              </>
            ) : (
              <>
                <FileText className="w-5 h-5" />
                <span>Analyze Resume</span>
              </>
            )}
          </button>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {isLoading && (
            <div className="bg-white p-8 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <FileText className="w-8 h-8 text-blue-600 animate-pulse" />
                <div>
                  <h3 className="font-semibold text-gray-900">Analyzing Resume</h3>
                  <p className="text-sm text-gray-500">This may take up to 90 seconds...</p>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">{Math.round(progress)}% complete</p>
            </div>
          )}

          {!isLoading && !result && !error && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 border border-gray-100 rounded-xl bg-white text-center">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mb-4">
                <Target className="w-8 h-8 text-gray-300" />
              </div>
              <p className="font-medium text-gray-900">Upload Resume to Begin</p>
              <p className="text-sm mt-1">Select a PDF file and target role to see your ATS score</p>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">ATS Score</h3>
                  <div className={`text-4xl font-bold ${
                    result.score >= 80 ? 'text-green-600' : 
                    result.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {result.score}/100
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      result.score >= 80 ? 'bg-green-600' : 
                      result.score >= 60 ? 'bg-yellow-600' : 'bg-red-600'
                    }`}
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
              </div>

              {result.matched.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-600" />
                    Matched Skills ({result.matched.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matched.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full border border-green-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.missing.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <X className="w-5 h-5 text-red-600" />
                    Missing Skills ({result.missing.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missing.map((skill, i) => (
                      <span key={i} className="px-3 py-1 bg-red-50 text-red-700 text-sm font-medium rounded-full border border-red-200">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.tips.length > 0 && (
                <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                  <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    Suggested Improvements ({result.tips.length})
                  </h3>
                  <ul className="space-y-2">
                    {result.tips.map((improvement, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 flex-shrink-0"></div>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumeATSAnalyzer;
