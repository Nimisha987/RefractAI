// // // // import React, { useState, useEffect } from 'react';
// // // // import { Sparkles, LayoutDashboard, History, Settings, Plus, Activity, MessageCircle } from 'lucide-react';
// // // // import UploadModal from '../components/UploadModal';

// // // // export default function Dashboard() {
// // // //   const [interviews, setInterviews] = useState([]);
// // // //   const [isModalOpen, setIsModalOpen] = useState(false);

// // // //   const fetchInterviews = async () => {
// // // //     try {
// // // //       const res = await fetch('http://localhost:5000/api/dashboard');
// // // //       const data = await res.json();
// // // //       setInterviews(data);
// // // //     } catch (err) { console.error("Backend not running?"); }
// // // //   };

// // // //   useEffect(() => { fetchInterviews(); }, []);

// // // //   return (
// // // //     <div className="flex min-h-screen bg-[#F8FAFC]">
// // // //       {/* Sleek Sidebar */}
// // // //       <aside className="w-64 bg-white border-r border-gray-200 hidden lg:flex flex-col">
// // // //         <div className="p-6">
// // // //           <div className="flex items-center gap-2 text-indigo-600 font-bold text-xl tracking-tight">
// // // //             <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
// // // //               <Sparkles size={20} />
// // // //             </div>
// // // //             Refract AI
// // // //           </div>
// // // //         </div>
        
// // // //         <nav className="flex-1 px-4 space-y-1">
// // // //           <NavItem icon={<LayoutDashboard size={18}/>} label="Overview" active />
// // // //           <NavItem icon={<History size={18}/>} label="Interviews" />
// // // //           <NavItem icon={<Settings size={18}/>} label="Settings" />
// // // //         </nav>
// // // //       </aside>

// // // //       {/* Main Area */}
// // // //       <main className="flex-1">
// // // //         <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 sticky top-0 z-10">
// // // //           <h2 className="font-semibold text-gray-500">Project: User Research v1</h2>
// // // //           <button 
// // // //             onClick={() => setIsModalOpen(true)}
// // // //             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-all shadow-sm shadow-indigo-200"
// // // //           >
// // // //             <Plus size={18} /> New Analysis
// // // //           </button>
// // // //         </header>

// // // //         <div className="p-8 max-w-6xl mx-auto">
// // // //           {/* Stats Section */}
// // // //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
// // // //             <StatCard label="Total Interviews" value={interviews.length} icon={<MessageCircle className="text-blue-500"/>} />
// // // //             <StatCard label="Avg. Sentiment" value="Positive" icon={<Activity className="text-green-500"/>} />
// // // //             <StatCard label="Insights Found" value={interviews.reduce((acc, curr) => acc + curr.insight_count, 0)} icon={<Sparkles className="text-amber-500"/>} />
// // // //           </div>

// // // //           <h3 className="text-lg font-bold text-gray-800 mb-6">Recent Reports</h3>
          
// // // //           {/* Interview Grid */}
// // // //           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// // // //             {interviews.length > 0 ? interviews.map((item) => (
// // // //               <div key={item.id} className="group bg-white border border-gray-200 p-6 rounded-2xl hover:border-indigo-300 transition-all hover:shadow-xl hover:shadow-indigo-500/5 cursor-pointer">
// // // //                 <div className="flex justify-between items-start mb-4">
// // // //                   <div>
// // // //                     <h4 className="font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{item.name}</h4>
// // // //                     <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-semibold">Analyzed today</p>
// // // //                   </div>
// // // //                   <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
// // // //                     item.sentiment === 'Positive' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
// // // //                   }`}>
// // // //                     {item.sentiment}
// // // //                   </span>
// // // //                 </div>
// // // //                 <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-50">
// // // //                   <div className="text-sm text-gray-500 flex items-center gap-1">
// // // //                     <Sparkles size={14} className="text-indigo-400" />
// // // //                     <span className="font-medium text-gray-700">{item.insight_count}</span> Insights
// // // //                   </div>
// // // //                 </div>
// // // //               </div>
// // // //             )) : (
// // // //               <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-gray-200">
// // // //                 <p className="text-gray-400">No interviews analyzed yet. Click "New Analysis" to start.</p>
// // // //               </div>
// // // //             )}
// // // //           </div>
// // // //         </div>
// // // //       </main>

// // // //       {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)} onRefresh={fetchInterviews} />}
// // // //     </div>
// // // //   );
// // // // }

// // // // // Helper Components for Clean Code
// // // // function NavItem({ icon, label, active = false }) {
// // // //   return (
// // // //     <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors ${active ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:bg-gray-50'}`}>
// // // //       {icon} <span className="font-medium">{label}</span>
// // // //     </div>
// // // //   );
// // // // }

// // // // function StatCard({ label, value, icon }) {
// // // //   return (
// // // //     <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
// // // //       <div className="flex justify-between items-start">
// // // //         <div>
// // // //           <p className="text-sm font-medium text-gray-500">{label}</p>
// // // //           <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
// // // //         </div>
// // // //         <div className="p-2 bg-gray-50 rounded-lg">{icon}</div>
// // // //       </div>
// // // //     </div>
// // // //   );
// // // // }
// // // import React, { useState, useEffect } from "react";
// // // import { Sparkles, Plus, MessageSquare, Layout, Settings, BarChart3, Search, Clock } from "lucide-react";
// // // import UploadModal from "../components/UploadModal";

// // // export default function Dashboard() {
// // //   const [interviews, setInterviews] = useState([]);
// // //   const [isModalOpen, setIsModalOpen] = useState(false);
// // //   const [loading, setLoading] = useState(true);

// // //   const fetchInterviews = async () => {
// // //     setLoading(true);
// // //     try {
// // //       const res = await fetch("http://localhost:5000/api/interviews");
// // //       const data = await res.json();
// // //       setInterviews(data);
// // //     } catch (err) {
// // //       console.error("Failed to fetch interviews:", err);
// // //     } finally {
// // //       setLoading(false);
// // //     }
// // //   };

// // //   useEffect(() => {
// // //     fetchInterviews();
// // //   }, []);

// // //   return (
// // //     <div className="flex min-h-screen bg-[#F8FAFC]">
// // //       {/* Sidebar - Consistent Branding */}
// // //       <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between fixed h-full">
// // //         <div>
// // //           <div className="flex items-center gap-2 mb-10 px-2">
// // //             <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
// // //               <Sparkles size={20} />
// // //             </div>
// // //             <span className="text-xl font-bold text-slate-900 tracking-tight">Refract</span>
// // //           </div>
// // //           <nav className="space-y-1">
// // //             <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
// // //               <Layout size={18} /> Dashboard
// // //             </div>
// // //             <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition cursor-not-allowed text-sm">
// // //               <MessageSquare size={18} /> Interviews
// // //             </div>
// // //           </nav>
// // //         </div>
// // //         <div className="text-xs text-slate-400 px-3">v1.0.0 Alpha</div>
// // //       </aside>

// // //       {/* Main Content Area */}
// // //       <main className="flex-1 ml-64 p-10">
// // //         <header className="flex justify-between items-center mb-10">
// // //           <div>
// // //             <h1 className="text-2xl font-bold text-slate-900">Research Insights</h1>
// // //             <p className="text-slate-500 text-sm">Convert transcripts into structured data.</p>
// // //           </div>
// // //           <button 
// // //             onClick={() => setIsModalOpen(true)}
// // //             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-indigo-100 active:scale-95"
// // //           >
// // //             <Plus size={20} /> New Analysis
// // //           </button>
// // //         </header>

// // //         {/* Dynamic Display Logic */}
// // //         {loading ? (
// // //           <div className="flex items-center justify-center h-64 text-slate-400">Loading your data...</div>
// // //         ) : interviews.length === 0 ? (
// // //           <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
// // //             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
// // //               <Search className="text-slate-300" size={32} />
// // //             </div>
// // //             <h2 className="text-xl font-bold text-slate-800 mb-2">No analysis found</h2>
// // //             <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload a customer transcript to let the AI extract pain points.</p>
// // //             <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold hover:underline">
// // //               Create your first project
// // //             </button>
// // //           </div>
// // //         ) : (
// // //           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
// // //             {interviews.map((item) => (
// // //               <div key={item.id} className="bg-white border border-slate-200 p-6 rounded-2xl hover:border-indigo-300 transition-all group shadow-sm">
// // //                 <div className="flex justify-between items-start mb-4">
// // //                   <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 group-hover:bg-indigo-100 group-hover:text-indigo-600 transition">
// // //                     <MessageSquare size={20} />
// // //                   </div>
// // //                   <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
// // //                     item.sentiment === 'Positive' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'
// // //                   }`}>
// // //                     {item.sentiment}
// // //                   </span>
// // //                 </div>
// // //                 <h3 className="font-bold text-slate-800 mb-1">{item.name}</h3>
// // //                 <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
// // //                   <Clock size={12} /> {item.date}
// // //                 </div>
// // //                 <button className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-indigo-600 hover:text-white transition">
// // //                   View Full Report
// // //                 </button>
// // //               </div>
// // //             ))}
// // //           </div>
// // //         )}
// // //       </main>

// // //       {/* Modal - Only renders when state is true */}
// // //       {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)} onRefresh={fetchInterviews} />}
// // //     </div>
// // //   );
// // // }

// // import React, { useState, useEffect } from "react";
// // import { Sparkles, Plus, MessageSquare, Layout, Search, Clock, ChevronDown, ChevronUp, Quote } from "lucide-react";
// // import UploadModal from "../components/UploadModal";

// // export default function Dashboard() {
// //   const [interviews, setInterviews] = useState([]);
// //   const [isModalOpen, setIsModalOpen] = useState(false);
// //   const [loading, setLoading] = useState(true);
// //   const [expandedId, setExpandedId] = useState(null);

// //   const fetchInterviews = async () => {
// //     setLoading(true);
// //     try {
// //       const res = await fetch("http://localhost:5000/api/interviews");
// //       const data = await res.json();
// //       setInterviews(data);
// //     } catch (err) {
// //       console.error("Failed to fetch interviews:", err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchInterviews();
// //   }, []);

// //   const formatDate = (iso) => {
// //     if (!iso) return "Unknown date";
// //     return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
// //   };

// //   return (
// //     <div className="flex min-h-screen bg-[#F8FAFC]">
// //       <aside className="w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between fixed h-full">
// //         <div>
// //           <div className="flex items-center gap-2 mb-10 px-2">
// //             <div className="bg-indigo-600 p-1.5 rounded-lg text-white">
// //               <Sparkles size={20} />
// //             </div>
// //             <span className="text-xl font-bold text-slate-900 tracking-tight">Refract</span>
// //           </div>
// //           <nav className="space-y-1">
// //             <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
// //               <Layout size={18} /> Dashboard
// //             </div>
// //             <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition cursor-not-allowed text-sm">
// //               <MessageSquare size={18} /> Interviews
// //             </div>
// //           </nav>
// //         </div>
// //         <div className="text-xs text-slate-400 px-3">v1.0.0 Alpha</div>
// //       </aside>

// //       <main className="flex-1 ml-64 p-10">
// //         <header className="flex justify-between items-center mb-10">
// //           <div>
// //             <h1 className="text-2xl font-bold text-slate-900">Research Insights</h1>
// //             <p className="text-slate-500 text-sm">Convert transcripts into structured data.</p>
// //           </div>
// //           <button
// //             onClick={() => setIsModalOpen(true)}
// //             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-indigo-100 active:scale-95"
// //           >
// //             <Plus size={20} /> New Analysis
// //           </button>
// //         </header>

// //         {loading ? (
// //           <div className="flex items-center justify-center h-64 text-slate-400">Loading your data...</div>
// //         ) : interviews.length === 0 ? (
// //           <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
// //             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
// //               <Search className="text-slate-300" size={32} />
// //             </div>
// //             <h2 className="text-xl font-bold text-slate-800 mb-2">No analysis found</h2>
// //             <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload a customer transcript to let the AI extract pain points.</p>
// //             <button onClick={() => setIsModalOpen(true)} className="text-indigo-600 font-bold hover:underline">
// //               Create your first project
// //             </button>
// //           </div>
// //         ) : (
// //           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
// //             {interviews.map((item) => {
// //               const isExpanded = expandedId === item.id;
// //               return (
// //                 <div key={item.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
// //                   <div className="p-6">
// //                     <div className="flex justify-between items-start mb-4">
// //                       <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
// //                         <MessageSquare size={20} />
// //                       </div>
// //                       <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
// //                         item.sentiment_score === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
// //                         item.sentiment_score === 'Negative' ? 'bg-red-50 text-red-600' :
// //                         'bg-slate-100 text-slate-500'
// //                       }`}>
// //                         {item.sentiment_score}
// //                       </span>
// //                     </div>
// //                     <h3 className="font-bold text-slate-800 mb-1">{item.participant_name}</h3>
// //                     <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
// //                       <Clock size={12} /> {formatDate(item.created_at)}
// //                       <span className="text-slate-300">·</span>
// //                       {item.insights.length} insight{item.insights.length !== 1 ? "s" : ""}
// //                     </div>
// //                     <button
// //                       onClick={() => setExpandedId(isExpanded ? null : item.id)}
// //                       className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center justify-center gap-1"
// //                     >
// //                       {isExpanded ? "Hide Report" : "View Full Report"}
// //                       {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
// //                     </button>
// //                   </div>

// //                   {isExpanded && (
// //                     <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-3">
// //                       {item.insights.length === 0 ? (
// //                         <p className="text-xs text-slate-400">No insights extracted for this interview.</p>
// //                       ) : (
// //                         item.insights.map((insight) => (
// //                           <div key={insight.id} className="bg-white border border-slate-200 rounded-xl p-4">
// //                             <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
// //                               insight.category === 'Pain Point' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
// //                             }`}>
// //                               {insight.category}
// //                             </span>
// //                             <p className="text-sm text-slate-700 mt-2">{insight.content}</p>
// //                             <div className="flex items-start gap-2 mt-3 text-xs text-slate-400 italic">
// //                               <Quote size={12} className="mt-0.5 shrink-0" />
// //                               "{insight.quote}"
// //                             </div>
// //                           </div>
// //                         ))
// //                       )}
// //                     </div>
// //                   )}
// //                 </div>
// //               );
// //             })}
// //           </div>
// //         )}
// //       </main>

// //       {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)} onRefresh={fetchInterviews} />}
// //     </div>
// //   );
// // }


// import React, { useState } from "react";
// import { Sparkles, Plus, MessageSquare, Layout, Search, Clock, ChevronDown, ChevronUp, Quote } from "lucide-react";

// export default function Dashboard({ interviews, loading, onOpenUpload }) {
//   const [expandedId, setExpandedId] = useState(null);

//   const formatDate = (iso) => {
//     if (!iso) return "Unknown date";
//     return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
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
//             <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-indigo-50 text-indigo-600 font-medium text-sm">
//               <Layout size={18} /> Dashboard
//             </div>
//             <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-500 hover:bg-slate-50 transition cursor-not-allowed text-sm">
//               <MessageSquare size={18} /> Interviews
//             </div>
//           </nav>
//         </div>
//         <div className="text-xs text-slate-400 px-3">v1.0.0 Alpha</div>
//       </aside>

//       <main className="flex-1 ml-64 p-10">
//         <header className="flex justify-between items-center mb-10">
//           <div>
//             <h1 className="text-2xl font-bold text-slate-900">Research Insights</h1>
//             <p className="text-slate-500 text-sm">Convert transcripts into structured data.</p>
//           </div>
//           <button
//             onClick={onOpenUpload}
//             className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium transition shadow-lg shadow-indigo-100 active:scale-95"
//           >
//             <Plus size={20} /> New Analysis
//           </button>
//         </header>

//         {loading ? (
//           <div className="flex items-center justify-center h-64 text-slate-400">Loading your data...</div>
//         ) : interviews.length === 0 ? (
//           <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 shadow-sm">
//             <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
//               <Search className="text-slate-300" size={32} />
//             </div>
//             <h2 className="text-xl font-bold text-slate-800 mb-2">No analysis found</h2>
//             <p className="text-slate-500 mb-8 max-w-xs mx-auto">Upload a customer transcript to let the AI extract pain points.</p>
//             <button onClick={onOpenUpload} className="text-indigo-600 font-bold hover:underline">
//               Create your first project
//             </button>
//           </div>
//         ) : (
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//             {interviews.map((item) => {
//               const isExpanded = expandedId === item.id;
//               return (
//                 <div key={item.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
//                   <div className="p-6">
//                     <div className="flex justify-between items-start mb-4">
//                       <div className="h-10 w-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
//                         <MessageSquare size={20} />
//                       </div>
//                       <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-md ${
//                         item.sentiment_score === 'Positive' ? 'bg-emerald-50 text-emerald-600' :
//                         item.sentiment_score === 'Negative' ? 'bg-red-50 text-red-600' :
//                         'bg-slate-100 text-slate-500'
//                       }`}>
//                         {item.sentiment_score}
//                       </span>
//                     </div>
//                     <h3 className="font-bold text-slate-800 mb-1">{item.participant_name}</h3>
//                     <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
//                       <Clock size={12} /> {formatDate(item.created_at)}
//                       <span className="text-slate-300">·</span>
//                       {item.insights.length} insight{item.insights.length !== 1 ? "s" : ""}
//                     </div>
//                     <button
//                       onClick={() => setExpandedId(isExpanded ? null : item.id)}
//                       className="w-full py-2 bg-slate-50 text-slate-600 rounded-lg text-xs font-semibold hover:bg-indigo-600 hover:text-white transition flex items-center justify-center gap-1"
//                     >
//                       {isExpanded ? "Hide Report" : "View Full Report"}
//                       {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
//                     </button>
//                   </div>

//                   {isExpanded && (
//                     <div className="border-t border-slate-100 bg-slate-50/50 p-6 space-y-3">
//                       {item.insights.length === 0 ? (
//                         <p className="text-xs text-slate-400">No insights extracted for this interview.</p>
//                       ) : (
//                         item.insights.map((insight) => (
//                           <div key={insight.id} className="bg-white border border-slate-200 rounded-xl p-4">
//                             <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
//                               insight.category === 'Pain Point' ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'
//                             }`}>
//                               {insight.category}
//                             </span>
//                             <p className="text-sm text-slate-700 mt-2">{insight.content}</p>
//                             <div className="flex items-start gap-2 mt-3 text-xs text-slate-400 italic">
//                               <Quote size={12} className="mt-0.5 shrink-0" />
//                               "{insight.quote}"
//                             </div>
//                           </div>
//                         ))
//                       )}
//                     </div>
//                   )}
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }


import React, { useState } from "react";
import { Sparkles, Plus, MessageSquare, Layout, Search, Clock, ChevronDown, ChevronUp, Quote } from "lucide-react";

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