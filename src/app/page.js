'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Play, BrainCircuit, ScanEye, FileText, ArrowRight, Activity } from 'lucide-react'

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
}

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 15 } }
}

export default function HomePage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}
      className="min-h-[calc(100vh-4rem)] flex flex-col gap-24 pb-20 overflow-x-hidden"
    >
      
      {/* HERO SECTION */}
      <section className="flex flex-col lg:flex-row items-center justify-between gap-12 mt-16 px-8 lg:px-12">
        <motion.div 
          initial="hidden" animate="show" variants={staggerContainer} 
          className="flex-1 max-w-2xl"
        >
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-6xl font-bold mb-6 leading-tight text-white">
            Ace Every <br/> Interview with <span className="text-[#8B5CF6]">HireWise</span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-[#9CA3AF] text-lg mb-10 max-w-xl leading-relaxed">
            Practice real interview questions, get instant feedback, and build the confidence to land your dream job.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-wrap gap-5">
            <Link 
              href="/interview" 
              className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-[0_0_20px_rgba(139,92,246,0.25)] flex items-center gap-2 hover:scale-105"
            >
              Start Practicing Now <ArrowRight size={18} />
            </Link>
        
          </motion.div>
        </motion.div>

        {/* Animated AI Waveform Card */}
        <motion.div 
          initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8, type: "spring" }}
          className="flex-1 w-full max-w-md"
        >
          <div className="bg-[#1A1D27] rounded-2xl border border-gray-800 p-8 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/10 blur-3xl rounded-full group-hover:bg-[#8B5CF6]/20 transition-colors"></div>
            
            <div className="flex items-center gap-3 mb-6 relative z-10">
               <Activity className="text-[#8B5CF6]" size={24} />
               <h3 className="text-lg font-bold text-white">AI Interview</h3>
            </div>
            
            <p className="text-gray-300 mb-8 leading-relaxed text-sm relative z-10">
              Tell me about a challenging project you worked on and how you handled it.
            </p>
            
            <div className="flex items-center gap-2 justify-center mb-6 relative z-10">
              {[12, 24, 16, 32, 48, 24, 16, 28, 40, 24, 12].map((height, i) => (
                <motion.div 
                  key={`left-${i}`} 
                  className="w-1.5 bg-[#8B5CF6]/40 rounded-full" 
                  animate={{ height: [height, height * 1.5, height] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                />
              ))}
              <motion.div 
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                className="w-12 h-12 bg-[#8B5CF6] rounded-full flex items-center justify-center shrink-0 mx-2 shadow-lg shadow-[#8B5CF6]/30 cursor-pointer"
              >
                <Play className="text-white ml-1" size={20} />
              </motion.div>
              {[12, 24, 40, 28, 16, 24, 48, 32, 16, 24, 12].map((height, i) => (
                <motion.div 
                  key={`right-${i}`} 
                  className="w-1.5 bg-[#8B5CF6]/40 rounded-full" 
                  animate={{ height: [height, height * 1.5, height] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: i * 0.1, ease: "easeInOut" }}
                />
              ))}
            </div>
            
            <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden mt-8 relative z-10">
              <motion.div 
                initial={{ width: "0%" }} animate={{ width: "33%" }} transition={{ duration: 2, delay: 0.5 }}
                className="h-full bg-[#8B5CF6]"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* FEATURES GRID */}
      <section className="px-8 lg:px-12">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Engineered for Reality Checks</h2>
          <p className="text-[#9CA3AF] max-w-2xl mx-auto">
            Stop relying on generic AI bots. HireWise uses strict timers, computer vision, and brutal grading to expose your weaknesses before the real interview.
          </p>
        </motion.div>

        <motion.div 
          variants={staggerContainer} initial="hidden" whileInView="show" viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <FeatureCard 
            icon={<BrainCircuit size={28} className="text-[#8B5CF6]" />}
            title="Rapid-Fire Technicals"
            description="Powered by Groq's sub-second latency. You have 30 seconds to answer hardcore SWE questions. Falter, and Mia will cut you off."
            link="/interview"
          />
          <FeatureCard 
            icon={<ScanEye size={28} className="text-[#8B5CF6]" />}
            title="Non-Verbal Telemetry"
            description="MediaPipe FaceMesh and Pose models run locally in your browser to instantly flag slouching or diverted eye contact."
            link="/interview"
          />
          <FeatureCard 
            icon={<FileText size={28} className="text-[#8B5CF6]" />}
            title="Brutal Resume Grading"
            description="Upload your PDF and set your target salary. Our AI will tear into your missing skills and give you a no-sugarcoated reality check."
            link="/resume"
          />
        </motion.div>
      </section>
    </motion.div>
  )
}

function FeatureCard({ icon, title, description, link }) {
  return (
    <motion.div variants={fadeUp} className="bg-[#1A1D27] border border-gray-800 p-8 rounded-2xl hover:border-[#8B5CF6]/50 transition-colors group">
      <div className="w-14 h-14 bg-[#0F111A] border border-gray-800 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-md">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-white mb-3">{title}</h3>
      <p className="text-[#9CA3AF] text-sm leading-relaxed mb-6">
        {description}
      </p>
      <Link href={link} className="text-[#8B5CF6] text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
        Try Feature <ArrowRight size={16} />
      </Link>
    </motion.div>
  )
}