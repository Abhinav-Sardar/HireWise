'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { HWLogo } from '../components/Sidebar'

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
}

export default function ResumePage() {
  const [file, setFile] = useState(null)
  const [salary, setSalary] = useState(10)
  const [role, setRole] = useState("Software Engineer (SWE)")
  
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [report, setReport] = useState(null)

  const handleDrop = (e) => {
    e.preventDefault()
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile?.type === "application/pdf") {
      setFile(droppedFile)
    } else {
      alert("Only PDFs are supported for analysis.")
    }
  }

  const formatSalary = (val) => {
    if (val >= 100) return `₹${(val / 100).toFixed(2)} Cr`
    return `₹${val} Lakhs`
  }

  const analyzeResume = async () => {
    if (!file) return alert("Upload a resume first.")
    
    setIsAnalyzing(true)
    setReport(null)

    const simulatedExtractedText = `${role} candidate with basic academic projects in Python, Next.js, and MySQL. Preparing for engineering entrance exams. No professional internships yet.`

    try {
      const res = await fetch('/api/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: simulatedExtractedText,
          jobRole: role,
          expectedSalary: formatSalary(salary)
        })
      })
      
      const data = await res.json()
      if (res.ok) {
        setReport(data)
      } else {
        throw new Error(data.error)
      }
    } catch (err) {
      console.error(err)
      alert("Analysis failed. Check your API logs.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <motion.div 
      initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.1 } } }}
      className="min-h-screen bg-[#0F111A] text-white p-8 overflow-y-auto"
    >
      <div className="max-w-6xl mx-auto">
        
        <motion.div variants={fadeUp} className="mb-8 border-b border-gray-800 pb-6 flex items-center gap-4">
          <div className="bg-[#1A1D27] p-2.5 rounded-xl border border-gray-800 shadow-md">
             <HWLogo className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Profile Setup & Resume Analysis</h1>
            <p className="text-[#9CA3AF] text-sm mt-1">Configure your target metrics and upload your resume for a reality check.</p>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
          
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={fadeUp}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="bg-[#1A1D27] border-2 border-dashed border-gray-700 hover:border-[#8B5CF6] rounded-xl p-12 flex flex-col items-center justify-center transition-colors cursor-pointer"
            >
              <UploadCloud className="w-12 h-12 text-[#8B5CF6] mb-4" />
              <h3 className="text-lg font-bold mb-2">Upload your resume</h3>
              <p className="text-[#9CA3AF] text-sm mb-6">Drag and drop your file here or <span className="text-[#8B5CF6] hover:underline">browse</span></p>
              <p className="text-xs text-gray-600">PDF up to 10 MB</p>
              
              <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="file-upload" />
              <label htmlFor="file-upload" className="mt-6 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer transition-colors border border-gray-700">
                Browse files
              </label>
            </motion.div>

            <motion.div variants={fadeUp} className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6 grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-300">Target Role</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-[#0F111A] border border-gray-700 rounded-lg p-3 outline-none focus:border-[#8B5CF6] text-sm transition-colors"
                >
                  <option>Software Engineer (SWE)</option>
                  <option>AI / ML Engineer</option>
                  <option>Data Scientist</option>
                  <option>Financial Analyst</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2 flex justify-between text-gray-300">
                  Expected Salary <span className="text-[#8B5CF6] font-bold">{formatSalary(salary)}</span>
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
            </motion.div>

            <motion.button variants={fadeUp}
              onClick={analyzeResume}
              disabled={!file || isAnalyzing}
              whileHover={(!file || isAnalyzing) ? {} : { scale: 1.02 }}
              whileTap={(!file || isAnalyzing) ? {} : { scale: 0.98 }}
              className={`w-full py-4 rounded-xl font-bold transition-all shadow-md flex items-center justify-center gap-2 ${(!file || isAnalyzing) ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-[#8B5CF6] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]'}`}
            >
              {isAnalyzing ? <><Loader2 className="animate-spin" size={20} /> Analyzing Profile...</> : 'Analyze Resume'}
            </motion.button>
            
            <AnimatePresence>
              {file && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="bg-[#1A1D27] border border-gray-800 rounded-xl p-4 flex items-center justify-between overflow-hidden"
                >
                  <div className="flex items-center gap-4">
                    <div className="bg-[#8B5CF6]/20 p-3 rounded-lg text-[#8B5CF6]"><FileText size={24} /></div>
                    <div>
                      <p className="font-semibold text-sm truncate max-w-[200px]">{file.name}</p>
                      <p className="text-xs text-[#9CA3AF]">Uploaded Just Now</p>
                    </div>
                  </div>
                  <button onClick={() => setFile(null)} className="text-xs text-gray-400 hover:text-white border border-gray-700 px-3 py-1.5 rounded bg-[#0F111A] transition-colors">Remove</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <motion.div variants={fadeUp} className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6">
              <h3 className="font-bold mb-4">Pipeline Status</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${file ? 'bg-[#8B5CF6] text-white' : 'bg-gray-800 text-gray-500'}`}>1</div>
                  <span className={`text-sm transition-colors ${file ? 'text-white' : 'text-gray-500'}`}>Resume Uploaded</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${report ? 'bg-[#8B5CF6] text-white' : 'bg-gray-800 text-gray-500'}`}>2</div>
                  <span className={`text-sm transition-colors ${report ? 'text-white' : 'text-gray-500'}`}>Analysis Complete</span>
                </div>
              </div>
            </motion.div>

            <AnimatePresence>
              {report && (
                <motion.div 
                  initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#1A1D27] border border-gray-800 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-4">
                    <h3 className="font-bold text-[#8B5CF6]">HireWise Score</h3>
                    <div className={`text-xl font-black ${report.score >= 70 ? 'text-green-400' : report.score >= 40 ? 'text-amber-400' : 'text-red-400'}`}>
                      {report.score}/100
                    </div>
                  </div>
                  <div className="mb-4">
                    <p className="text-sm text-gray-300 leading-relaxed border-l-2 border-[#8B5CF6] pl-3 italic">"{report.realityCheck}"</p>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1"><AlertCircle size={14}/> Missing Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.missingSkills?.map((skill, i) => (
                          <span key={i} className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-1 rounded text-xs font-medium">{skill}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Required Fixes</h4>
                      <ul className="list-disc pl-4 space-y-1 text-xs text-gray-400">
                        {report.resumeFixes?.map((fix, i) => <li key={i}>{fix}</li>)}
                      </ul>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  )
}