"use client";
import { useState } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export default function ResumePage() {
  const [file, setFile] = useState(null);
  const [salary, setSalary] = useState(10); // In Lakhs
  const [role, setRole] = useState("Software Engineer (SWE)");

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [report, setReport] = useState(null);

  // Handle Drag and Drop
  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile);
    } else {
      alert("Only PDFs are supported for analysis.");
    }
  };

  // Format the salary display
  const formatSalary = (val) => {
    if (val >= 100) return `₹${(val / 100).toFixed(2)} Cr`;
    return `₹${val} Lakhs`;
  };

  const analyzeResume = async () => {
    if (!file) return alert("Upload a resume first.");

    setIsAnalyzing(true);
    setReport(null);

    // Note: In a real app, you'd use a library like pdf.js to extract text here.
    // We are simulating extraction for the API payload.
    const simulatedExtractedText = `${role} candidate with basic academic projects in Python, Next.js, and MySQL. Preparing for engineering entrance exams. No professional internships yet.`;

    try {
      const res = await fetch("/api/resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: simulatedExtractedText,
          jobRole: role,
          expectedSalary: formatSalary(salary),
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setReport(data);
      } else {
        throw new Error(data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Analysis failed. Check your API key.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0F111A] text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 border-b border-gray-800 pb-4">
          <h1 className="text-2xl font-bold text-white">
            HireWise Profile Setup
          </h1>
          <p className="text-[#9CA3AF] text-sm mt-1">
            Upload a current resume to personalize your interview practice.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area - Left (Span 2) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upload Zone */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-[#1A1D27] border-2 border-dashed border-gray-700 hover:border-[#8B5CF6] rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer"
            >
              <UploadCloud className="w-12 h-12 text-[#8B5CF6] mb-4" />
              <h3 className="text-lg font-bold mb-2">Upload your resume</h3>
              <p className="text-[#9CA3AF] text-sm mb-6">
                Drag and drop your file here or{" "}
                <span className="text-[#8B5CF6] hover:underline">browse</span>
              </p>
              <p className="text-xs text-gray-600">PDF up to 10 MB</p>

              {/* Hidden file input */}
              <input
                type="file"
                accept=".pdf"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-gray-700"
              >
                Browse files
              </label>
            </div>

            {/* Config & Analysis Trigger */}
            <div className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">
                  Target Role
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0F111A] border border-gray-700 rounded-lg p-3 outline-none focus:border-[#8B5CF6] text-sm"
                >
                  <option>Software Engineer (SWE)</option>
                  <option>AI / ML Engineer</option>
                  <option>Data Scientist</option>
                  <option>Financial Analyst</option>
                  <option>Chartered Accountant (CA)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex justify-between text-gray-300">
                  Expected Salary
                  <span className="text-[#8B5CF6] font-bold">
                    {formatSalary(salary)}
                  </span>
                </label>
                <input
                  type="range"
                  min="3"
                  max="200"
                  value={salary}
                  onChange={(e) => setSalary(Number(e.target.value))}
                  className="w-full accent-[#8B5CF6] h-2 mt-2"
                />
                <div className="flex justify-between text-[10px] text-gray-500 mt-2">
                  <span>3 LPA</span>
                  <span>2 Cr</span>
                </div>
              </div>
            </div>

            <button
              onClick={analyzeResume}
              disabled={!file || isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${!file || isAnalyzing ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]"}`}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="animate-spin" size={20} /> Analyzing
                  Profile...
                </>
              ) : (
                "Analyze Resume"
              )}
            </button>

            {/* Recent Upload Display */}
            {file && (
              <div className="bg-[#1A1D27] border border-gray-800 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-[#8B5CF6]/20 p-3 rounded-lg text-[#8B5CF6]">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-sm truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#9CA3AF]">Uploaded Just Now</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1 text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded">
                    <CheckCircle2 size={12} /> Current
                  </span>
                  <button
                    onClick={() => setFile(null)}
                    className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded bg-[#0F111A]"
                  >
                    Replace
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Analytics Report */}
          <div className="space-y-6">
            {/* Setup Progress */}
            <div className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Resume Setup</h3>
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-4 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-700 before:to-transparent">
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#1A1D27] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${file ? "bg-[#8B5CF6] text-white" : "bg-gray-700 text-gray-400"}`}
                  >
                    1
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0">
                    <p className="text-sm font-semibold text-white">
                      Upload resume
                    </p>
                    <p className="text-xs text-gray-400">
                      {file ? "File loaded." : "Awaiting file."}
                    </p>
                  </div>
                </div>

                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full border-4 border-[#1A1D27] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow ${report ? "bg-[#8B5CF6] text-white" : "bg-gray-700 text-gray-400"}`}
                  >
                    2
                  </div>
                  <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] ml-4 md:ml-0">
                    <p className="text-sm font-semibold text-white">
                      Extract Details
                    </p>
                    <p className="text-xs text-gray-400">
                      {report ? "Analysis complete." : "Pending analysis."}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Report Card */}
            {report && (
              <div className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
                  <h3 className="font-bold text-[#8B5CF6]">AI Assessment</h3>
                  <div
                    className={`text-xl font-black ${report.score >= 70 ? "text-green-400" : report.score >= 40 ? "text-amber-400" : "text-red-400"}`}
                  >
                    {report.score}/100
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-[#8B5CF6] pl-3 italic">
                    "{report.realityCheck}"
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1">
                      <AlertCircle size={14} /> Missing Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {report.missingSkills.map((skill, i) => (
                        <span
                          key={i}
                          className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Required Fixes
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400">
                      {report.resumeFixes.map((fix, i) => (
                        <li key={i}>{fix}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
