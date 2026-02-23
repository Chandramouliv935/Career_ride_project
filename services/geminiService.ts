/**
 * MOCK API SERVICE
 *
 * This service simulates responses from the Gemini API without making actual API calls.
 * This is useful for UI development and testing when an API key is not available.
 * The data returned is hardcoded to match the expected structure of the real API responses.
 */

// A helper to simulate network latency
const mockApiCall = (data: any, delay = 500): Promise<any> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export const GeminiService = {
  /**
   * Simulates analyzing a resume and returning an ATS score and feedback.
   */
  async analyzeResume(resumeText: string, jobRole: string) {
    console.log(`[Mock] Analyzing resume for role: ${jobRole}`);
    
    const mockData = {
      score: 85,
      missingKeywords: ['CI/CD', 'Docker', 'Kubernetes'],
      feedback: 'Your resume is strong in front-end technologies. Consider adding more keywords related to DevOps and cloud infrastructure to better match senior roles. The project descriptions are well-written but could be more results-oriented. Quantify your achievements where possible.',
      summary: 'A strong candidate with excellent front-end skills. Lacks explicit mention of DevOps tooling which is common in many job descriptions.'
    };
    
    return mockApiCall(mockData);
  },

  /**
   * Simulates generating job market trends based on a user profile.
   */
  async generateJobTrends(profile: string) {
    console.log(`[Mock] Generating job trends for profile: ${profile}`);
    
    const mockData = {
      trendingRoles: [
        { name: 'AI/ML Engineer', growth: '+25%' },
        { name: 'Data Scientist', growth: '+21%' },
        { name: 'Cybersecurity Analyst', growth: '+19%' }
      ],
      salaryRanges: [
        { role: 'Software Engineer', min: 60000, max: 90000 },
        { role: 'Data Analyst', min: 55000, max: 80000 },
        { role: 'Product Manager', min: 75000, max: 110000 }
      ],
      boomingJobs: ['Cloud Solutions Architect', 'Blockchain Developer', 'UX/UI Designer']
    };

    return mockApiCall(mockData);
  },

  /**
   * Simulates fetching interview questions for a specific role.
   */
  async getInterviewQuestions(role: string) {
    console.log(`[Mock] Fetching interview questions for role: ${role}`);
    
    const mockData = [
      { id: 1, text: 'Explain the difference between virtual DOM and shadow DOM.', type: 'Technical' },
      { id: 2, text: 'Describe a challenging project you worked on and how you overcame obstacles.', type: 'Behavioral' },
      { id: 3, text: 'How would you optimize a slow-loading web page?', type: 'Technical' },
      { id: 4, text: 'Tell me about a time you had a disagreement with a team member.', type: 'Behavioral' },
      { id: 5, text: 'What are the benefits of using a state management library like Redux?', type: 'Technical' }
    ];

    // The original component expects the array of questions directly.
    return mockApiCall(mockData);
  }
};