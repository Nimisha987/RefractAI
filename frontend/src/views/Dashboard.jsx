



import React, { useState, useEffect } from "react";
import { Sparkles, Plus, MessageSquare, Layout, Search, Clock, ChevronDown, ChevronUp, Quote, FileText, TrendingUp, Trash2, Users } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { API_BASE_URL } from "../config";

export default function Dashboard({ interviews, loading, onOpenUpload, onNavigate, onDeleteInterview }) {
  const [expandedId, setExpandedId] = useState(null);
  const [trends, setTrends] = useState([]);
  const [trendsLoading, setTrendsLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      setTrendsLoading(true);
      try {
        const res = await fetch(`${API_BASE_URL}/api/trends?project_id=1`);
        const data = await res.json();
        setTrends(data);
      } catch (err) {
        console.error("Failed to fetch trends:", err);
      } finally {
        setTrendsLoading(false);
      }
    };
    fetchTrends();
  }, [interviews]);

  const formatDate = (iso) => {
    if (!iso) return "Unknown date";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const formatChartDate = (dateStr) => {
    if (!dateStr || dateStr === "unknown") return dateStr;
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric" });
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
            <button onClick={() => onNavigate("dashboard")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
              <Layout size={18} /> Dashboard
            </button>
            <button onClick={() => onNavigate("insights")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm">
              <MessageSquare size={18} /> Insights
            </button>
            <button onClick={() => onNavigate("brief")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm">
              <FileText size={18} /> Research Brief
            </button>
            <button onClick={() => onNavigate("participants")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm">
              <Users size={18} /> Participants
            </button>
          </nav>
        </div>
        <div className="text-xs text-slate-400 px-3">v1.0.0 Alpha</div>
      </aside>

      <main className="flex-1 ml-64 p-10">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Research Insights</h1>
            <p className="text-slate-500 text-sm">Convert transcripts into structured data.</p>
          </div>
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-indigo-100 active:scale-95"
          >
            <Plus size={20} /> New Analysis
          </button>
        </header>

        {!trendsLoading && trends.length > 1 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm mb-8">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp size={16} className="text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-700">Insight Volume Over Time</h3>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trends} margin={{ top: 5, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tickFormatter={formatChartDate} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} allowDecimals={false} />
                <Tooltip labelFormatter={formatChartDate} contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="pain_points" name="Pain Points" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="feature_requests" name="Feature Requests" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="interviews" name="Interviews" stroke="#6366f1" strokeWidth={2} strokeDasharray="4 2" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading your data...</div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="text-slate-300" size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No analysis found</h2>
            <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload a customer transcript to let the AI extract pain points.</p>
            <button onClick={onOpenUpload} className="text-indigo-600 font-bold hover:underline">
              Create your first project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {interviews.map((item) => {
              const isExpanded = expandedId === item.id;
              return (
                <div key={item.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                        <MessageSquare size={20} />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                          item.sentiment_score === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
                          item.sentiment_score === 'Negative' ? 'bg-red-50 text-red-600' :
                          'bg-slate-100 text-slate-500'
                        }`}>
                          {item.sentiment_score}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`Delete ${item.participant_name}'s interview? This cannot be undone.`)) {
                              onDeleteInterview(item.id);
                            }
                          }}
                          className="text-slate-300 hover:text-red-500 transition p-1"
                          title="Delete interview"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                    <h3 className="font-bold text-slate-800 mb-1">{item.participant_name}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                      <Clock size={12} /> {formatDate(item.created_at)}
                      <span className="text-slate-300">·</span>
                      {item.insights.length} insight{item.insights.length !== 1 ? "s" : ""}
                    </div>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : item.id)}
                      className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center justify-center gap-1"
                    >
                      {isExpanded ? "Hide Report" : "View Full Report"}
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-3">
                      {item.insights.length === 0 ? (
                        <p className="text-xs text-slate-400">No insights extracted for this interview.</p>
                      ) : (
                        item.insights.map((insight) => (
                          <div key={insight.id} className="bg-white border border-slate-200 rounded-xl p-4">
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                              insight.category === 'Pain Point' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                            }`}>
                              {insight.category}
                            </span>
                            <p className="text-sm text-slate-700 mt-2">{insight.content}</p>
                            <div className="flex items-start gap-2 mt-3 text-xs text-slate-400 italic">
                              <Quote size={12} className="mt-0.5 shrink-0" />
                              "{insight.quote}"
                            </div>
                          </div>
                        ))
                      )}
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