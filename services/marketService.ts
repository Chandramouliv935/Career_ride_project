export interface MarketIntelligence {
    query: string;
    location: string;
    market_analysis: {
        total_jobs_estimate: string | number;
        top_trending_roles: string[];
        trending_skills: string[];
        remote_demand_percentage_estimate: string | number;
        salary_range_summary: string;
        market_growth_indicator: "Low" | "Medium" | "High";
        raw_llm_output?: string;
    } | { error: string };
}

export const MarketService = {
    async getMarketIntelligence(query: string = "Software Engineer", location: string = "India"): Promise<MarketIntelligence | { error: string }> {
        try {
            const response = await fetch(`http://127.0.0.1:8001/market-intelligence?query=${encodeURIComponent(query)}&location=${encodeURIComponent(location)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error("Failed to fetch market intelligence:", error);
            return { error: error instanceof Error ? error.message : "Unknown error" };
        }
    }
};
