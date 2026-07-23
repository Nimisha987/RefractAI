

import React, { useState, useRef } from "react";
import { X, Sparkles, User, FileText, Loader2, Mic, UploadCloud } from "lucide-react";
import { API_BASE_URL } from "../config";
export default function UploadModal({ onClose, onRefresh }) {
  const [mode, setMode] = useState("text");
  const [transcript, setTranscript] = useState("");
  const [name, setName] = useState("");
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setError("");
    }
  };

  const runAnalysis = async (transcriptText) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("`${API_BASE_URL}/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transcript: transcriptText,
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
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!name) {
      setError("Please enter the participant's name.");
      return;
    }

    if (mode === "text") {
      if (!transcript) {
        setError("Please paste the transcript text.");
        return;
      }
      await runAnalysis(transcript);
      return;
    }

    if (!file) {
      setError("Please select an audio or video file.");
      return;
    }

    setTranscribing(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("`${API_BASE_URL}/api/transcribe", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Transcription failed.");
        setTranscribing(false);
        return;
      }

      setTranscribing(false);
      await runAnalysis(data.transcript);
    } catch (err) {
      console.error(err);
      setError("Failed to connect to the server for transcription.");
      setTranscribing(false);
    }
  };

  const isBusy = loading || transcribing;

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
              <p className="text-xs text-slate-500 uppercase tracking-wide font-medium">Step 1: Provide the Interview</p>
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

          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 w-fit">
            <button
              onClick={() => setMode("text")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "text" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
              }`}
            >
              <FileText size={14} /> Paste Transcript
            </button>
            <button
              onClick={() => setMode("audio")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition ${
                mode === "audio" ? "bg-white shadow-sm text-indigo-600" : "text-slate-500"
              }`}
            >
              <Mic size={14} /> Upload Recording
            </button>
          </div>

          {mode === "text" ? (
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
          ) : (
            <div>
              <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 px-1">
                <Mic size={14} /> Audio or Video File
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp3,.mp4,.mpeg,.mpga,.m4a,.wav,.webm"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <UploadCloud className="mx-auto text-slate-300 mb-2" size={28} />
                {file ? (
                  <p className="text-sm font-semibold text-slate-700">{file.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-slate-500">Click to select a recording</p>
                    <p className="text-xs text-slate-400 mt-1">MP3, MP4, WAV, M4A, WEBM — up to 25MB</p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-400 hover:text-slate-600">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isBusy}
            className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold text-white shadow-lg transition-all active:scale-95 ${
              isBusy ? "bg-indigo-300 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
            }`}
          >
            {transcribing ? (
              <><Loader2 size={18} className="animate-spin" /> Transcribing Audio...</>
            ) : loading ? (
              <><Loader2 size={18} className="animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles size={18} /> Generate Insights</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}