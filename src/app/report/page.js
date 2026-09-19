'use client'
import { useState, useEffect } from 'react'
import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { HWLogo } from '../components/Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Activity } from 'lucide-react'

export default function ReportPage() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState(null)

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const q = query(collection(db, 'interviews'), orderBy('timestamp', 'desc'))
        const querySnapshot = await getDocs(q)
        const fetchedReports = []
        
        querySnapshot.forEach((doc) => fetchedReports.push({ id: doc.id, ...doc.data() }))
        setReports(fetchedReports)
        if (fetchedReports.length > 0) setSelectedReportId(fetchedReports[0].id)
      } catch (error) {
        console.error("Error fetching reports:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchReports()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F111A] flex items-center justify-center">
         <div className="w-12 h-12 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const activeReport = reports.find(r => r.id === selectedReportId) || reports[0]
  const overallScore = activeReport ? activeReport.overallScore : 0
  const behavioural = activeReport ? Math.max(10, 100 - (activeReport.metrics?.postureViolationsSeconds || 0) * 2) : 0
  const technical = activeReport ? overallScore : 0
  const communication = activeReport ? Math.max(10, 100 - (activeReport.metrics?.fillerWords || 0) * 3 - (activeReport.metrics?.averageSpeechDelaySeconds || 0) * 5) : 0
  
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (overallScore / 100) * circumference

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="h-screen bg-[#0F111A] text-white p-8 overflow-y-auto font-sans"
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex items-center gap-4 border-b border-gray-800 pb-6">
          <div className="bg-[#1A1D27] p-2.5 rounded-xl border border-gray-800 shadow-md">
             <HWLogo className="w-8 h-8" color="#8B5CF6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Performance Report</h1>
            <p className="text-[#9CA3AF] text-sm mt-1">Track your progress and analyze historical telemetry.</p>
          </div>
        </header>

        {reports.length === 0 ? (
          <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-12 text-center">
             <Activity className="w-16 h-16 text-gray-600 mx-auto mb-4" />
             <h2 className="text-2xl font-bold mb-2">No Data Found</h2>
             <p className="text-gray-400">Complete an AI interview session to generate your performance report.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-12">
            
            <div className="lg:col-span-8 bg-[#1A1D27] rounded-2xl border border-gray-800 p-8 shadow-2xl flex flex-col justify-between transition-all">
              <div className="flex flex-col md:flex-row items-center justify-around gap-12">
                <div className="flex flex-col items-center">
                  <div className="relative w-40 h-40 flex items-center justify-center mb-4">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                      <circle cx="70" cy="70" r={radius} className="stroke-gray-800" strokeWidth="12" fill="none" />
                      <motion.circle 
                        key={`circle-${activeReport.id}`}
                        cx="70" cy="70" r={radius} 
                        className="stroke-[#8B5CF6]" 
                        strokeWidth="12" fill="none" strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        style={{ strokeDasharray: circumference }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <motion.span key={`score-${activeReport.id}`} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="text-4xl font-black text-white">
                        {overallScore}%
                      </motion.span>
                    </div>
                  </div>
                  <span className="text-sm text-gray-400 font-bold uppercase tracking-wider">Overall Score</span>
                </div>

                <div className="flex-1 w-full space-y-6">
                  <h3 className="text-sm font-bold text-white mb-6 uppercase tracking-wider flex justify-between items-center">
                    <span>Performance Breakdown</span>
                    <span className="text-[10px] text-gray-500 font-mono">{new Date(activeReport.timestamp).toLocaleDateString()}</span>
                  </h3>
                  <BreakdownBar animKey={`bar-${activeReport.id}-behav`} label="Behavioural" score={Math.round(behavioural)} />
                  <BreakdownBar animKey={`bar-${activeReport.id}-tech`} label="Technical" score={technical} />
                  <BreakdownBar animKey={`bar-${activeReport.id}-sys`} label="System Design" score={Math.round(technical * 0.9)} />
                  <BreakdownBar animKey={`bar-${activeReport.id}-code`} label="Coding" score={Math.round(technical * 0.95)} />
                  <BreakdownBar animKey={`bar-${activeReport.id}-comm`} label="Communication" score={Math.round(communication)} />
                </div>
              </div>

              <motion.div key={`verdict-${activeReport.id}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-12 bg-[#0F111A] rounded-xl p-6 border border-gray-800 flex gap-4 items-start">
                 <div className="mt-1 shrink-0"><User className="text-[#8B5CF6]" size={20} /></div>
                 <div>
                   <h4 className="text-sm font-bold text-white mb-2 uppercase tracking-wider">Targeted Verdict</h4>
                   <p className="text-sm text-gray-300 leading-relaxed italic border-l-2 border-[#8B5CF6] pl-3">
                     "{activeReport.realityCheck}"
                   </p>
                 </div>
              </motion.div>
            </div>

            <div className="lg:col-span-4 bg-[#1A1D27] rounded-2xl border border-gray-800 flex flex-col h-[600px]">
              <div className="p-6 pb-4 border-b border-gray-800 shrink-0">
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider">Previous Sessions</h3>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {reports.map((report, idx) => {
                  const isSelected = report.id === selectedReportId;
                  return (
                    <button 
                      key={report.id} onClick={() => setSelectedReportId(report.id)}
                      className={`w-full text-left rounded-xl p-4 border flex items-center justify-between transition-all group ${
                        isSelected ? 'bg-[#8B5CF6]/10 border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.15)]' : 'bg-[#0F111A] border-gray-800 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        {/* Logo Color Inversion Logic */}
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${isSelected ? 'bg-[#8B5CF6]' : 'bg-gray-800 group-hover:bg-gray-700'}`}>
                          <HWLogo className="w-5 h-5" color={isSelected ? "#000000" : "#8B5CF6"} />
                        </div>
                        <div>
                          <h4 className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                            {idx === 0 ? 'Latest Interview' : 'Mock Interview'}
                          </h4>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {new Date(report.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </div>
                      </div>
                      <span className={`text-lg font-black ${isSelected ? 'text-[#8B5CF6]' : 'text-gray-500'}`}>{report.overallScore}%</span>
                    </button>
                  )
                })}
              </div>
            </div>

          </div>
        )}
      </div>
    </motion.div>
  )
}

function BreakdownBar({ label, score, animKey }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-gray-400 w-32">{label}</span>
      <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
        <motion.div key={animKey} className="h-full bg-[#8B5CF6] rounded-full" initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8, ease: "easeOut" }} />
      </div>
      <span className="text-sm font-bold text-white w-8 text-right">{score}%</span>
    </div>
  )
}