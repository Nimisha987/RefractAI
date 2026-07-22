import React, { useState, useEffect } from "react";
import { Sparkles, Layout, MessageSquare, FileText, Users, Clock, ChevronDown, ChevronUp, Quote } from "lucide-react";

export default function ParticipantsView({ onNavigate }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedName, setExpandedName] = useState(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      setLoading(true);
      try {
        const res = await fetch("http://localhost:5000/api/participants?project_id=1");
        const data = await res.json();
        setParticipants(data);
      } catch (err) {
        console.error("Failed to fetch participants:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchParticipants();
  }, []);

  const formatDate = (iso) => {
    if (!iso) return "Unknown";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between fixed h-full">
        <div>
          <div className="flex items-center gap-2 mb-10 px-2">
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
              <Sparkles size={20} />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Refract</span>
          </div>
          <nav className="space-y-1">
            <button onClick={() => onNavigate("dashboard")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm">
              <Layout size={18} /> Dashboard
            </button>
            <button onClick={() => onNavigate("insights")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm">
              <MessageSquare size={18} /> Insights
            </button>
            <button onClick={() => onNavigate("brief")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm">
              <FileText size={18} /> Research Brief
            </button>
            <button onClick={() => onNavigate("participants")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
              <Users size={18} /> Participants
            </button>
          </nav>
        </div>
        <div className="text-xs text-slate-400 px-3">v1.0.0 Alpha</div>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <header className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Participants</h1>
          <p className="text-slate-500 text-sm">Every person interviewed, grouped across all their sessions.</p>
        </header>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading participants...</div>
        ) : participants.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500">No participants yet. Analyze an interview to see them here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {participants.map((p) => {
              const isExpanded = expandedName === p.participant_name;
              return (
                <div key={p.participant_name} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <button
                    onClick={() => setExpandedName(isExpanded ? null : p.participant_name)}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50/50 transition text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-11 w-11 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
                        {p.participant_name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800">{p.participant_name}</h3>
                        <p className="text-xs text-slate-400">
                          {p.interview_count} interview{p.interview_count !== 1 ? "s" : ""}
                          {p.interview_count > 1 && (
                            <span className="ml-1 text-indigo-500 font-semibold">· repeat participant</span>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right text-xs">
                        <span className="text-red-500 font-semibold">{p.pain_point_count} pain points</span>
                        <span className="text-slate-300 mx-1.5">·</span>
                        <span className="text-blue-500 font-semibold">{p.feature_request_count} requests</span>
                      </div>
                      {isExpanded ? <ChevronUp size={18} className="text-slate-400" /> : <ChevronDown size={18} className="text-slate-400" />}
                    </div>
                  </button>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-4">
                      {p.interviews.map((interview) => (
                        <div key={interview.id} className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                              <Clock size={12} /> {formatDate(interview.created_at)}
                            </div>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                              interview.sentiment_score === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
                              interview.sentiment_score === 'Negative' ? 'bg-red-50 text-red-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {interview.sentiment_score}
                            </span>
                          </div>
                          {interview.insights.length === 0 ? (
                            <p className="text-xs text-slate-400">No insights extracted.</p>
                          ) : (
                            <div className="space-y-2">
                              {interview.insights.map((insight) => (
                                <div key={insight.id} className="flex items-start gap-2 text-xs bg-slate-50 rounded-lg p-3">
                                  <span className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded shrink-0 ${
                                    insight.category === 'Pain Point' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                                  }`}>
                                    {insight.category === 'Pain Point' ? 'PP' : 'FR'}
                                  </span>
                                  <div>
                                    <p className="text-slate-700">{insight.content}</p>
                                    <div className="flex items-start gap-1 mt-1 text-slate-400 italic">
                                      <Quote size={10} className="mt-0.5 shrink-0" />
                                      "{insight.quote}"
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}