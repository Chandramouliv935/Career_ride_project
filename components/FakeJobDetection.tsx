import React, { useState } from 'react';
import { ShieldAlert, CheckCircle, AlertCircle, Sparkles } from './ui/Icons';

const FakeJobDetection: React.FC = () => {
    const [mode, setMode] = useState<'text' | 'url'>('text');
    const [jobText, setJobText] = useState('');
    const [jobUrl, setJobUrl] = useState('');
    const [result, setResult] = useState<{ is_fake: boolean; confidence: number; risk_score: number; message: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDetect = async () => {
        const payload = mode === 'text' ? { text: jobText } : { url: jobUrl };
        const isValid = mode === 'text' ? jobText.trim() : jobUrl.trim();

        if (!isValid) return;

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const response = await fetch('http://localhost:8000/api/detect', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ detail: 'Failed to analyze job posting.' }));
                throw new Error(errorData.detail || 'Failed to connect to detection service.');
            }

            const data = await response.json();
            setResult(data);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600">
                        <ShieldAlert className="w-7 h-7" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Fake Job Detection</h1>
                        <p className="text-gray-500">Analyze job descriptions or URLs to detect potential scams using our custom ML model.</p>
                    </div>
                </div>

                <div className="flex gap-2 mb-6 p-1 bg-gray-50 rounded-xl w-fit">
                    <button
                        onClick={() => setMode('text')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'text' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Paste Text
                    </button>
                    <button
                        onClick={() => setMode('url')}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${mode === 'url' ? 'bg-white shadow-sm text-primary-700' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Job URL
                    </button>
                </div>

                <div className="space-y-4">
                    {mode === 'text' ? (
                        <div>
                            <label htmlFor="job-text" className="block text-sm font-medium text-gray-700 mb-2">
                                Job Description / Posting Text
                            </label>
                            <textarea
                                id="job-text"
                                rows={8}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none resize-none"
                                placeholder="Paste the job description here..."
                                value={jobText}
                                onChange={(e) => setJobText(e.target.value)}
                            />
                        </div>
                    ) : (
                        <div>
                            <label htmlFor="job-url" className="block text-sm font-medium text-gray-700 mb-2">
                                Job Posting URL
                            </label>
                            <input
                                id="job-url"
                                type="url"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                                placeholder="https://linkedin.com/jobs/view/..."
                                value={jobUrl}
                                onChange={(e) => setJobUrl(e.target.value)}
                            />
                        </div>
                    )}

                    <button
                        onClick={handleDetect}
                        disabled={isLoading || (mode === 'text' ? !jobText.trim() : !jobUrl.trim())}
                        className={`
              w-full py-3.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all
              ${isLoading || (mode === 'text' ? !jobText.trim() : !jobUrl.trim())
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-200'}
            `}
                    >
                        {isLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Analyze Job Posting
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            {result && (
                <div className={`
          rounded-2xl border p-8 animate-in zoom-in-95 duration-300
          ${result.is_fake
                        ? 'bg-red-50 border-red-100'
                        : 'bg-green-50 border-green-100'}
        `}>
                    <div className="flex items-center gap-4 mb-4">
                        <div className={`
              w-12 h-12 rounded-full flex items-center justify-center
              ${result.is_fake ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}
            `}>
                            {result.is_fake ? <ShieldAlert className="w-6 h-6" /> : <CheckCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className={`text-xl font-bold ${result.is_fake ? 'text-red-900' : 'text-green-900'}`}>
                                {result.message}
                            </h3>
                            <div className="space-y-1">
                                <p className={`text-sm ${result.is_fake ? 'text-red-700' : 'text-green-700'}`}>
                                    AI Probability: {result.confidence}%
                                </p>
                                <p className={`text-sm font-semibold ${result.is_fake ? 'text-red-800' : 'text-green-800'}`}>
                                    Rule Score: {result.risk_score}
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className={`text-sm leading-relaxed ${result.is_fake ? 'text-red-800' : 'text-green-800'}`}>
                        {result.is_fake
                            ? "This posting shows patterns commonly associated with recruitment scams, such as unrealistic salary promises or requests for sensitive information. Proceed with extreme caution."
                            : "This posting appears to follow standard professional job descriptions. However, always perform your due diligence before sharing personal information."}
                    </p>
                </div>
            )}
        </div>
    );
};

export default FakeJobDetection;
