// ATS Client Implementation

export interface ATSAnalysisResult {
  score: number;
  matched: string[];
  missing: string[];
  tips: string[];
}

export interface AnalyzeResumeParams {
  file?: File | null;
  text?: string;
  role: string;
}

export const analyzeResume = async (
  { file, text, role }: AnalyzeResumeParams,
  signal?: AbortSignal,
): Promise<ATSAnalysisResult> => {
  // 90 seconds timeout
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), 90000);

  // Combine signals
  const combinedSignal = signal || timeoutController.signal;
  if (signal) {
    signal.addEventListener("abort", () => {
      clearTimeout(timeoutId);
      timeoutController.abort();
    });
  }

  try {
    const formData = new FormData();
    if (file) formData.append("file", file);
    if (text) formData.append("text", text);
    formData.append("role", role);

    const response = await fetch(
      "http://localhost:5678/webhook/smart-opportunities",
      {
        method: "POST",
        body: formData,
        signal: combinedSignal,
      },
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error("AI service unavailable");
    }

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      throw new Error("Server returned invalid analysis");
    }

    // Schema validation
    if (
      !data ||
      typeof data !== "object" ||
      typeof data.ats_score !== "number" ||
      !Array.isArray(data.matched_skills) ||
      !Array.isArray(data.missing_skills) ||
      !Array.isArray(data.improvements)
    ) {
      throw new Error("Analysis format error");
    }

    return {
      score: data.ats_score,
      matched: data.matched_skills,
      missing: data.missing_skills,
      tips: data.improvements,
    };
  } catch (error: unknown) {
    clearTimeout(timeoutId);

    // If it's an abort error from our timeout, it's a service unavailable
    if (timeoutController.signal.aborted && !signal?.aborted) {
      throw new Error("AI service unavailable");
    }

    if (error instanceof Error) {
      if (
        error.message === "Server returned invalid analysis" ||
        error.message === "Analysis format error"
      ) {
        throw error;
      }
      // Pass through if it is already our custom error
      if (error.message === "AI service unavailable") {
        throw error;
      }
    }

    // If user cancelled, we might want to throw that, or handle it.
    // Usually rethrow abort errors so React knows it was cancelled.
    if (signal?.aborted) {
      throw error;
    }

    throw new Error("AI service unavailable");
  }
};
