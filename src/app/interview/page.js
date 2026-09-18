"use client";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import {
  AlertTriangle,
  Video,
  Mic,
  MicOff,
  Clock,
  SkipForward,
  CheckCircle,
} from "lucide-react";

export default function InterviewPage() {
  const [interviewState, setInterviewState] = useState("setup"); // 'setup', 'active', 'summary'
  const [durationLimit, setDurationLimit] = useState(5); // in minutes

  // Timers
  const [overallTimeLeft, setOverallTimeLeft] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);

  // System State
  const [isActive, setIsActive] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState({
    face: false,
    pose: false,
  });
  const [gazeAlert, setGazeAlert] = useState(false);
  const [postureAlert, setPostureAlert] = useState(false);

  // Chat & Speech
  const [chatLog, setChatLog] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(null);
  const chatScrollContainerRef = useRef(null);
  const recognitionRef = useRef(null);
  const faceMeshRef = useRef(null);
  const poseRef = useRef(null);

  const chatLogRef = useRef(chatLog);

  // Sync refs and scrolling
  useEffect(() => {
    chatLogRef.current = chatLog;
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatLog, isAiThinking]);

  // Overall Session Timer
  useEffect(() => {
    let interval = null;
    if (interviewState === "active" && overallTimeLeft > 0) {
      interval = setInterval(
        () => setOverallTimeLeft((prev) => prev - 1),
        1000,
      );
    } else if (interviewState === "active" && overallTimeLeft <= 0) {
      endInterview();
    }
    return () => clearInterval(interval);
  }, [interviewState, overallTimeLeft]);

  // Rapid-Fire Question Timer (30s)
  useEffect(() => {
    let interval = null;
    if (interviewState === "active" && isListening && questionTimeLeft > 0) {
      interval = setInterval(
        () => setQuestionTimeLeft((prev) => prev - 1),
        1000,
      );
    } else if (
      interviewState === "active" &&
      isListening &&
      questionTimeLeft <= 0
    ) {
      handleSkip("Time expired.");
    }
    return () => clearInterval(interval);
  }, [interviewState, isListening, questionTimeLeft]);

  // Speech Recognition Setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = "en-US";

      recognition.onresult = async (event) => {
        const transcript =
          event.results[event.results.length - 1][0].transcript;
        if (transcript.trim()) {
          await handleSendMessage(transcript, chatLogRef.current);
        }
      };
      recognition.onerror = (event) => {
        if (event.error !== "aborted") setIsListening(false);
      };
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }

    return () => {
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    };
  }, []);

  // Audio Control & Female Voice Selection
  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    // Robust female voice targeting
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) =>
        v.name.match(/female/i) ||
        v.name.includes("Zira") ||
        v.name.includes("Samantha") ||
        v.name.includes("Victoria"),
    );
    if (femaleVoice) utterance.voice = femaleVoice;

    utterance.onstart = () => {
      setIsListening(false);
      setQuestionTimeLeft(30); // Reset 30s timer when Mia starts talking
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    };
    utterance.onend = () => {
      setIsListening(true);
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    };
    window.speechSynthesis.speak(utterance);
  };

  // Interview Lifecycle Functions
  const startInterview = () => {
    setInterviewState("active");
    setIsActive(true);
    setOverallTimeLeft(durationLimit * 60);
    setQuestionTimeLeft(30);

    const initMsg =
      "Hi, let's start your Software Engineering mock interview. You have 30 seconds per question. To begin: What is the time complexity of looking up a value in a standard Hash Map, and in what specific scenario does that complexity degrade to O(N)?";
    setChatLog([{ sender: "Mia", text: initMsg }]);
    speakText(initMsg);
  };

  const endInterview = async () => {
    setIsActive(false);
    setInterviewState("summary");
    setIsListening(false);
    window.speechSynthesis.cancel();
    try {
      recognitionRef.current?.stop();
    } catch (e) {}
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }

    // Trigger Summary Generation
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: chatLogRef.current,
          mode: "summarize",
        }),
      });
      const data = await res.json();
      setSummaryData(data.response);
    } catch (err) {
      setSummaryData("Failed to generate summary report.");
    }
  };

  const handleSkip = async (reason = "User skipped.") => {
    setQuestionTimeLeft(30);
    const skipMsg = `[SYSTEM: ${reason} Provide the correct answer briefly and immediately ask the next question.]`;
    await handleSendMessage(skipMsg, chatLogRef.current, true);
  };

  const handleSendMessage = async (
    userText,
    currentHistory,
    isSystem = false,
  ) => {
    if (!userText.trim()) return;

    const displayMsg = isSystem ? "*(Skipped)*" : userText;
    const updatedLog = [...currentHistory, { sender: "You", text: displayMsg }];
    setChatLog(updatedLog);
    setIsAiThinking(true);
    setIsListening(false);
    try {
      recognitionRef.current?.stop();
    } catch (e) {}

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: currentHistory,
          userMessage: userText,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed response");

      setChatLog([...updatedLog, { sender: "Mia", text: data.response }]);
      speakText(data.response);
    } catch (err) {
      setChatLog([
        ...updatedLog,
        { sender: "System Error", text: err.message },
      ]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // Vision Tracker Pipeline
  useEffect(() => {
    if (!isActive || !scriptsLoaded.face || !scriptsLoaded.pose) return;
    let isMounted = true;

    const initVisionAndCamera = async () => {
      const faceMesh = new window.FaceMesh({
        locateFile: (f) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${f}`,
      });
      faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      faceMesh.onResults((results) => {
        if (!isMounted || !results.multiFaceLandmarks?.[0]) return;
        const lms = results.multiFaceLandmarks[0];
        const ratio =
          Math.abs(lms[468].x - lms[133].x) /
          (Math.abs(lms[33].x - lms[133].x) || 1);
        setGazeAlert(ratio < 0.35 || ratio > 0.65);
      });
      faceMeshRef.current = faceMesh;

      const pose = new window.Pose({
        locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
      });
      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults((results) => {
        if (!isMounted || !results.poseLandmarks) return;
        const dist = Math.abs(
          (results.poseLandmarks[11].y + results.poseLandmarks[12].y) / 2 -
            results.poseLandmarks[0].y,
        );
        setPostureAlert(dist < 0.18);
      });
      poseRef.current = pose;

      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480 },
          audio: false,
        });
        if (!isMounted) return stream.getTracks().forEach((t) => t.stop());
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            runVisionLoop();
          };
        }
      } catch (err) {
        console.error("Webcam failed:", err);
      }
    };

    const runVisionLoop = async () => {
      if (!isMounted || !videoRef.current) return;
      if (videoRef.current.readyState >= 2) {
        if (faceMeshRef.current)
          await faceMeshRef.current.send({ image: videoRef.current });
        if (poseRef.current)
          await poseRef.current.send({ image: videoRef.current });
      }
      requestRef.current = requestAnimationFrame(runVisionLoop);
    };

    initVisionAndCamera();
    return () => {
      isMounted = false;
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (faceMeshRef.current) faceMeshRef.current.close();
      if (poseRef.current) poseRef.current.close();
    };
  }, [isActive, scriptsLoaded]);

  const allScriptsLoaded = scriptsLoaded.face && scriptsLoaded.pose;
  const formatTime = (secs) =>
    `${Math.floor(secs / 60)
      .toString()
      .padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;

  return (
    <>
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/face_mesh.js"
        strategy="lazyOnload"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, face: true }))}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js"
        strategy="lazyOnload"
        onLoad={() => setScriptsLoaded((prev) => ({ ...prev, pose: true }))}
      />

      <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden text-white bg-[#0F111A]">
        {/* Header Bar */}
        <div className="flex justify-between items-center pb-4 border-b border-gray-800 shrink-0 px-8 pt-6">
          <div>
            <h1 className="text-2xl font-bold">HireWise SWE Interview</h1>
            <p className="text-xs text-[#9CA3AF]">
              Software Engineering Assessment
            </p>
          </div>
          {interviewState === "active" && (
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400">Total Time Remaining</p>
                <p className="font-mono text-xl text-[#8B5CF6] font-bold">
                  {formatTime(overallTimeLeft)}
                </p>
              </div>
              <button
                onClick={endInterview}
                className="px-5 py-2.5 rounded-lg font-semibold bg-red-500 hover:bg-red-600 shadow-md"
              >
                End Early
              </button>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden px-8 pb-8 pt-4">
          {/* SETUP STATE */}
          {interviewState === "setup" && (
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-8">
              <div className="w-20 h-20 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-[#8B5CF6] mb-4">
                <Clock size={40} />
              </div>
              <h2 className="text-3xl font-bold">Configure Your Session</h2>
              <p className="text-[#9CA3AF]">
                Select your target interview duration. You will have exactly 30
                seconds to answer each technical question before time expires.
              </p>

              <div className="grid grid-cols-3 gap-4 w-full">
                {[5, 10, 15].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDurationLimit(min)}
                    className={`py-4 rounded-xl border-2 transition-all font-bold ${durationLimit === min ? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6]" : "border-gray-800 bg-[#1A1D27] text-gray-400 hover:border-gray-600"}`}
                  >
                    {min} Minutes
                  </button>
                ))}
              </div>

              <button
                onClick={startInterview}
                disabled={!allScriptsLoaded}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${!allScriptsLoaded ? "bg-gray-800 text-gray-500 cursor-not-allowed" : "bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.3)]"}`}
              >
                {!allScriptsLoaded
                  ? "Loading Vision Models..."
                  : "Start Technical Screen"}
              </button>
            </div>
          )}

          {/* ACTIVE INTERVIEW STATE */}
          {interviewState === "active" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full min-h-0">
              {/* Video Feed */}
              <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-4 flex flex-col min-h-0">
                <div className="flex-1 bg-black rounded-lg relative overflow-hidden flex items-center justify-center">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-contain rounded-lg transform scale-x-[-1]"
                    playsInline
                    muted
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {gazeAlert && (
                      <div className="bg-red-500/90 text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 border border-red-400">
                        <AlertTriangle size={15} /> Eye contact lost!
                      </div>
                    )}
                    {postureAlert && (
                      <div className="bg-amber-500/90 text-white px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-2 border border-amber-400">
                        <AlertTriangle size={15} /> Slouching detected
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Chat & Controls */}
              <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-5 flex flex-col h-full min-h-0">
                <div className="flex justify-between items-center border-b border-gray-800 pb-3">
                  <h2 className="font-bold text-[#8B5CF6]">Interviewer: Mia</h2>
                  <div className="flex items-center gap-2 text-sm font-mono">
                    <span
                      className={
                        questionTimeLeft < 10
                          ? "text-red-400 animate-pulse"
                          : "text-gray-400"
                      }
                    >
                      00:{questionTimeLeft.toString().padStart(2, "0")}
                    </span>
                  </div>
                </div>

                <div
                  ref={chatScrollContainerRef}
                  className="flex-1 overflow-y-auto space-y-4 py-4 pr-2"
                >
                  {chatLog.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}
                    >
                      <span className="text-[11px] text-[#9CA3AF] mb-1 px-1">
                        {msg.sender}
                      </span>
                      <div
                        className={`p-3.5 rounded-xl text-sm leading-relaxed max-w-[85%] ${msg.sender === "You" ? "bg-[#8B5CF6] text-white rounded-tr-none" : "bg-[#0F111A] border border-gray-800 text-gray-200 rounded-tl-none"}`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  {isAiThinking && (
                    <div className="flex flex-col items-start">
                      <span className="text-[11px] text-[#9CA3AF] mb-1 px-1">
                        Mia
                      </span>
                      <div className="p-3.5 rounded-xl bg-[#0F111A] border border-gray-800 text-gray-400 rounded-tl-none flex gap-1.5 items-center">
                        <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce delay-100"></span>
                        <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce delay-200"></span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-800 flex justify-center gap-6 shrink-0">
                  <button
                    onClick={() =>
                      isListening
                        ? recognitionRef.current?.stop()
                        : recognitionRef.current?.start()
                    }
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isListening ? "bg-red-500 animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]" : "bg-[#8B5CF6] hover:bg-[#7C3AED]"}`}
                  >
                    {isListening ? <Mic size={24} /> : <MicOff size={24} />}
                  </button>
                  <button
                    onClick={() => handleSkip("User manually skipped.")}
                    disabled={!isListening}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${!isListening ? "bg-gray-800 opacity-50 cursor-not-allowed text-gray-500" : "bg-gray-800 hover:bg-gray-700 text-white"}`}
                  >
                    <SkipForward size={24} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* SUMMARY STATE */}
          {interviewState === "summary" && (
            <div className="h-full flex flex-col items-center justify-center max-w-3xl mx-auto text-center space-y-6">
              {!summaryData ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                  <h2 className="text-xl font-bold text-[#8B5CF6]">
                    Mia is grading your interview...
                  </h2>
                  <p className="text-[#9CA3AF]">
                    Analyzing technical depth, filler words, and body language.
                  </p>
                </div>
              ) : (
                <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-8 w-full text-left overflow-y-auto max-h-full">
                  <div className="flex items-center gap-3 mb-6 border-b border-gray-800 pb-4">
                    <CheckCircle className="text-green-400 w-8 h-8" />
                    <h2 className="text-2xl font-bold">Performance Report</h2>
                  </div>
                  <div className="prose prose-invert max-w-none text-gray-300">
                    {/* Render the markdown summary directly from the AI */}
                    <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed bg-[#0F111A] p-6 rounded-lg border border-gray-800">
                      {summaryData}
                    </pre>
                  </div>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-8 px-6 py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-lg font-bold w-full"
                  >
                    Start New Interview
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
