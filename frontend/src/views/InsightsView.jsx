
import React, { useState, useEffect, useCallback } from "react";
import { Sparkles, Layout, MessageSquare, Search, Quote, Clock, Filter, Check, X, Download, FileText, Trash2, Users } from "lucide-react";

export default function InsightsView({ onNavigate }) {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const buildParams = useCallback(() => {
    const params = new URLSearchParams();
    if (category !== "all") params.set("category", category);
    if (status !== "all") params.set("status", status);
    if (searchTerm.trim()) params.set("search", searchTerm.trim());
    return params;
  }, [category, status, searchTerm]);

  const fetchInsights = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/insights?${buildParams().toString()}`);
      const data = await res.json();
      setInsights(data);
    } catch (err) {
      console.error("Failed to fetch insights:", err);
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    const timeout = setTimeout(fetchInsights, 300);
    return () => clearTimeout(timeout);
  }, [fetchInsights]);

  const updateStatus = async (id, newStatus) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i)));
    try {
      const res = await fetch(`http://localhost:5000/api/insights/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Update failed");
    } catch (err) {
      console.error("Failed to update insight status:", err);
      fetchInsights();
    }
  };

  const deleteInsight = async (id) => {
    setInsights((prev) => prev.filter((i) => i.id !== id));
    try {
      const res = await fetch(`http://localhost:5000/api/insights/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
    } catch (err) {
      console.error("Failed to delete insight:", err);
      fetchInsights();
    }
  };

  const handleExport = () => {
    window.location.href = `http://localhost:5000/api/insights/export?${buildParams().toString()}`;
  };

  const formatDate = (iso) => {
    if (!iso) return "Unknown date";
    return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  const painPointCount = insights.filter((i) => i.category === "Pain Point").length;
  const featureRequestCount = insights.filter((i) => i.category === "Feature Request").length;
  const confirmedCount = insights.filter((i) => i.status === "confirmed").length;

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
            <button onClick={() => onNavigate("insights")} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
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
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">All Insights</h1>
            <p className="text-slate-500 text-sm">Every pain point and feature request, across every interview.</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            <Download size={16} /> Export CSV
          </button>
        </header>

        <div className="grid grid-cols-3 gap-4 mb-8 max-w-xl">
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Pain Points</p>
            <p className="text-2xl font-bold text-slate-900">{painPointCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-1">Feature Requests</p>
            <p className="text-2xl font-bold text-slate-900">{featureRequestCount}</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-1">Confirmed</p>
            <p className="text-2xl font-bold text-slate-900">{confirmedCount}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search insight content or quotes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
            <Filter size={14} className="text-slate-400 ml-2" />
            {["all", "Pain Point", "Feature Request"].map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  category === c ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-1">
            {["all", "pending", "confirmed", "rejected"].map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  status === s ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-400">Loading insights...</div>
        ) : insights.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <p className="text-slate-500">No insights match your filters.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition ${
                  insight.status === 'confirmed' ? 'border-emerald-200' :
                  insight.status === 'rejected' ? 'border-red-200 opacity-60' :
                  'border-slate-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                      insight.category === 'Pain Point' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                    }`}>
                      {insight.category}
                    </span>
                    {insight.status === 'confirmed' && (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-emerald-50 text-emerald-600">
                        Confirmed
                      </span>
                    )}
                    {insight.status === 'rejected' && (
                      <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md bg-red-50 text-red-500">
                        Rejected
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Clock size={12} /> {formatDate(insight.created_at)}
                  </div>
                </div>
                <p className="text-sm text-slate-800 mb-2">{insight.content}</p>
                <div className="flex items-start gap-2 text-xs text-slate-400 italic mb-4">
                  <Quote size={12} className="mt-0.5 shrink-0" />
                  "{insight.quote}"
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-xs text-slate-400 font-medium">
                    — {insight.participant_name}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateStatus(insight.id, 'confirmed')}
                      disabled={insight.status === 'confirmed'}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <Check size={13} /> Confirm
                    </button>
                    <button
                      onClick={() => updateStatus(insight.id, 'rejected')}
                      disabled={insight.status === 'rejected'}
                      className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
                    >
                      <X size={13} /> Reject
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm("Delete this insight? This cannot be undone.")) {
                          deleteInsight(insight.id);
                        }
                      }}
                      className="text-slate-300 hover:text-red-500 transition p-1.5"
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}