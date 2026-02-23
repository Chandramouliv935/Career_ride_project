import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  MapPin,
  Smartphone,
  Search,
  ExternalLink,
  Globe,
  Building2,
  CheckCircle,
  AlertCircle,
  Users,
  Filter,
  ShieldCheck,
} from "./ui/Icons";
import govtData from "../govt.json";
import smartData from "../data/Smart-Opportunities.json";
import remoteData from "../data/Remote-jobs.json";

// Types for API responses
interface ResumeAnalysisResult {
  skills_detected: string[];
  experience_level: string;
  location_detected: string;
  recommended_jobs_local: LocalJob[];
  recommended_jobs_low_device: LowDeviceJob[];
}

interface LocalJob {
  id: string;
  title: string;
  company: string;
  distance: string;
  required_skills_match: number;
  apply_link: string;
  location: string;
}

interface LowDeviceJob {
  id: string;
  title: string;
  company: string;
  qualification_reason: string;
  device_level: "Basic" | "Low" | "Medium";
  apply_link: string;
}

interface GovernmentScheme {
  id: string;
  name: string;
  provider: string;
  eligibility: string;
  benefits: string;
  apply_link: string;
  type: "state" | "central";
}

interface SchemesResponse {
  state_schemes: any[];
  central_schemes: any[];
}

// File Upload Component
const FileUploadArea: React.FC<{
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  uploadedFileName: string | null;
}> = ({ onFileSelect, isUploading, uploadedFileName }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileValidation(files[0]);
    }
  };

  const handleFileValidation = (file: File) => {
    const validTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      alert("Please upload a PDF or DOCX file");
      return;
    }

    if (file.size > maxSize) {
      alert("File size must be less than 5MB");
      return;
    }

    onFileSelect(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileValidation(files[0]);
    }
  };

  if (uploadedFileName) {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-2xl">
        <FileText className="w-5 h-5 text-green-600" />
        <span className="text-sm font-medium text-green-800">
          {uploadedFileName}
        </span>
        <button
          onClick={() => fileInputRef.current?.click()}
          className="ml-auto text-xs text-green-600 hover:text-green-700 font-medium"
        >
          Change File
        </button>
      </div>
    );
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
        isDragOver
          ? "border-primary-500 bg-primary-50"
          : "border-gray-200 hover:border-gray-300 bg-gray-50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {isUploading ? (
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-gray-600">
            Uploading resume...
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3">
          <Upload className="w-8 h-8 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Drag & drop your resume here
            </p>
            <p className="text-xs text-gray-500 mt-1">PDF or DOCX (max 5MB)</p>
          </div>
          <button className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-xl hover:bg-primary-700 transition-colors">
            Browse Files
          </button>
        </div>
      )}
    </div>
  );
};

// Smart Opportunities Module
const SmartOpportunitiesModule: React.FC = () => {
  const [selectedState, setSelectedState] = useState("Tamil Nadu");
  const [selectedDistrict, setSelectedDistrict] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [activeTab, setActiveTab] = useState<"nearby" | "remote">("nearby");

  // Extract all unique districts and categories
  const districts = smartData.smart_opportunities.map((d) => d.district).sort();
  const categories = Array.from(
    new Set(
      smartData.smart_opportunities.flatMap((d) =>
        d.opportunities.map((o) => o.sector),
      ),
    ),
  ).sort();

  // Filter Nearby Jobs
  const filteredNearbyJobs = smartData.smart_opportunities
    .filter(
      (d) => selectedDistrict === "all" || d.district === selectedDistrict,
    )
    .flatMap((d) =>
      d.opportunities.map((o) => ({ ...o, district: d.district })),
    )
    .filter((o) => selectedCategory === "all" || o.sector === selectedCategory);

  // Filter Remote Jobs
  const filteredRemoteJobs = remoteData.districts
    .filter(
      (d) => selectedDistrict === "all" || d.district === selectedDistrict,
    )
    .flatMap((d) =>
      d.remote_opportunities.map((o) => ({ ...o, district: d.district })),
    )
    .filter((o) => selectedCategory === "all" || o.sector === selectedCategory);

  const totalCount = filteredNearbyJobs.length + filteredRemoteJobs.length;

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shadow-sm border border-blue-100">
          <Search className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Smart Opportunities
          </h2>
          <p className="text-gray-500 font-medium tracking-tight">
            Found {totalCount} opportunities for you in {selectedState}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            State
          </label>
          <div className="relative">
            <select
              value={selectedState}
              disabled
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-gray-50 text-gray-600 font-medium appearance-none cursor-not-allowed"
            >
              <option value="Tamil Nadu">Tamil Nadu</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            District
          </label>
          <div className="relative">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
            >
              <option value="all">All Districts</option>
              {districts.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700 ml-1">
            Category
          </label>
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border border-gray-200 bg-white text-gray-700 font-medium appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-300"
            >
              <option value="all">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
              <Filter className="w-4 h-4" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 mb-8 bg-gray-50/80 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab("nearby")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === "nearby"
              ? "bg-white shadow-md text-blue-600 scale-105"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Nearby Jobs ({filteredNearbyJobs.length})
        </button>
        <button
          onClick={() => setActiveTab("remote")}
          className={`px-6 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
            activeTab === "remote"
              ? "bg-white shadow-md text-blue-600 scale-105"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Remote Jobs ({filteredRemoteJobs.length})
        </button>
      </div>

      {/* Content List */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
        >
          {activeTab === "nearby" ? (
            filteredNearbyJobs.length > 0 ? (
              filteredNearbyJobs.map((job, idx) => (
                <div
                  key={idx}
                  className="group border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-white relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg mb-1">
                          {job.name}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-blue-100">
                            {job.sector}
                          </span>
                        </div>
                      </div>
                      <a
                        href={job.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 bg-gray-50 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                      >
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-blue-500" />
                      </div>
                      <span className="font-medium">{job.district}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-800">
                  No Nearby Jobs Found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your district or category filters
                </p>
              </div>
            )
          ) : filteredRemoteJobs.length > 0 ? (
            filteredRemoteJobs.map((job, idx) => (
              <div
                key={idx}
                className="group border border-gray-100 rounded-2xl p-6 hover:shadow-xl hover:border-blue-100 transition-all duration-300 bg-white relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -mr-12 -mt-12 opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="font-bold text-gray-900 text-lg mb-1">
                        {job.role}
                      </h4>
                      <p className="text-sm font-medium text-gray-500 mb-2">
                        {job.company}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-purple-100">
                          {job.sector}
                        </span>
                        <span className="px-2.5 py-1 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-wider rounded-lg border border-green-100">
                          {job.work_type}
                        </span>
                      </div>
                    </div>
                    <a
                      href={job.company_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 bg-gray-50 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                    >
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                    <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center">
                      <Globe className="w-4 h-4 text-purple-500" />
                    </div>
                    <span className="font-medium">Hub: {job.district}</span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              <Globe className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-gray-800">
                No Remote Jobs Found
              </h3>
              <p className="text-gray-500">Try adjusting your filters</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Government Schemes Module
const GovernmentSchemesModule: React.FC = () => {
  const [selectedState, setSelectedState] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedEligibility, setSelectedEligibility] = useState("all");
  const [schemes, setSchemes] = useState<SchemesResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const states = [
    "Andhra Pradesh",
    "Arunachal Pradesh",
    "Assam",
    "Bihar",
    "Chhattisgarh",
    "Goa",
    "Gujarat",
    "Haryana",
    "Himachal Pradesh",
    "Jharkhand",
    "Karnataka",
    "Kerala",
    "Madhya Pradesh",
    "Maharashtra",
    "Manipur",
    "Meghalaya",
    "Mizoram",
    "Nagaland",
    "Odisha",
    "Punjab",
    "Rajasthan",
    "Sikkim",
    "Tamil Nadu",
    "Telangana",
    "Tripura",
    "Uttar Pradesh",
    "Uttarakhand",
    "West Bengal"
  ];

  const categories = [
    "Education",
    "Employment",
    "Startup",
    "Skill Training",
    "Scholarship",
  ];

  const eligibilityOptions = [
    "Student",
    "Graduate",
    "Unemployed",
    "Women",
    "Rural",
    "Disabled",
  ];

  const fetchSchemes = () => {
    setIsLoading(true);
    try {
      const central = govtData.central_schemes.map((s) => ({
        id: s.id,
        name: s.name,
        provider: s.ministry,
        eligibility: s.eligibility,
        benefits: s.benefits,
        apply_link: "#",
        type: "central",
      }));

      let stateSchemes: any[] = [];
      if (selectedState !== "all") {
        const stateKey = states.find(
          (s) => s.toLowerCase().replace(/\s+/g, "-") === selectedState,
        );
        if (stateKey && (govtData.state_schemes as any)[stateKey]) {
          stateSchemes = (govtData.state_schemes as any)[stateKey].map(
            (s: any, idx: number) => ({
              id: `state-${idx}`,
              name: s.name,
              provider: stateKey,
              eligibility: "Residents of " + stateKey,
              benefits: s.benefits,
              apply_link: "#",
              type: "state",
            }),
          );
        }
      }

      setSchemes({
        state_schemes: stateSchemes,
        central_schemes: central,
      });
    } catch (error) {
      console.error("Error loading schemes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchSchemes();
  }, [selectedState]);

  const SchemeCard: React.FC<{ scheme: GovernmentScheme }> = ({ scheme }) => (
    <div className="border border-gray-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3 mb-3">
        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            scheme.type === "state"
              ? "bg-blue-50 text-blue-600"
              : "bg-orange-50 text-orange-600"
          }`}
        >
          {scheme.type === "state" ? (
            <Building2 className="w-5 h-5" />
          ) : (
            <Globe className="w-5 h-5" />
          )}
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 mb-1">{scheme.name}</h4>
          <p className="text-sm text-gray-500">{scheme.provider}</p>
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{scheme.eligibility}</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-gray-400" />
          <span className="text-sm text-gray-600">{scheme.benefits}</span>
        </div>
      </div>

      <a
        href={scheme.apply_link}
        className="w-full px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium rounded-xl transition-colors block text-center"
      >
        View Scheme Details
      </a>
    </div>
  );

  return (
    <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
          <Building2 className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            Government Opportunities
          </h2>
          <p className="text-sm text-gray-500">
            State and Central government schemes
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            State
          </label>
          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">Select State</option>
            {states
              .filter((s) => s !== "All India")
              .map((state) => (
                <option
                  key={state}
                  value={state.toLowerCase().replace(/\s+/g, "-")}
                >
                  {state}
                </option>
              ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">All Categories</option>
            {categories.map((category) => (
              <option
                key={category}
                value={category.toLowerCase().replace(/\s+/g, "-")}
              >
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Eligibility
          </label>
          <select
            value={selectedEligibility}
            onChange={(e) => setSelectedEligibility(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="all">All Eligibility</option>
            {eligibilityOptions.map((option) => (
              <option
                key={option}
                value={option.toLowerCase().replace(/\s+/g, "-")}
              >
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">Loading schemes...</p>
        </div>
      ) : (
        schemes && (
          <div className="space-y-8">
            {/* State Schemes */}
            {schemes.state_schemes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-blue-600" />
                  State Schemes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schemes.state_schemes.map((scheme) => (
                    <SchemeCard key={scheme.id} scheme={scheme} />
                  ))}
                </div>
              </div>
            )}

            {/* Central Schemes */}
            {schemes.central_schemes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-orange-600" />
                  Central Government Schemes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {schemes.central_schemes.map((scheme) => (
                    <SchemeCard key={scheme.id} scheme={scheme} />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {schemes.state_schemes.length === 0 &&
              schemes.central_schemes.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No schemes found
                  </h3>
                  <p className="text-sm text-gray-500">
                    Try adjusting your filters to see more results.
                  </p>
                </div>
              )}
          </div>
        )
      )}
    </div>
  );
};

// Mode Selector Component
const ModeSelector: React.FC<{
  activeMode: "smart" | "government";
  onModeChange: (mode: "smart" | "government") => void;
}> = ({ activeMode, onModeChange }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
    <button
      onClick={() => onModeChange("smart")}
      className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${
        activeMode === "smart"
          ? "bg-primary-600 text-white border-primary-600 shadow-xl scale-105"
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      <div
        className={`p-4 rounded-2xl transition-colors ${
          activeMode === "smart"
            ? "bg-white/20"
            : "bg-gray-50 group-hover:bg-primary-50"
        }`}
      >
        <Search
          className={`w-8 h-8 ${activeMode === "smart" ? "text-white" : "text-gray-400 group-hover:text-primary-600"}`}
        />
      </div>
      <span
        className={`font-bold text-xl transition-colors ${activeMode === "smart" ? "text-white" : "text-gray-700"}`}
      >
        Smart Opportunities
      </span>
      <p
        className={`text-sm ${activeMode === "smart" ? "text-white/80" : "text-gray-500"}`}
      >
        Local Opportunities/Low-End Device Jobs
      </p>
    </button>

    <button
      onClick={() => onModeChange("government")}
      className={`p-8 rounded-3xl border-2 transition-all flex flex-col items-center gap-4 group ${
        activeMode === "government"
          ? "bg-orange-600 text-white border-orange-600 shadow-xl scale-105"
          : "bg-white border-gray-100 hover:border-gray-200"
      }`}
    >
      <div
        className={`p-4 rounded-2xl transition-colors ${
          activeMode === "government"
            ? "bg-white/20"
            : "bg-gray-50 group-hover:bg-orange-50"
        }`}
      >
        <Building2
          className={`w-8 h-8 ${activeMode === "government" ? "text-white" : "text-gray-400 group-hover:text-orange-600"}`}
        />
      </div>
      <span
        className={`font-bold text-xl transition-colors ${activeMode === "government" ? "text-white" : "text-gray-700"}`}
      >
        Government Opportunities
      </span>
      <p
        className={`text-sm ${activeMode === "government" ? "text-white/80" : "text-gray-500"}`}
      >
        State and Central government schemes
      </p>
    </button>
  </div>
);

// Main Component
const OpportunityAccessibility: React.FC = () => {
  const [activeMode, setActiveMode] = useState<"smart" | "government">("smart");

  return (
    <div className="max-w-6xl mx-auto p-6 lg:p-10">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Opportunity Accessibility
        </h1>
        <p className="text-gray-500 text-lg mt-3 font-medium">
          Equitable access to career pathways for everyone, everywhere.
        </p>
      </div>

      {/* Mode Selector */}
      <ModeSelector activeMode={activeMode} onModeChange={setActiveMode} />

      {/* Content Panel */}
      <div className="min-h-[400px]">
        <AnimatePresence mode="wait">
          {activeMode === "smart" ? (
            <motion.div
              key="smart"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <SmartOpportunitiesModule />
            </motion.div>
          ) : (
            <motion.div
              key="government"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <GovernmentSchemesModule />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Accessibility Note */}
      <div className="mt-12 p-8 rounded-3xl bg-gradient-to-br from-gray-50 to-primary-50 border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary-600 shadow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">
              Designed for Everyone
            </h3>
            <p className="text-sm text-gray-600">
              Our platform is built with accessibility in mind, ensuring that
              career opportunities are available to all users regardless of
              their device capabilities or location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OpportunityAccessibility;
