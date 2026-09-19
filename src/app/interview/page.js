'use client'
import { useState, useEffect, useRef } from 'react'
import Script from 'next/script'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Video, PhoneOff, Clock, AlertTriangle, MessageSquare, CheckCircle, Camera, Loader2, Play, FastForward } from 'lucide-react'
import { HWLogo } from '../components/Sidebar'
import { db } from '../lib/firebase'
import { collection, addDoc } from 'firebase/firestore'

// Exactly 100 Hardcore SWE & System Design Questions
const DYNAMIC_QUESTIONS = [
  "You have 30 seconds: Walk me through what happens under the hood when you type a URL into a browser.",
  "Explain the difference between concurrency and parallelism, and when you'd use each.",
  "Tell me about a challenging project you worked on and how you handled the database architecture.",
  "How would you design a rate limiter for a high-traffic public API?",
  "What is the CAP theorem, and why is it important in distributed systems?",
  "Explain the difference between SQL and NoSQL databases. When would you choose one over the other?",
  "How do you handle pagination in a REST API with millions of records?",
  "What is a memory leak, and how do you detect and prevent it?",
  "Explain the concept of Dependency Injection and why it's useful.",
  "What happens during a DNS resolution?",
  "How would you optimize a slow database query?",
  "Explain the differences between TCP and UDP.",
  "What is a Deadlock, and how do you resolve it?",
  "How does garbage collection work in your primary programming language?",
  "Explain the concept of closures in JavaScript or Python.",
  "What is the difference between a process and a thread?",
  "Design a URL shortener like Bitly. What are the key components?",
  "What is an index in a database, and how does it speed up reading?",
  "Explain OAuth 2.0 flow.",
  "What is CORS, and why does it exist?",
  "How do you prevent SQL injection?",
  "What is the difference between dynamic and static typing?",
  "Explain Big O notation and give an example of O(n log n).",
  "How does a hash table work under the hood?",
  "What is the difference between an abstract class and an interface?",
  "Explain the MVC pattern.",
  "How would you design the backend for a real-time chat application?",
  "What is horizontal vs vertical scaling?",
  "Explain JWTs (JSON Web Tokens) and how they maintain session state.",
  "What is a race condition?",
  "How do load balancers work?",
  "What are microservices, and what are their drawbacks?",
  "Explain the concepts of Git rebase vs Git merge.",
  "What is the difference between deep copy and shallow copy?",
  "How would you implement a caching strategy for a heavy API?",
  "Explain MapReduce.",
  "What is a RESTful API? What are its constraints?",
  "How does React's Virtual DOM work?",
  "What is the difference between a stack and a queue?",
  "Explain the Single Responsibility Principle.",
  "How would you design Twitter's news feed?",
  "What is eventual consistency?",
  "Explain the concepts of mutable and immutable objects.",
  "What is a Man-in-the-Middle attack?",
  "How do you handle errors and retries in distributed microservices?",
  "What are WebSockets and when would you use them over HTTP?",
  "Explain the concept of a binary search tree.",
  "What is the Liskov Substitution Principle?",
  "How would you design a ticketing system like Ticketmaster?",
  "What is a foreign key, and what is its purpose?",
  "Explain the concept of recursion. What is the base case?",
  "What is a reverse proxy?",
  "How do you optimize an application for low latency?",
  "What is cross-site scripting (XSS)?",
  "Explain the difference between authentication and authorization.",
  "How does a CDN (Content Delivery Network) work?",
  "What is the difference between inner join and outer join?",
  "How would you handle a sudden 100x traffic spike to your service?",
  "What is polymorphic dispatch?",
  "Explain the sliding window algorithm paradigm.",
  "What is the difference between a primary key and a unique key?",
  "How do you mock dependencies in unit tests?",
  "What is continuous integration and continuous deployment (CI/CD)?",
  "Explain the difference between optimistic and pessimistic locking.",
  "How would you design a leaderboard for an online multiplayer game?",
  "What is a container, like Docker, compared to a virtual machine?",
  "Explain the Observer pattern.",
  "What is the difference between synchronous and asynchronous programming?",
  "How do you implement a priority queue?",
  "What is serverless architecture?",
  "Explain the concept of consistent hashing.",
  "What is a singleton, and why is it sometimes considered an anti-pattern?",
  "How would you design an elevator system?",
  "What is a doubly linked list?",
  "Explain the differences between long polling and Server-Sent Events.",
  "How do you manage state in a frontend application?",
  "What is the difference between HTTP/1.1 and HTTP/2?",
  "Explain the Open/Closed Principle.",
  "How would you implement autocomplete for a search engine?",
  "What is a thread pool?",
  "Explain the concept of memoization.",
  "What is the difference between absolute and relative paths?",
  "How do you handle database migrations in production?",
  "What is a CDN cache miss?",
  "Explain the Factory design pattern.",
  "What is the difference between interpreted and compiled languages?",
  "How would you design a web crawler?",
  "What is a CSRF attack and how do you mitigate it?",
  "Explain the difference between preemptive and cooperative multitasking.",
  "What is a bloom filter?",
  "How do you ensure idempotency in API requests?",
  "What is the difference between a tree and a graph?",
  "Explain the concept of a closure loop trap.",
  "How would you design Uber's ride-matching backend?",
  "What is connection pooling?",
  "Explain the Strategy pattern.",
  "What is tail call optimization?",
  "How do you manage secrets and API keys in your applications?",
  "What is a trie data structure?",
  "Explain the concept of two-phase commit in databases."
]

export default function InterviewPage() {
  const [interviewState, setInterviewState] = useState('setup') 
  const [hasStarted, setHasStarted] = useState(false)
  const [durationLimit, setDurationLimit] = useState(10) 
  
  const [availableVoices, setAvailableVoices] = useState([])
  const [overallTimeLeft, setOverallTimeLeft] = useState(0)
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30)
  const [questionCount, setQuestionCount] = useState(1)
  
  const [isActive, setIsActive] = useState(false)
  const [scriptsLoaded, setScriptsLoaded] = useState({ face: false, pose: false })
  
  const [gazeAlert, setGazeAlert] = useState(false)
  const [postureAlert, setPostureAlert] = useState(false)
  const gazeViolationSeconds = useRef(0)
  const postureViolationSeconds = useRef(0)
  
  const [chatLog, setChatLog] = useState([])
  const [liveTranscript, setLiveTranscript] = useState("")
  const [fillerWordCount, setFillerWordCount] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [avgDelay, setAvgDelay] = useState(0)
  
  const [isListening, setIsListening] = useState(false)
  const [isAiThinking, setIsAiThinking] = useState(false)
  const [summaryData, setSummaryData] = useState(null)
  
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const requestRef = useRef(null)
  const recognitionRef = useRef(null)
  const faceMeshRef = useRef(null)
  const poseRef = useRef(null)
  const chatScrollContainerRef = useRef(null)
  
  const chatLogRef = useRef(chatLog)
  const startTimeRef = useRef(Date.now())
  const miaFinishedTimeRef = useRef(null)
  const speechDelaysRef = useRef([])

  useEffect(() => {
    return () => {
      setIsActive(false)
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel()
      if (recognitionRef.current) { try { recognitionRef.current.stop() } catch (e) {} }
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop())
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
    }
  }, [])

  useEffect(() => { 
    chatLogRef.current = chatLog
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({ top: chatScrollContainerRef.current.scrollHeight, behavior: 'smooth' })
    }
  }, [chatLog, liveTranscript, isAiThinking, isListening])

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices()
      if (voices.length > 0) setAvailableVoices(voices)
    }
    loadVoices()
    if (typeof window !== 'undefined') window.speechSynthesis.onvoiceschanged = loadVoices
  }, [])

  const joinInterviewSpace = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error("Browser doesn't support media devices.")
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true })
      streamRef.current = stream 
      setIsActive(true)
      setInterviewState('active')
    } catch (err) { alert(`Camera/Mic required: ${err.message}`) }
  }

  useEffect(() => {
    let interval = null
    if (interviewState === 'active' && hasStarted && overallTimeLeft > 0) {
      interval = setInterval(() => {
        setOverallTimeLeft(prev => prev - 1)
        if (gazeAlert) gazeViolationSeconds.current += 1
        if (postureAlert) postureViolationSeconds.current += 1

        const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000
        const realMsgs = chatLogRef.current.filter(m => m.sender === 'You' && !m.exclude)
        const totalWords = realMsgs.reduce((acc, curr) => acc + curr.text.split(' ').length, 0)
        if (elapsedMinutes > 0) setWpm(Math.round(totalWords / elapsedMinutes))
      }, 1000)
    } else if (interviewState === 'active' && hasStarted && overallTimeLeft <= 0) {
      endInterview()
    }
    return () => clearInterval(interval)
  }, [interviewState, hasStarted, overallTimeLeft, gazeAlert, postureAlert])

  useEffect(() => {
    let interval = null
    if (interviewState === 'active' && hasStarted && isListening && questionTimeLeft > 0) {
      interval = setInterval(() => setQuestionTimeLeft(prev => prev - 1), 1000)
    } else if (interviewState === 'active' && hasStarted && isListening && questionTimeLeft <= 0) {
      handleSendMessage(liveTranscript || "[Time Expired]", chatLogRef.current)
    }
    return () => clearInterval(interval)
  }, [interviewState, hasStarted, isListening, questionTimeLeft, liveTranscript])

  useEffect(() => {
    if (typeof window !== "undefined" && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition
      const recognition = new SpeechRecognition()
      recognition.continuous = true
      recognition.interimResults = true 
      
      recognition.onresult = (event) => {
        if (miaFinishedTimeRef.current) {
           const delay = (Date.now() - miaFinishedTimeRef.current) / 1000
           speechDelaysRef.current.push(delay)
           setAvgDelay(speechDelaysRef.current.reduce((a, b) => a + b, 0) / speechDelaysRef.current.length)
           miaFinishedTimeRef.current = null 
        }
        let interim = "", final = ""
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript
          else interim += event.results[i][0].transcript
        }
        if (interim) {
          setLiveTranscript(interim)
          const fillers = (interim.match(/\b(um|uh|like|basically|literally)\b/gi) || []).length
          if (fillers > 0) setFillerWordCount(prev => prev + fillers)
        }
        if (final.trim()) {
          setLiveTranscript("")
          handleSendMessage(final, chatLogRef.current)
        }
      }
      recognition.onerror = (e) => { if (e.error !== 'aborted') setIsListening(false) }
      recognition.onend = () => setIsListening(false)
      recognitionRef.current = recognition
    }
    return () => { try { recognitionRef.current?.stop() } catch (e) {} }
  }, [])

  const speakText = (text) => {
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    const femaleVoice = availableVoices.find(v => v.name.match(/female/i) || v.name.includes('Zira') || v.name.includes('Samantha'))
    if (femaleVoice) { utterance.voice = femaleVoice; utterance.pitch = 1.1; }
    
    utterance.onstart = () => {
      setIsListening(false)
      setQuestionTimeLeft(30)
      miaFinishedTimeRef.current = null
      try { recognitionRef.current?.stop() } catch (e) {}
    }
    utterance.onend = () => {
      setIsListening(true)
      setLiveTranscript("")
      miaFinishedTimeRef.current = Date.now() 
      try { recognitionRef.current?.start() } catch (e) {}
    }
    window.speechSynthesis.speak(utterance)
  }

  const startMeeting = () => {
    setHasStarted(true)
    setOverallTimeLeft(durationLimit * 60)
    setQuestionTimeLeft(30)
    startTimeRef.current = Date.now()
    const initMsg = DYNAMIC_QUESTIONS[Math.floor(Math.random() * DYNAMIC_QUESTIONS.length)]
    setChatLog([{ sender: 'Mia', text: initMsg }])
    speakText(initMsg)
  }

  const skipQuestion = () => {
    if (!hasStarted || isAiThinking) return
    setIsListening(false)
    try { recognitionRef.current?.stop() } catch (e) {}
    setLiveTranscript("")
    
    const nextQ = DYNAMIC_QUESTIONS[Math.floor(Math.random() * DYNAMIC_QUESTIONS.length)]
    const skipText = "It's alright that you don't get the question. Moving on. " + nextQ
    
    const updatedLog = [
      ...chatLog, 
      { sender: 'You', text: '[User Skipped Question]', exclude: true },
      { sender: 'Mia', text: skipText, exclude: true }
    ]
    
    setChatLog(updatedLog)
    setQuestionCount(prev => prev + 1)
    speakText(skipText)
  }

const endInterview = async () => {
    // 1. Kill the hardware streams
    setIsActive(false)
    setInterviewState('summary')
    setIsListening(false)
    window.speechSynthesis.cancel()
    try { recognitionRef.current?.stop() } catch (e) {}
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())

    const currentMetrics = {
      fillerWords: fillerWordCount,
      averageSpeechDelaySeconds: avgDelay.toFixed(2),
      gazeViolationsSeconds: gazeViolationSeconds.current,
      postureViolationsSeconds: postureViolationSeconds.current
    }

    // 2. Filter out any skipped questions so the AI doesn't grade them
    const historyForApi = chatLogRef.current.filter(msg => !msg.exclude)

    let aiResult = null

    // 3. Trigger actual Groq AI Grading
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: historyForApi, mode: 'summarize', metrics: currentMetrics })
      })
      aiResult = await res.json()
      setSummaryData(aiResult)
    } catch (err) {
      console.error(err)
      setSummaryData({ realityCheck: "Grading failed. Check API network logs." })
      return // Halt execution if grading fails so we don't push null data to Firebase
    }

    // 4. Push the verdict to Firebase
    if (aiResult && aiResult.overallScore) {
      try {
        await addDoc(collection(db, 'interviews'), {
          ...aiResult,
          duration: durationLimit,
          metrics: currentMetrics,
          timestamp: new Date().toISOString()
        })
        console.log("Firebase database updated successfully.")
      } catch (firebaseError) {
        console.error("Firestore Write Failed:", firebaseError)
        alert(`Firestore Error: ${firebaseError.message}\n\nCheck your Security Rules.`)
      }
    }
  }

  const handleSendMessage = async (userText, currentHistory) => {
    if (!userText.trim()) return
    setLiveTranscript("")
    setIsListening(false)
    try { recognitionRef.current?.stop() } catch (e) {}
    
    const updatedLog = [...currentHistory, { sender: 'You', text: userText }]
    setChatLog(updatedLog)
    setIsAiThinking(true)
    setQuestionCount(prev => prev + 1)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ history: currentHistory.filter(m => !m.exclude), userMessage: userText })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setChatLog([...updatedLog, { sender: 'Mia', text: data.response }])
      speakText(data.response)
    } catch (err) {
      setChatLog([...updatedLog, { sender: 'System Error', text: err.message }])
    } finally {
      setIsAiThinking(false)
    }
  }

  useEffect(() => {
    if (!isActive || !scriptsLoaded.face || !scriptsLoaded.pose) return
    let isMounted = true

    const initVision = async () => {
      const faceMesh = new window.FaceMesh({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}` })
      faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
      faceMesh.onResults((results) => {
        if (!isMounted || !results.multiFaceLandmarks?.[0]) return
        const lms = results.multiFaceLandmarks[0]
        const ratio = Math.abs(lms[468].x - lms[133].x) / (Math.abs(lms[33].x - lms[133].x) || 1)
        setGazeAlert(ratio < 0.35 || ratio > 0.65)
      })
      faceMeshRef.current = faceMesh

      const pose = new window.Pose({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}` })
      pose.setOptions({ modelComplexity: 1, smoothLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 })
      pose.onResults((results) => {
        if (!isMounted || !results.poseLandmarks) return
        const dist = Math.abs(((results.poseLandmarks[11].y + results.poseLandmarks[12].y) / 2) - results.poseLandmarks[0].y)
        setPostureAlert(dist < 0.18)
      })
      poseRef.current = pose

      try {
        let activeStream = streamRef.current
        if (!activeStream || activeStream.getVideoTracks().length === 0 || activeStream.getVideoTracks()[0].readyState === 'ended') {
          activeStream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false })
          streamRef.current = activeStream
        }
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream
          await videoRef.current.play()
          runVisionLoop()
        }
      } catch (err) { console.error("Webcam failed:", err) }
    }

    const runVisionLoop = async () => {
      if (!isMounted || !videoRef.current) return
      if (videoRef.current.readyState >= 2) {
        if (faceMeshRef.current) await faceMeshRef.current.send({ image: videoRef.current })
        if (poseRef.current) await poseRef.current.send({ image: videoRef.current })
      }
      requestRef.current = requestAnimationFrame(runVisionLoop)
    }

    initVision()
    return () => {
      isMounted = false
      if (requestRef.current) cancelAnimationFrame(requestRef.current)
      if (faceMeshRef.current) faceMeshRef.current.close()
      if (poseRef.current) poseRef.current.close()
    }
  }, [isActive, scriptsLoaded])

  const formatTime = (secs) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`
  const allScriptsLoaded = scriptsLoaded.face && scriptsLoaded.pose

  return (
    <>
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js" strategy="lazyOnload" onLoad={() => setScriptsLoaded(prev => ({ ...prev, face: true }))} />
      <Script src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js" strategy="lazyOnload" onLoad={() => setScriptsLoaded(prev => ({ ...prev, pose: true }))} />

      {/* FIXED CSS: h-screen combined with overflow-hidden rigidly locks layout */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="h-screen bg-[#0F111A] text-white flex flex-col font-sans overflow-hidden">
        
        <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800 shrink-0 bg-[#0A0C10]/50 backdrop-blur-md">
           <div className="flex items-center gap-4">
             <div className="bg-[#1A1D27] p-2 rounded-xl border border-gray-800 shadow-md">
                <HWLogo className="w-6 h-6" color="#8B5CF6" />
             </div>
             <h1 className="text-xl font-bold tracking-tight">Active Interview Dashboard</h1>
           </div>
           <div className="flex items-center gap-2 bg-[#1A1D27] px-4 py-2 rounded-full border border-gray-800">
              <span className="text-sm font-medium text-[#8B5CF6]">AI Interview</span>
           </div>
        </header>

        <div className="flex-1 p-8 overflow-hidden flex flex-col relative">
            
          {/* 1. SETUP STATE */}
          {interviewState === 'setup' && (
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-8">
              <div className="w-20 h-20 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-[#8B5CF6] mb-4"><Clock size={40} /></div>
              <h2 className="text-3xl font-bold">Configure Your Session</h2>
              <div className="grid grid-cols-3 gap-4 w-full">
                {[5, 10, 15].map(min => (
                  <button key={min} onClick={() => setDurationLimit(min)} className={`py-4 rounded-xl border-2 transition-all font-bold ${durationLimit === min ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'border-gray-800 bg-[#1A1D27] text-gray-400'}`}>
                    {min} Min
                  </button>
                ))}
              </div>
              <button onClick={joinInterviewSpace} className="w-full py-4 rounded-xl font-bold text-lg bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all">
                Enter Interview Space
              </button>
            </motion.div>
          )}

          {/* 2. ACTIVE DASHBOARD STATE */}
          {interviewState === 'active' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 min-h-0 overflow-hidden">
              
              <div className="lg:col-span-4 bg-[#1A1D27] rounded-xl border border-gray-800 p-4 flex flex-col h-full min-h-0 overflow-hidden">
                <div className="w-full aspect-[4/3] bg-black rounded-lg relative overflow-hidden flex items-center justify-center mb-6 shrink-0 border border-gray-800/50">
                  <video ref={videoRef} className="w-full h-full object-cover transform scale-x-[-1]" playsInline muted />
                  <AnimatePresence>
                    {hasStarted && gazeAlert && (
                      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="absolute top-4 left-4 bg-red-500/90 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2">
                        <AlertTriangle size={15} /> Eye contact lost
                      </motion.div>
                    )}
                    {hasStarted && postureAlert && (
                      <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className="absolute top-12 left-4 bg-amber-500/90 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2 mt-2">
                        <AlertTriangle size={15} /> Slouching
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
                <div className="flex justify-center gap-4 mt-auto shrink-0">
                  <button className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${isListening ? 'bg-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)]' : 'bg-gray-800'}`}>
                    {isListening ? <Mic size={20} className="text-white" /> : <MicOff size={20} className="text-gray-400" />}
                  </button>
                  <button onClick={skipQuestion} disabled={!hasStarted || isAiThinking} className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center hover:bg-gray-700 transition-colors disabled:opacity-50" title="Skip Question">
                    <FastForward size={20} className="text-white" />
                  </button>
                  <button onClick={endInterview} className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600 transition-colors"><PhoneOff size={20} className="text-white" /></button>
                </div>
              </div>

              {/* Chat Column (Now securely scrolls internally) */}
              <div className="lg:col-span-5 flex flex-col gap-6 h-full min-h-0 overflow-hidden">
                <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-6 flex-1 flex flex-col min-h-0 overflow-hidden relative">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2 shrink-0">
                    <span className="text-[#8B5CF6] font-bold flex items-center gap-2"><MessageSquare size={16} /> Interview Chat</span>
                    <span className="text-xs text-gray-500 font-mono">Q{questionCount}</span>
                  </div>
                  
                  <div ref={chatScrollContainerRef} className="flex-1 overflow-y-auto space-y-4 pr-2 pb-4 scroll-smooth">
                    {!hasStarted ? (
                      <div className="h-full flex items-center justify-center">
                        <button onClick={startMeeting} disabled={!allScriptsLoaded} className="px-8 py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-bold text-white shadow-lg flex items-center gap-3 transition-transform hover:scale-105 disabled:opacity-50">
                          {allScriptsLoaded ? <><Play size={20} /> Start Meeting</> : <><Loader2 className="animate-spin" size={20}/> Loading Models...</>}
                        </button>
                      </div>
                    ) : (
                      <AnimatePresence>
                        {chatLog.map((msg, i) => (
                          <motion.div key={i} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${msg.sender === 'You' ? 'items-end' : 'items-start'}`}>
                            <span className="text-[11px] text-gray-500 mb-1 px-1">{msg.sender}</span>
                            <div className={`p-3.5 rounded-xl text-sm leading-relaxed max-w-[85%] shadow-sm ${msg.sender === 'You' ? (msg.exclude ? 'bg-gray-700 text-gray-300' : 'bg-[#8B5CF6] text-white') : 'bg-[#0F111A] border border-gray-800 text-gray-200'} ${msg.sender === 'You' ? 'rounded-tr-none' : 'rounded-tl-none'}`}>
                              {msg.text}
                            </div>
                          </motion.div>
                        ))}
                        {isAiThinking && (
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-start">
                            <span className="text-[11px] text-gray-500 mb-1 px-1">Mia</span>
                            <div className="p-3.5 rounded-xl bg-[#0F111A] border border-gray-800 rounded-tl-none flex gap-1.5 items-center h-[46px]">
                              <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce"></span>
                              <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.1s]"></span>
                              <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:0.2s]"></span>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-6 h-40 flex flex-col shrink-0 relative">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-bold text-sm flex items-center gap-2"><Mic size={14} /> Live Transcript</span>
                    <span className={`text-xs font-mono ${questionTimeLeft < 10 ? 'text-red-400 font-bold' : 'text-gray-500'}`}>00:{hasStarted ? questionTimeLeft.toString().padStart(2, '0') : '00'}</span>
                  </div>
                  <div className="flex-1 bg-[#0F111A] border border-gray-800 rounded-lg p-4 overflow-y-auto flex items-start justify-between gap-4">
                     <p className="text-gray-300 text-sm flex-1">
                       {liveTranscript || (isListening ? <span className="text-gray-600 italic">Speak now...</span> : <span className="text-gray-600 italic">Mic muted.</span>)}
                     </p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-3 bg-[#1A1D27] rounded-xl border border-gray-800 p-6 flex flex-col h-full min-h-0 overflow-hidden">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="font-bold text-white">Live Insights</h3>
                  <span className="text-xs font-mono text-[#8B5CF6]">{formatTime(hasStarted ? overallTimeLeft : durationLimit * 60)}</span>
                </div>
                
                <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Speaking Pace</span><span className="text-white font-bold">{wpm} WPM</span></div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-2"><div className="h-full bg-[#8B5CF6] transition-all" style={{width: `${Math.min(wpm / 2, 100)}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Filler Words</span><span className="text-white font-bold">{fillerWordCount}</span></div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-2"><div className="h-full bg-amber-500 transition-all" style={{width: `${Math.min(fillerWordCount * 5, 100)}%`}}></div></div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1"><span className="text-gray-400">Avg Speech Delay</span><span className="text-white font-bold">{avgDelay.toFixed(1)}s</span></div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-2"><div className="h-full bg-red-500 transition-all" style={{width: `${Math.min(avgDelay * 10, 100)}%`}}></div></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. SUMMARY STATE */}
          {interviewState === 'summary' && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6 w-full absolute inset-0 bg-[#0F111A] z-50 p-8 overflow-y-auto">
              {!summaryData ? (
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-16 h-16 text-[#8B5CF6] animate-spin" />
                  <h2 className="text-xl font-bold text-[#8B5CF6]">Generating Final Reality Check...</h2>
                </div>
              ) : (
                <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-8 w-full shadow-2xl">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-3"><CheckCircle className="text-[#8B5CF6] w-8 h-8" /><h2 className="text-3xl font-bold">Interview Graded</h2></div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Overall Score</p>
                      <p className={`text-4xl font-black ${summaryData.overallScore >= 70 ? 'text-green-400' : 'text-red-400'}`}>{summaryData.overallScore}/100</p>
                    </div>
                  </div>
                  <div className="space-y-6 mb-8">
                     <div>
                       <h3 className="font-bold text-white mb-2">Technical Correctness</h3>
                       <p className="text-sm text-gray-300 bg-[#0F111A] p-4 rounded-lg border border-gray-800 leading-relaxed">{summaryData.technicalFeedback}</p>
                     </div>
                     <div>
                       <h3 className="font-bold text-white mb-2">Body Language & Telemetry</h3>
                       <p className="text-sm text-gray-300 bg-[#0F111A] p-4 rounded-lg border border-gray-800 leading-relaxed">{summaryData.behavioralFeedback}</p>
                     </div>
                  </div>
                  <div className="mb-8">
                    <h3 className="font-bold text-white mb-3">Reality Check</h3>
                    <p className="text-sm text-white leading-relaxed border-l-4 border-red-500 pl-4 bg-red-500/10 p-4 rounded-r-lg italic font-medium">"{summaryData.realityCheck}"</p>
                  </div>
                  <button onClick={() => window.location.reload()} className="w-full py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-bold transition-all">Start Another Session</button>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </motion.div>
    </>
  )
}