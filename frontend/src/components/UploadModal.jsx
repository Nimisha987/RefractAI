import React, { useState } from "react";
import { X, Sparkles, User, FileText, Loader2 } from "lucide-react";

export default function UploadModal({ onClose, onRefresh }) {
  const [transcript, setTranscript] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!transcript || !name) {
      setError("Please fill in both the participant name and transcript.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript,
          participant_name: name,
          project_id: 1,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onRefresh();
        onClose();
      } else {
        setError(data.error || "Something went wrong analyzing this transcript.");
      }
    } catch (error) {
      console.error("Analysis failed", error);
      setError("Failed to connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <Sparkles size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">New AI Analysis</h3>
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Step 1: Input Transcript</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition text-slate-400">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              <User size={14} /> Participant Name
            </label>
            <input
              type="text"
              placeholder="e.g. John Doe"
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-3 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
              <FileText size={14} /> Transcript Content
            </label>
            <textarea
              placeholder="Paste raw text from Zoom or Google Meet..."
              className="w-full rounded-xl border-slate-200 bg-slate-50 px-4 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-100 focus:border-indigo-500 outline-none transition-all min-h-[200px] resize-none"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
            />
          </div>
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
              loading ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            }`}
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" /> Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={18} /> Generate Insights
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}