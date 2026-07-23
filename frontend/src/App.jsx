


import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, UploadCloud, ArrowRight, CheckCircle2, Quote, Zap } from "lucide-react";
import Dashboard from "./views/Dashboard";
import InsightsView from "./views/InsightsView";
import BriefView from "./views/BriefView";
import ParticipantsView from "./views/ParticipantsView";
import UploadModal from "./components/UploadModal";
import { API_BASE_URL } from "./config";

export default function App() {
  const [view, setView] = useState("home");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInterviews = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/interviews`);
      const data = await res.json();
      setInterviews(data);
    } catch (err) {
      console.error("Failed to fetch interviews:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInterviews();
  }, [fetchInterviews]);

  const handleAnalysisComplete = () => {
    fetchInterviews();
    setView("dashboard");
    setIsModalOpen(false);
  };

  const handleDeleteInterview = async (id) => {
    setInterviews((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await fetch(`http://localhost:5000/api/interviews/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Failed to delete interview:", err);
      fetchInterviews();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-indigo-100 selection:text-indigo-700">
      <nav className="fixed top-0 w-full z-[100] bg-white/70 backdrop-blur-xl border-b border-slate-200/60 px-6 md:px-10 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView("home")}>
            <div className="bg-indigo-600 p-1.5 rounded-lg shadow-md group-hover:scale-105 transition-transform">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tighter">Refract<span className="text-indigo-600">.ai</span></span>
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => setView("dashboard")}
              className={`text-[13px] font-bold transition-colors ${view === 'dashboard' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setView("insights")}
              className={`text-[13px] font-bold transition-colors ${view === 'insights' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Insights
            </button>
            <button
              onClick={() => setView("brief")}
              className={`text-[13px] font-bold transition-colors ${view === 'brief' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Brief
            </button>
            <button
              onClick={() => setView("participants")}
              className={`text-[13px] font-bold transition-colors ${view === 'participants' ? 'text-indigo-600' : 'text-slate-500 hover:text-indigo-600'}`}
            >
              Participants
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center gap-1.5 bg-slate-900 text-white px-4 py-2 rounded-full font-bold text-[12px] transition-all hover:bg-indigo-600 active:scale-95"
            >
              <UploadCloud size={14} />
              Analyze Now
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-16">
        {view === "home" ? (
          <LandingPage onStart={() => setIsModalOpen(true)} />
        ) : view === "insights" ? (
          <InsightsView onNavigate={setView} />
        ) : view === "brief" ? (
          <BriefView onNavigate={setView} />
        ) : view === "participants" ? (
          <ParticipantsView onNavigate={setView} />
        ) : (
          <Dashboard
            interviews={interviews}
            loading={loading}
            onOpenUpload={() => setIsModalOpen(true)}
            onNavigate={setView}
            onDeleteInterview={handleDeleteInterview}
          />
        )}
      </div>

      {isModalOpen && (
        <UploadModal
          onClose={() => setIsModalOpen(false)}
          onRefresh={handleAnalysisComplete}
        />
      )}
    </div>
  );
}

function LandingPage({ onStart }) {
  return (
    <div className="relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-50/40 via-transparent to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-6 md:px-12 pt-16 pb-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] font-bold uppercase tracking-wider">
              <Zap size={12} fill="currentColor" /> v1.0 Production Ready
            </div>

            <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.05] tracking-tight">
              Turn Voice into <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                Actionable Logic.
              </span>
            </h1>

            <p className="text-base text-slate-600 leading-relaxed max-w-md">
              The precision tool for founders to extract structured pain points and sentiment from messy transcripts — or raw interview recordings.
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <button
                onClick={onStart}
                className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Start Analyzing <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <div className="relative scale-95">
            <div className="bg-white rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.08)] border border-slate-100 relative z-20">
              <div className="flex items-center gap-1.5 mb-5 border-b border-slate-50 pb-4">
                <div className="h-2.5 w-2.5 rounded-full bg-rose-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                <div className="ml-3 h-3 w-24 bg-slate-100 rounded-full" />
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex gap-2.5">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex-shrink-0" />
                  <div className="space-y-1.5 w-full">
                    <div className="h-3 w-3/4 bg-slate-100 rounded" />
                    <div className="h-3 w-1/2 bg-slate-50 rounded" />
                  </div>
                </div>
                <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100/50 italic text-indigo-700 text-[12px] leading-snug">
                  "I love the dash, but the export button is hard to find."
                </div>
              </div>

              <div className="bg-slate-900 rounded-xl p-4 text-white shadow-lg translate-x-4">
                <div className="flex items-center gap-1.5 mb-3 text-indigo-400 font-bold text-[10px] uppercase tracking-widest">
                  <Sparkles size={12} /> Insight Detected
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="bg-indigo-600/20 p-1.5 rounded text-indigo-400">
                    <CheckCircle2 size={14} />
                  </div>
                  <div>
                    <h4 className="font-bold text-[12px] mb-0.5">Feature Friction</h4>
                    <p className="text-slate-400 text-[11px] leading-tight">UX redesign needed for the export module.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 bg-white p-4 rounded-xl shadow-lg border border-slate-100 z-30 max-w-[200px]">
              <Quote size={18} className="text-indigo-600 mb-1.5 opacity-20" />
              <p className="text-[12px] font-bold text-slate-800 leading-tight">"Refract cut our research time by 80%."</p>
              <p className="text-[9px] text-slate-400 mt-1.5 font-black uppercase tracking-widest">— Better Studio</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}