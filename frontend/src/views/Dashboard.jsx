import React, { useState } from "react";
import { Sparkles, Plus, MessageSquare, Layout, Search, Clock, ChevronDown, ChevronUp, Quote, FileText } from "lucide-react";

export default function Dashboard({ interviews, loading, onOpenUpload, onNavigate }) {
  const [expandedId, setExpandedId] = useState(null);

  const formatDate = (iso) => {
    if (!iso) return "Unknown date";
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
            <button
              onClick={() => onNavigate("dashboard")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm"
            >
              <Layout size={18} /> Dashboard
            </button>
            <button
              onClick={() => onNavigate("insights")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm"
            >
              <MessageSquare size={18} /> Insights
            </button>
            <button
              onClick={() => onNavigate("brief")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm"
            >
              <FileText size={18} /> Research Brief
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
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                        item.sentiment_score === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
                        item.sentiment_score === 'Negative' ? 'bg-red-50 text-red-600' :
                        'bg-slate-100 text-slate-500'
                      }`}>
                        {item.sentiment_score}
                      </span>
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