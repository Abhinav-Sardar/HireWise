"use client";
import { useState, useEffect, useRef } from "react";

import Script from "next/script";
import {
  Mic,
  MicOff,
  Video,
  PhoneOff,
  Pause,
  Settings,
  Clock,
  AlertTriangle,
  MessageSquare,
  CheckCircle,
} from "lucide-react";
import { HWLogo } from "../components/Sidebar";

export default function InterviewPage() {
  const [interviewState, setInterviewState] = useState("setup");
  const [durationLimit, setDurationLimit] = useState(10);

  const [overallTimeLeft, setOverallTimeLeft] = useState(0);
  const [questionTimeLeft, setQuestionTimeLeft] = useState(30);
  const [questionCount, setQuestionCount] = useState(1);

  const [isActive, setIsActive] = useState(false);
  const [scriptsLoaded, setScriptsLoaded] = useState({
    face: false,
    pose: false,
  });

  const [gazeAlert, setGazeAlert] = useState(false);
  const [postureAlert, setPostureAlert] = useState(false);
  const gazeViolationSeconds = useRef(0);
  const postureViolationSeconds = useRef(0);

  const [chatLog, setChatLog] = useState([]);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [fillerWordCount, setFillerWordCount] = useState(0);
  const [wpm, setWpm] = useState(0);
  const [avgDelay, setAvgDelay] = useState(0);

  const [isListening, setIsListening] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [summaryData, setSummaryData] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const requestRef = useRef(null);
  const recognitionRef = useRef(null);
  const faceMeshRef = useRef(null);
  const poseRef = useRef(null);
  const chatScrollContainerRef = useRef(null);

  const chatLogRef = useRef(chatLog);
  const startTimeRef = useRef(Date.now());
  const miaFinishedTimeRef = useRef(null);
  const speechDelaysRef = useRef([]);

  useEffect(() => {
    chatLogRef.current = chatLog;
    if (chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [chatLog, liveTranscript, isAiThinking]);

  useEffect(() => {
    let interval = null;
    if (interviewState === "active" && overallTimeLeft > 0) {
      interval = setInterval(() => {
        setOverallTimeLeft((prev) => prev - 1);
        if (gazeAlert) gazeViolationSeconds.current += 1;
        if (postureAlert) postureViolationSeconds.current += 1;

        const elapsedMinutes = (Date.now() - startTimeRef.current) / 60000;
        const totalWords = chatLogRef.current
          .filter((m) => m.sender === "You")
          .reduce((acc, curr) => acc + curr.text.split(" ").length, 0);
        if (elapsedMinutes > 0) setWpm(Math.round(totalWords / elapsedMinutes));
      }, 1000);
    } else if (interviewState === "active" && overallTimeLeft <= 0) {
      endInterview();
    }
    return () => clearInterval(interval);
  }, [interviewState, overallTimeLeft, gazeAlert, postureAlert]);

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
      handleSendMessage(liveTranscript || "[Time Expired]", chatLogRef.current);
    }
    return () => clearInterval(interval);
  }, [interviewState, isListening, questionTimeLeft, liveTranscript]);

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event) => {
        if (miaFinishedTimeRef.current) {
          const delay = (Date.now() - miaFinishedTimeRef.current) / 1000;
          speechDelaysRef.current.push(delay);
          const avg =
            speechDelaysRef.current.reduce((a, b) => a + b, 0) /
            speechDelaysRef.current.length;
          setAvgDelay(avg);
          miaFinishedTimeRef.current = null;
        }

        let interim = "";
        let final = "";
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) final += event.results[i][0].transcript;
          else interim += event.results[i][0].transcript;
        }

        if (interim) {
          setLiveTranscript(interim);
          const fillers = (interim.match(/\b(um|uh|like|basically)\b/gi) || [])
            .length;
          if (fillers > 0) setFillerWordCount((prev) => prev + fillers);
        }

        if (final.trim()) {
          setLiveTranscript("");
          handleSendMessage(final, chatLogRef.current);
        }
      };
      recognition.onerror = (e) => {
        if (e.error !== "aborted") setIsListening(false);
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

  const speakText = (text) => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(
      (v) =>
        v.name.match(/female/i) ||
        v.name.includes("Zira") ||
        v.name.includes("Samantha"),
    );
    if (femaleVoice) {
      utterance.voice = femaleVoice;
      utterance.pitch = 1.1;
    }

    utterance.onstart = () => {
      setIsListening(false);
      setQuestionTimeLeft(30);
      miaFinishedTimeRef.current = null;
      try {
        recognitionRef.current?.stop();
      } catch (e) {}
    };
    utterance.onend = () => {
      setIsListening(true);
      miaFinishedTimeRef.current = Date.now();
      try {
        recognitionRef.current?.start();
      } catch (e) {}
    };
    window.speechSynthesis.speak(utterance);
  };

  const startInterview = () => {
    setInterviewState("active");
    setIsActive(true);
    setOverallTimeLeft(durationLimit * 60);
    setQuestionTimeLeft(30);
    startTimeRef.current = Date.now();

    const initMsg =
      "Hi, let's start your SWE technical screen. You have 30 seconds per question. To start: Tell me about a challenging project you worked on and how you handled the database architecture.";
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
    if (streamRef.current)
      streamRef.current.getTracks().forEach((t) => t.stop());

    const currentMetrics = {
      fillerWords: fillerWordCount,
      averageSpeechDelaySeconds: avgDelay.toFixed(2),
      gazeViolationsSeconds: gazeViolationSeconds.current,
      postureViolationsSeconds: postureViolationSeconds.current,
    };

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          history: chatLogRef.current,
          mode: "summarize",
          metrics: currentMetrics,
        }),
      });
      const data = await res.json();
      setSummaryData(data);
    } catch (err) {
      setSummaryData({ realityCheck: "Grading failed. Check API logs." });
    }
  };

  const handleSendMessage = async (userText, currentHistory) => {
    if (!userText.trim()) return;
    setLiveTranscript("");

    const updatedLog = [...currentHistory, { sender: "You", text: userText }];
    setChatLog(updatedLog);
    setIsAiThinking(true);
    setIsListening(false);
    setQuestionCount((prev) => prev + 1);
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
      if (!res.ok) throw new Error(data.error);

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
      if (streamRef.current)
        streamRef.current.getTracks().forEach((t) => t.stop());
      if (faceMeshRef.current) faceMeshRef.current.close();
      if (poseRef.current) poseRef.current.close();
    };
  }, [isActive, scriptsLoaded]);

  const formatTime = (secs) =>
    `${Math.floor(secs / 60)
      .toString()
      .padStart(2, "0")}:${(secs % 60).toString().padStart(2, "0")}`;
  const allScriptsLoaded = scriptsLoaded.face && scriptsLoaded.pose;

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

      <div className="min-h-screen bg-[#0F111A] text-white flex flex-col font-sans">
        {/* Integrated Logo Header */}
        <header className="flex justify-between items-center px-8 py-4 border-b border-gray-800 shrink-0">
          <div className="flex items-center gap-4">
            <div className="bg-[#1A1D27] p-2 rounded-xl border border-gray-800 shadow-md">
              <HWLogo className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">
              Active Interview Dashboard
            </h1>
          </div>
          <div className="flex items-center gap-2 bg-[#1A1D27] px-4 py-2 rounded-full border border-gray-800">
            <span className="text-sm font-medium text-[#8B5CF6]">
              SWE Technical Screen
            </span>
          </div>
        </header>

        <div className="flex-1 p-8 overflow-hidden flex flex-col">
          {interviewState === "setup" && (
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-8">
              <div className="w-20 h-20 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center text-[#8B5CF6] mb-4">
                <Clock size={40} />
              </div>
              <h2 className="text-3xl font-bold">Configure Your Session</h2>
              <div className="grid grid-cols-3 gap-4 w-full">
                {[5, 10, 15].map((min) => (
                  <button
                    key={min}
                    onClick={() => setDurationLimit(min)}
                    className={`py-4 rounded-xl border-2 transition-all font-bold ${durationLimit === min ? "border-[#8B5CF6] bg-[#8B5CF6]/10 text-[#8B5CF6]" : "border-gray-800 bg-[#1A1D27] text-gray-400"}`}
                  >
                    {min} Min
                  </button>
                ))}
              </div>
              <button
                onClick={startInterview}
                disabled={!allScriptsLoaded}
                className="w-full py-4 rounded-xl font-bold text-lg bg-[#8B5CF6] hover:bg-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.3)] disabled:opacity-50"
              >
                Start Technical Screen
              </button>
            </div>
          )}

          {interviewState === "active" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full flex-1 min-h-0">
              {/* Column 1: Video */}
              <div className="lg:col-span-4 bg-[#1A1D27] rounded-xl border border-gray-800 p-4 flex flex-col h-full min-h-0">
                <div className="flex-1 bg-black rounded-lg relative overflow-hidden flex items-center justify-center mb-6">
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover rounded-lg transform scale-x-[-1]"
                    playsInline
                    muted
                  />
                  <div className="absolute top-4 left-4 flex flex-col gap-2 z-10">
                    {gazeAlert && (
                      <div className="bg-red-500/90 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2">
                        <AlertTriangle size={15} /> Eye contact lost
                      </div>
                    )}
                    {postureAlert && (
                      <div className="bg-amber-500/90 text-white px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-2">
                        <AlertTriangle size={15} /> Slouching
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center gap-4 shrink-0">
                  <button
                    className={`w-12 h-12 rounded-full flex items-center justify-center ${isListening ? "bg-[#8B5CF6]" : "bg-gray-800"}`}
                  >
                    {isListening ? (
                      <Mic size={20} className="text-white" />
                    ) : (
                      <MicOff size={20} className="text-gray-400" />
                    )}
                  </button>
                  <button
                    onClick={endInterview}
                    className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center hover:bg-red-600"
                  >
                    <PhoneOff size={20} className="text-white" />
                  </button>
                </div>
              </div>

              {/* Column 2: Split Chat & Transcript */}
              <div className="lg:col-span-5 flex flex-col gap-6 h-full min-h-0">
                <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-6 flex-1 flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2 shrink-0">
                    <span className="text-[#8B5CF6] font-bold flex items-center gap-2">
                      <MessageSquare size={16} /> Interview Chat
                    </span>
                    <span className="text-xs text-gray-500 font-mono">
                      Q{questionCount}
                    </span>
                  </div>

                  <div
                    ref={chatScrollContainerRef}
                    className="flex-1 overflow-y-auto space-y-4 pr-2"
                  >
                    {chatLog.map((msg, i) => (
                      <div
                        key={i}
                        className={`flex flex-col ${msg.sender === "You" ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[11px] text-gray-500 mb-1 px-1">
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
                        <span className="text-[11px] text-gray-500 mb-1 px-1">
                          Mia
                        </span>
                        <div className="p-3.5 rounded-xl bg-[#0F111A] border border-gray-800 rounded-tl-none flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#8B5CF6] rounded-full animate-bounce"></span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-6 h-48 flex flex-col shrink-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-400 font-bold text-sm flex items-center gap-2">
                      <Mic size={14} /> Live Transcript
                    </span>
                    <span
                      className={`text-xs font-mono ${questionTimeLeft < 10 ? "text-red-400" : "text-gray-500"}`}
                    >
                      00:{questionTimeLeft.toString().padStart(2, "0")}
                    </span>
                  </div>
                  <div className="flex-1 bg-[#0F111A] border border-gray-800 rounded-lg p-4 overflow-y-auto">
                    <p className="text-gray-300 text-sm">
                      {liveTranscript ||
                        (isListening ? (
                          <span className="text-gray-600 italic">
                            Speak now...
                          </span>
                        ) : (
                          <span className="text-gray-600 italic">
                            Mic muted.
                          </span>
                        ))}
                    </p>
                  </div>
                </div>
              </div>

              {/* Column 3: 3 Insights */}
              <div className="lg:col-span-3 bg-[#1A1D27] rounded-xl border border-gray-800 p-6 flex flex-col h-full min-h-0">
                <div className="flex justify-between items-center mb-6 shrink-0">
                  <h3 className="font-bold text-white">Live Insights</h3>
                  <span className="text-xs font-mono text-[#8B5CF6]">
                    {formatTime(durationLimit * 60 - overallTimeLeft)}
                  </span>
                </div>

                <div className="space-y-8 flex-1 overflow-y-auto pr-2">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Speaking Pace</span>
                      <span className="text-white font-bold">{wpm} WPM</span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-2">
                      <div
                        className="h-full bg-[#8B5CF6]"
                        style={{ width: `${Math.min(wpm / 2, 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Filler Words</span>
                      <span className="text-white font-bold">
                        {fillerWordCount}
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-2">
                      <div
                        className="h-full bg-amber-500"
                        style={{
                          width: `${Math.min(fillerWordCount * 5, 100)}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Avg Speech Delay</span>
                      <span className="text-white font-bold">
                        {avgDelay.toFixed(1)}s
                      </span>
                    </div>
                    <div className="h-1.5 bg-gray-800 rounded-full mt-2">
                      <div
                        className="h-full bg-red-500"
                        style={{ width: `${Math.min(avgDelay * 10, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SUMMARY STATE */}
          {interviewState === "summary" && (
            <div className="h-full flex flex-col items-center justify-center max-w-4xl mx-auto space-y-6 w-full">
              {!summaryData ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                  <h2 className="text-xl font-bold text-[#8B5CF6]">
                    Generating Final Reality Check...
                  </h2>
                </div>
              ) : (
                <div className="bg-[#1A1D27] rounded-xl border border-gray-800 p-8 w-full">
                  <div className="flex items-center justify-between mb-8 border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="text-[#8B5CF6] w-8 h-8" />
                      <h2 className="text-3xl font-bold">Interview Graded</h2>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Overall Score</p>
                      <p
                        className={`text-4xl font-black ${summaryData.overallScore >= 70 ? "text-green-400" : "text-red-400"}`}
                      >
                        {summaryData.overallScore}/100
                      </p>
                    </div>
                  </div>

                  <div className="space-y-6 mb-8">
                    <div>
                      <h3 className="font-bold text-white mb-2">
                        Technical Correctness
                      </h3>
                      <p className="text-sm text-gray-300 bg-[#0F111A] p-4 rounded-lg border border-gray-800 leading-relaxed">
                        {summaryData.technicalFeedback}
                      </p>
                    </div>
                    <div>
                      <h3 className="font-bold text-white mb-2">
                        Body Language & Telemetry
                      </h3>
                      <p className="text-sm text-gray-300 bg-[#0F111A] p-4 rounded-lg border border-gray-800 leading-relaxed">
                        {summaryData.behavioralFeedback}
                      </p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <h3 className="font-bold text-white mb-3">Reality Check</h3>
                    <p className="text-sm text-white leading-relaxed border-l-4 border-red-500 pl-4 bg-red-500/10 p-4 rounded-r-lg italic font-medium">
                      "{summaryData.realityCheck}"
                    </p>
                  </div>

                  <button
                    onClick={() => window.location.reload()}
                    className="w-full py-4 bg-[#8B5CF6] hover:bg-[#7C3AED] rounded-xl font-bold"
                  >
                    Start Another Session
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
