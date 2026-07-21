// import React, { useState } from "react";
// import { Sparkles, Layout, MessageSquare, FileText, Loader2, TrendingUp, Quote, RefreshCw } from "lucide-react";

// export default function BriefView({ onNavigate }) {
//   const [brief, setBrief] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   const generateBrief = async () => {
//     setLoading(true);
//     setError("");
//     try {
//       const res = await fetch("http://localhost:5000/api/synthesize", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ project_id: 1 }),
//       });
//       const data = await res.json();
//       if (res.ok) {
//         setBrief(data);
//       } else {
//         setError(data.error || "Failed to generate brief.");
//       }
//     } catch (err) {
//       console.error(err);
//       setError("Failed to connect to the server.");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="flex min-h-screen bg-[#F8FAFC]">
//       <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between fixed h-full">
//         <div>
//           <div className="flex items-center gap-2 mb-10 px-2">
//             <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
//               <Sparkles size={20} />
//             </div>
//             <span className="text-xl font-bold text-slate-900 tracking-tight">Refract</span>
//           </div>
//           <nav className="space-y-1">
//             <button
//               onClick={() => onNavigate("dashboard")}
//               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm"
//             >
//               <Layout size={18} /> Dashboard
//             </button>
//             <button
//               onClick={() => onNavigate("insights")}
//               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm"
//             >
//               <MessageSquare size={18} /> Insights
//             </button>
//             <button
//               onClick={() => onNavigate("brief")}
//               className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm"
//             >
//               <FileText size={18} /> Research Brief
//             </button>
//           </nav>
//         </div>
//         <div className="text-xs text-slate-400 px-3">v1.0.0 Alpha</div>
//       </aside>

//       <main className="flex-1 ml-64 p-10 max-w-4xl">
//         <header className="flex items-start justify-between mb-8">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Research Brief</h1>
//             <p className="text-slate-500 text-sm">
//               AI-synthesized summary of every confirmed insight — themes, priorities, evidence.
//             </p>
//           </div>
//           <button
//             onClick={generateBrief}
//             disabled={loading}
//             className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white transition shadow-lg shadow-indigo-100 active:scale-95 ${
//               loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
//             }`}
//           >
//             {loading ? (
//               <><Loader2 size={18} className="animate-spin" /> Synthesizing...</>
//             ) : brief ? (
//               <><RefreshCw size={18} /> Regenerate</>
//             ) : (
//               <><Sparkles size={18} /> Generate Brief</>
//             )}
//           </button>
//         </header>

//         {error && (
//           <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
//             {error}
//             {error.includes("No confirmed") && (
//               <p className="mt-1 text-xs text-red-500">
//                 Go to the Insights tab and confirm at least one insight first.
//               </p>
//             )}
//           </div>
//         )}

//         {!brief && !loading && !error && (
//           <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
//             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//               <FileText className="text-slate-300" size={32} />
//             </div>
//             <h2 className="text-xl font-bold text-slate-800 mb-2">No brief yet</h2>
//             <p className="text-slate-500 max-w-sm mx-auto">
//               Confirm a few insights in the Insights tab, then generate a synthesized brief here.
//             </p>
//           </div>
//         )}

//         {brief && (
//           <div className="space-y-6">
//             <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
//               <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Executive Summary</h3>
//               <p className="text-slate-800 leading-relaxed">{brief.executive_summary}</p>
//             </div>

//             <div className="bg-slate-900 rounded-2xl p-6 shadow-sm">
//               <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
//                 <TrendingUp size={14} /> Top Priority
//               </div>
//               <p className="text-white font-semibold text-lg">{brief.top_priority}</p>
//             </div>

//             <div>
//               <h3 className="text-sm font-bold text-slate-700 mb-4">Recurring Themes</h3>
//               <div className="space-y-4">
//                 {brief.themes?.map((theme, idx) => (
//                   <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
//                     <div className="flex items-center justify-between mb-3">
//                       <div className="flex items-center gap-2">
//                         <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
//                           theme.category === 'Pain Point' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
//                         }`}>
//                           {theme.category}
//                         </span>
//                         <h4 className="font-bold text-slate-800">{theme.title}</h4>
//                       </div>
//                       <span className="text-xs font-semibold text-slate-400">
//                         {theme.participant_count} participant{theme.participant_count !== 1 ? "s" : ""}
//                       </span>
//                     </div>
//                     <div className="space-y-2">
//                       {theme.insights?.map((insight, i) => (
//                         <div key={i} className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
//                           <Quote size={12} className="mt-0.5 shrink-0 text-slate-300" />
//                           <div>
//                             <span className="italic">"{insight.quote}"</span>
//                             <span className="text-slate-400 font-medium"> — {insight.participant_name}</span>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }

import React, { useState } from "react";
import { Sparkles, Layout, MessageSquare, FileText, Loader2, TrendingUp, Quote, RefreshCw, Download } from "lucide-react";

function buildMarkdown(brief) {
  let md = `# Research Brief\n\n`;
  md += `_Generated ${new Date().toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}_\n\n`;
  md += `## Executive Summary\n\n${brief.executive_summary}\n\n`;
  md += `## Top Priority\n\n**${brief.top_priority}**\n\n`;
  md += `## Recurring Themes\n\n`;
  brief.themes?.forEach((theme) => {
    md += `### ${theme.title} (${theme.category})\n\n`;
    md += `_Mentioned by ${theme.participant_count} participant${theme.participant_count !== 1 ? "s" : ""}_\n\n`;
    theme.insights?.forEach((insight) => {
      md += `> "${insight.quote}" — ${insight.participant_name}\n\n`;
    });
  });
  return md;
}

function downloadMarkdown(brief) {
  const md = buildMarkdown(brief);
  const blob = new Blob([md], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `refract-brief-${new Date().toISOString().slice(0, 10)}.md`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export default function BriefView({ onNavigate }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generateBrief = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: 1 }),
      });
      const data = await res.json();
      if (res.ok) {
        setBrief(data);
      } else {
        setError(data.error || "Failed to generate brief.");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition text-sm"
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
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm"
            >
              <FileText size={18} /> Research Brief
            </button>
          </nav>
        </div>
        <div className="text-xs text-slate-400 px-3">v1.0.0 Alpha</div>
      </aside>

      <main className="flex-1 ml-64 p-10 max-w-4xl">
        <header className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Research Brief</h1>
            <p className="text-slate-500 text-sm">
              AI-synthesized summary of every confirmed insight — themes, priorities, evidence.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {brief && (
              <button
                onClick={() => downloadMarkdown(brief)}
                className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-slate-50 transition shadow-sm"
              >
                <Download size={16} /> Export Markdown
              </button>
            )}
            <button
              onClick={generateBrief}
              disabled={loading}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white transition shadow-lg shadow-indigo-100 active:scale-95 ${
                loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700"
              }`}
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Synthesizing...</>
              ) : brief ? (
                <><RefreshCw size={18} /> Regenerate</>
              ) : (
                <><Sparkles size={18} /> Generate Brief</>
              )}
            </button>
          </div>
        </header>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">
            {error}
            {error.includes("No confirmed") && (
              <p className="mt-1 text-xs text-red-500">
                Go to the Insights tab and confirm at least one insight first.
              </p>
            )}
          </div>
        )}

        {!brief && !loading && !error && (
          <div className="text-center py-24 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <FileText className="text-slate-300" size={32} />
            </div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">No brief yet</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Confirm a few insights in the Insights tab, then generate a synthesized brief here.
            </p>
          </div>
        )}

        {brief && (
          <div className="space-y-6">
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">Executive Summary</h3>
              <p className="text-slate-800 leading-relaxed">{brief.executive_summary}</p>
            </div>

            <div className="bg-slate-900 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-widest mb-2">
                <TrendingUp size={14} /> Top Priority
              </div>
              <p className="text-white font-semibold text-lg">{brief.top_priority}</p>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-700 mb-4">Recurring Themes</h3>
              <div className="space-y-4">
                {brief.themes?.map((theme, idx) => (
                  <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
                          theme.category === 'Pain Point' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
                        }`}>
                          {theme.category}
                        </span>
                        <h4 className="font-bold text-slate-800">{theme.title}</h4>
                      </div>
                      <span className="text-xs font-semibold text-slate-400">
                        {theme.participant_count} participant{theme.participant_count !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="space-y-2">
                      {theme.insights?.map((insight, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
                          <Quote size={12} className="mt-0.5 shrink-0 text-slate-300" />
                          <div>
                            <span className="italic">"{insight.quote}"</span>
                            <span className="text-slate-400 font-medium"> — {insight.participant_name}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}