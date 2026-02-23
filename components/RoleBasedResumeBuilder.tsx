import React, { useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { GoogleGenAI, Type } from "@google/genai";
import { jsPDF } from 'jspdf';
import { Upload, FileText, Download, Sparkles, CheckCircle, AlertCircle, ArrowLeft, ArrowRight } from './ui/Icons';
import { motion, AnimatePresence } from 'framer-motion';

// Set worker source for pdf.js to a stable CDN location matching the pinned version
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@4.4.168/build/pdf.worker.min.mjs`;

interface TailoredResume {
    optimized_resume: string;
    matched_skills: string[];
    missing_skills: string[];
    ats_score_estimate: number;
    skill_gap_roadmap: string[];
    pdf_download_url: string;
}

const RoleBasedResumeBuilder: React.FC = () => {
    const [step, setStep] = useState(1);
    const [file, setFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [jobDescription, setJobDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [tailoredResume, setTailoredResume] = useState<TailoredResume | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);

            if (selectedFile.type === 'application/pdf') {
                try {
                    const arrayBuffer = await selectedFile.arrayBuffer();
                    const loadingTask = pdfjsLib.getDocument(new Uint8Array(arrayBuffer));
                    const pdf = await loadingTask.promise;
                    let fullText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        // @ts-ignore
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        fullText += pageText + '\n';
                    }
                    setResumeText(fullText);
                } catch (error) {
                    console.error("Error parsing PDF:", error);
                    setError("Failed to parse PDF. Please ensure it is a valid text-based PDF.");
                }
            } else {
                const reader = new FileReader();
                reader.onload = (ev) => {
                    if (typeof ev.target?.result === 'string') {
                        setResumeText(ev.target.result);
                    }
                };
                reader.readAsText(selectedFile);
            }
        }
    };

    const handleTailorResume = async () => {
        if (!resumeText || !jobDescription) return;
        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch("http://localhost:8000/api/optimize-resume", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resume_text: resumeText,
                    job_description: jobDescription,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.detail || "Failed to optimize resume");
            }

            const data: TailoredResume = await res.json();
            console.log("Tailored Resume Data:", data);
            setTailoredResume(data);
            setStep(3);

            // Note: We'll let the user click Download PDF instead of auto-opening
        } catch (err: any) {
            console.error("Tailoring failed:", err);
            setError(`Tailoring failed: ${err.message || 'Unknown error'}. Please check if the backend is running.`);
        } finally {
            setIsLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!tailoredResume) return;
        window.open(`http://localhost:8000${tailoredResume.pdf_download_url}`, "_blank");
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Role-Based Resume Builder</h1>
                <p className="text-gray-500 mt-2">Tailor your resume for specific job roles to boost your ATS score.</p>
            </div>

            {/* Stepper */}
            <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto px-4">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center group">
                        <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all
              ${step === s ? 'bg-primary-600 text-white ring-4 ring-primary-100' :
                                step > s ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}
            `}>
                            {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                        </div>
                        {s < 3 && (
                            <div className={`w-24 h-1 mx-4 rounded ${step > s ? 'bg-green-500' : 'bg-gray-100'}`} />
                        )}
                    </div>
                ))}
            </div>

            <AnimatePresence mode="wait">
                {step === 1 && (
                    <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm text-center"
                    >
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-primary-600">
                                <Upload className="w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload your current resume</h2>
                            <p className="text-gray-500 mb-8">We'll extract your details and prepare them for tailoring.</p>

                            <div className="relative border-2 border-dashed border-gray-200 rounded-2xl p-10 hover:border-primary-400 transition-colors group cursor-pointer">
                                <input type="file" accept=".pdf,.txt" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4 group-hover:text-primary-500" />
                                <p className="text-gray-600 font-medium">{file ? file.name : "Select a PDF or TXT file"}</p>
                            </div>

                            <button
                                onClick={() => setStep(2)}
                                disabled={!resumeText}
                                className="mt-8 w-full bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                            >
                                Continue to Job Info
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}

                {step === 2 && (
                    <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="bg-white rounded-3xl border border-gray-100 p-12 shadow-sm"
                    >
                        <div className="max-w-2xl mx-auto">
                            <div className="text-center mb-10">
                                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-600">
                                    <Sparkles className="w-8 h-8" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900">What are you applying for?</h2>
                                <p className="text-gray-500">Paste the job description or role requirements below.</p>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Job Description / Requirements</label>
                                    <textarea
                                        className="w-full h-80 p-6 rounded-2xl border border-gray-200 focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all outline-none text-gray-700 leading-relaxed"
                                        placeholder="Paste the target job description here..."
                                        value={jobDescription}
                                        onChange={(e) => setJobDescription(e.target.value)}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setStep(1)}
                                        className="flex-1 border border-gray-200 text-gray-600 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-gray-50 transition-all"
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        Back
                                    </button>
                                    <button
                                        onClick={handleTailorResume}
                                        disabled={isLoading || !jobDescription.trim()}
                                        className="flex-[2] bg-primary-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 disabled:opacity-50 transition-all shadow-lg shadow-primary-200"
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing with AI...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5" />
                                                Tailor My Resume
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {step === 3 && tailoredResume && (
                    <motion.div
                        key="step3"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="space-y-6"
                    >
                        <div className="bg-white rounded-3xl border border-gray-200 p-6 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-green-50 text-green-600 rounded-full flex items-center justify-center">
                                    <CheckCircle className="w-8 h-8" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">Your tailored resume is ready!</h2>
                                    <p className="text-gray-500">We've optimized it for the target role.</p>
                                </div>
                            </div>
                            <div className="flex gap-3 w-full md:w-auto">
                                <button
                                    onClick={() => setStep(2)}
                                    className="flex-1 md:flex-none px-6 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all"
                                >
                                    Adjust Input
                                </button>
                                <button
                                    onClick={downloadPDF}
                                    className="flex-1 md:flex-none px-8 py-3 bg-primary-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all"
                                >
                                    <Download className="w-5 h-5" />
                                    Download PDF
                                </button>
                            </div>
                        </div>

                        {/* Resume Preview */}
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12 max-w-4xl mx-auto font-serif">
                            <div className="flex justify-between items-start mb-8 border-b pb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-1">Tailored Resume</h2>
                                    <p className="text-gray-500 text-sm italic">Formatted for maximum ATS compatibility</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">ATS Score Estimate</div>
                                    <div className="text-4xl font-black text-primary-600">{tailoredResume?.ats_score_estimate ?? 0}%</div>
                                </div>
                            </div>

                            <section className="mb-8">
                                <h3 className="text-lg font-bold uppercase tracking-wider text-primary-800 mb-3 border-b-2 border-primary-50 pb-1">Optimized Content</h3>
                                <pre className="text-gray-700 leading-relaxed text-sm whitespace-pre-wrap font-serif">
                                    {tailoredResume?.optimized_resume || "No content generated."}
                                </pre>
                            </section>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <section>
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-green-800 mb-3 border-b-2 border-green-50 pb-1 flex items-center gap-2">
                                        <CheckCircle className="w-4 h-4" /> Matched Skills
                                    </h3>
                                    <div className="flex flex-wrap gap-2 pt-2">
                                        {(tailoredResume?.matched_skills || []).map((skill, i) => (
                                            <span key={i} className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg border border-green-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>
                                </section>
                                <section>
                                    <h3 className="text-lg font-bold uppercase tracking-wider text-orange-800 mb-3 border-b-2 border-orange-50 pb-1 flex items-center gap-2">
                                        <Sparkles className="w-4 h-4" /> Skill Gap Roadmap
                                    </h3>
                                    <div className="space-y-4 pt-1">
                                        <ol className="list-decimal list-inside space-y-2">
                                            {(tailoredResume?.skill_gap_roadmap || []).map((step, i) => (
                                                <li key={i} className="text-gray-700 text-sm leading-relaxed">{step}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </section>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {error && (
                <div className="mt-8 bg-red-50 border border-red-100 rounded-2xl p-6 flex items-start gap-4 text-red-700">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" />
                    <div>
                        <p className="font-bold">Something went wrong</p>
                        <p className="text-sm opacity-90 mt-1">{error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleBasedResumeBuilder;
