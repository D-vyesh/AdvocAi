import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Bot,
  MessageCircle,
  Send,
  FileText,
  Loader2,
  History,
  Sparkles,
  User,
  Copy,
  Check,
  ChevronLeft,
  ShieldCheck,
  Plus
} from 'lucide-react';
import { Button } from "@/Components/ui/button";

import {
  uploadDocument as uploadDocumentApi,
  getUserSessions as getUserSessionsApi,
  getChatHistory as getChatHistoryApi,
  sendChatMessage as sendChatMessageApi
} from '../utils/api';

const DocumentAnalyzer = () => {
  const fileInputRef = useRef(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [summary, setSummary] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [chatMessage, setChatMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);

  const resetForNewDocument = () => {
    setUploadedFile(null);
    setSummary('');
    setSessionId(null);
    setChatHistory([]);
    setError('');
  };

  const handleCopySummary = () => {
    navigator.clipboard.writeText(summary);
    setIsSummaryCopied(true);
    setTimeout(() => setIsSummaryCopied(false), 2000);
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0] ?? null;
    if (!file) return;

    setUploadedFile(file);
    setError('');
    setUploading(true);
    setSummary('');

    try {
      const response = await uploadDocumentApi(file);
      const receivedSummary = response?.summary ?? response?.data?.summary ?? '';
      const receivedSessionId = response?.session_id ?? response?.sessionId ?? null;

      const finalSessionId = receivedSessionId ?? `local-${Date.now()}`;
      setSessionId(finalSessionId);

      if (receivedSummary) {
        setSummary(receivedSummary);
        setChatHistory([
          {
            id: Date.now(),
            sender: 'AdvocAI',
            message: "I've analyzed your document with full clause parsing. Feel free to ask about liabilities, governing law, risks, or key definitions.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        setSummary(response?.summary_preview ?? response?.summaryPreview ?? 'No summary available.');
        setChatHistory([
          {
            id: Date.now(),
            sender: 'AdvocAI',
            message: "Document uploaded successfully. Ask any question to start analyzing.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      }
      fetchSessions();
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || err?.message || 'Failed to upload document.';
      setError(message);
      setUploadedFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragActive(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setDragActive(false);
    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
        handleFileUpload({ target: { files: dataTransfer.files } });
      }
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || !sessionId) return;

    const userMessage = chatMessage.trim();
    setChatMessage('');
    setLoading(true);

    const newUserMessage = {
      id: Date.now(),
      sender: 'User',
      message: userMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatHistory((prev) => [...prev, newUserMessage]);

    try {
      const response = await sendChatMessageApi(sessionId, userMessage);
      const aiText = response?.response ?? response?.message ?? response?.text ?? response?.data?.text ?? '';

      if (aiText) {
        const aiMessage = {
          id: Date.now() + 1,
          sender: 'AdvocAI',
          message: aiText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatHistory((prev) => [...prev, aiMessage]);
      }
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || err?.message || 'Failed to send message';
      setError(message);
      setChatHistory((prev) => prev.filter((m) => m.id !== newUserMessage.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const response = await getUserSessionsApi();
      const list = Array.isArray(response) ? response : response?.sessions ?? response?.data?.sessions ?? [];
      setSessions(list);
    } catch (err) {
      console.error('Failed to fetch sessions:', err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const openSession = async (session) => {
    if (!session) return;
    setSessionId(session.id ?? session._id ?? `session-${Date.now()}`);
    setLoading(true);
    try {
      const data = await getChatHistoryApi(session.id ?? session._id ?? session.sessionId);
      const sessionInfo = data?.session ?? data ?? {};
      const messagesRaw = data?.messages ?? data?.messages_list ?? [];

      const messages = (messagesRaw || []).map((m, idx) => ({
        id: m.id ?? m._id ?? idx + 1,
        sender: (m.sender || m.role || '').toLowerCase() === 'user' ? 'User' : 'AdvocAI',
        message: m.text || m.message || '',
        timestamp: m.timestamp ? new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      }));

      setChatHistory(messages);
      const sessionSummary = sessionInfo.summary ?? session.summary ?? session.summary_preview ?? '';
      if (sessionSummary) setSummary(sessionSummary);
    } catch (err) {
      console.error(err);
      const message = err?.response?.data?.error || err?.message || 'Failed to load session';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return dateString;

    const now = new Date();
    const diffMs = now - date;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div className="flex h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 pb-4 max-w-7xl mx-auto gap-4 relative">

      {/* Frosted History Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72 lg:w-80' : 'w-0'
        } transition-all duration-300 h-full relative z-20 flex-shrink-0 overflow-hidden`}
      >
        <div className="h-full glass-panel glass-reactive rounded-[2rem] border border-white/25 p-4 flex flex-col shadow-fluffy overflow-hidden">
          {/* Sidebar Header */}
          <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15 flex-shrink-0 px-1">
            <div className="flex items-center gap-2.5">
              <div className="glass-circle w-9 h-9">
                <History className="w-4 h-4 text-cyan-300" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-wide font-display">Analysis Sessions</h2>
                <p className="text-[11px] text-slate-300/80">Past document reviews</p>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setSidebarOpen(false)}
              variant="glass-circle"
              size="icon-sm"
              className="w-7 h-7 text-slate-300 hover:text-white"
              title="Close Sidebar"
            >
              <ChevronLeft size={16} />
            </Button>
          </div>

          {/* New Document Button */}
          <div className="relative z-10 pt-3 pb-2 flex-shrink-0">
            <Button
              onClick={resetForNewDocument}
              variant="aurora"
              className="w-full h-10 px-4 text-xs"
            >
              <Plus size={15} className="text-cyan-300" />
              <span>New Analysis</span>
            </Button>
          </div>

          {/* Sessions List */}
          <div className="relative z-10 flex-1 overflow-y-auto space-y-2 py-2 pr-1 custom-scrollbar">
            {loadingSessions ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 animate-spin text-cyan-400" />
              </div>
            ) : sessions.length > 0 ? (
              sessions.map((session) => {
                const isSelected = sessionId === (session.id ?? session._id);
                return (
                  <button
                    key={session.id ?? session._id}
                    onClick={() => openSession(session)}
                    className={`w-full text-left p-3.5 rounded-2xl transition-all duration-300 ease-fluffy block group ${
                      isSelected
                        ? "bg-white/22 border border-white/45 shadow-[inset_0_2px_2px_rgba(255,255,255,0.75),0_8px_20px_rgba(0,212,255,0.22)] text-white scale-[1.01]"
                        : "glass-subtle hover:bg-white/12 hover:border-white/25 text-slate-300"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <FileText className={`w-4 h-4 mt-0.5 flex-shrink-0 ${isSelected ? "text-cyan-300" : "text-slate-400 group-hover:text-cyan-300"}`} />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold truncate leading-tight mb-1 text-slate-100">
                          {session.summary_preview || session.title || 'Document Analysis'}
                        </p>
                        <div className="flex items-center justify-between text-[11px] text-slate-400">
                          <span>{formatDate(session.created_at || session.createdAt || session.date)}</span>
                          {Number(session.message_count || session.messages_count || 0) > 0 && (
                            <span className="glass-pill px-2 py-0.2 text-[10px] text-cyan-300">
                              {session.message_count || session.messages_count} msgs
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="text-center py-16 px-4">
                <div className="glass-circle w-12 h-12 mx-auto mb-3">
                  <FileText className="w-5 h-5 text-slate-300" />
                </div>
                <p className="text-xs font-semibold text-slate-200">No session history</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Upload a document to begin</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Floating Sidebar Toggle when closed */}
      {!sidebarOpen && (
        <Button
          type="button"
          onClick={() => setSidebarOpen(true)}
          variant="glass-circle"
          size="icon"
          className="fixed left-4 top-24 z-30 w-10 h-10 text-white shadow-xl"
          title="Open Session History"
        >
          <History className="w-5 h-5 text-cyan-300" />
        </Button>
      )}

      {/* Main Glass Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0">
        {!summary ? (
          /* Full Page Fluffy Glass Upload Sanctuary */
          <div className="h-full flex items-center justify-center p-4">
            <div
              className={`w-full max-w-2xl glass-panel glass-reactive p-10 sm:p-14 rounded-[2.75rem] border-2 border-dashed transition-all duration-300 text-center cursor-pointer shadow-fluffy ${
                dragActive
                  ? "border-cyan-300 bg-white/22 scale-[1.025] shadow-[0_0_45px_rgba(0,212,255,0.45)]"
                  : uploadedFile
                  ? "border-cyan-300/60 bg-white/12"
                  : "border-white/30 hover:border-cyan-300/60"
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploading && fileInputRef.current && fileInputRef.current.click()}
            >
              <input
                id="file-upload"
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />

              {uploading ? (
                <div className="relative z-10 space-y-4 py-6">
                  <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
                    <Loader2 className="w-16 h-16 text-cyan-300 animate-spin" />
                    <Sparkles className="w-7 h-7 text-amber-300 absolute" />
                  </div>
                  <div>
                    <h3 className="text-xl font-extrabold text-white mb-1 font-display">
                      Refracting & Analyzing Clauses...
                    </h3>
                    <p className="text-sm text-slate-300/85">
                      Our neural legal model is scanning definitions, covenants, and risk vectors.
                    </p>
                  </div>
                </div>
              ) : uploadedFile ? (
                <div className="relative z-10 space-y-4 py-6">
                  <div className="glass-circle w-20 h-20 mx-auto shadow-glass-glow">
                    <FileText className="w-10 h-10 text-cyan-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{uploadedFile.name}</h3>
                    <p className="text-xs font-bold text-emerald-300 uppercase tracking-wider">
                      ✓ Ready for parsing
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 space-y-6 py-4">
                  <div className="glass-circle w-24 h-24 mx-auto shadow-[inset_0_2px_4px_rgba(255,255,255,0.95),0_18px_40px_rgba(0,212,255,0.38)] animate-bubble-breathe">
                    <Upload className="w-10 h-10 text-cyan-300" />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
                      Drop legal document here
                    </h3>
                    <p className="text-sm text-slate-300/85 max-w-md mx-auto">
                      Click to browse or drop contracts to extract instant clause summaries, liability warnings, and interactive Q&A.
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      variant="aurora"
                      size="lg"
                      onClick={(e) => {
                        e.stopPropagation();
                        fileInputRef.current?.click();
                      }}
                      className="h-11 px-7 text-xs"
                    >
                      <Upload className="w-4 h-4 text-cyan-300" />
                      <span>Browse Contract File</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <span className="text-xs text-slate-400 mr-1">Compatible formats:</span>
                    <span className="glass-pill px-3 py-1 text-xs font-bold text-white">PDF</span>
                    <span className="glass-pill px-3 py-1 text-xs font-bold text-white">DOCX</span>
                    <span className="glass-pill px-3 py-1 text-xs font-bold text-white">TXT</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="relative z-10 mt-6 p-3 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-200 text-xs">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Dual-Column Analysis & Interactive Glass Q&A */
          <div className="grid lg:grid-cols-12 gap-4 h-full min-h-0">

            {/* Left Glass Column: Analysis Summary */}
            <div className="lg:col-span-5 flex flex-col h-full min-h-0">
              <div className="glass-panel glass-reactive rounded-[2rem] border border-white/25 flex flex-col h-full shadow-fluffy overflow-hidden">

                {/* Header */}
                <div className="relative z-10 p-4 sm:p-5 border-b border-white/15 flex items-center justify-between flex-shrink-0 bg-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="glass-circle w-9 h-9">
                      <Sparkles className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display">AI Clause Intelligence</h3>
                      <p className="text-[11px] text-slate-300/80">Risk detection & plain-English summary</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleCopySummary}
                      size="sm"
                      variant={isSummaryCopied ? "emerald" : "glass"}
                      className="h-8 px-3.5 text-xs"
                      title="Copy Analysis"
                    >
                      {isSummaryCopied ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-cyan-300" />
                          <span>Copy</span>
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Summary Scrollable Text */}
                <div className="relative z-10 flex-1 overflow-y-auto p-5 custom-scrollbar text-slate-100 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                  {summary}
                </div>

                {/* Bottom Bar: Action Pill */}
                <div className="relative z-10 p-3.5 border-t border-white/15 flex justify-between items-center bg-white/[0.03]">
                  <span className="text-[11px] text-slate-300/85 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    Verified by AdvocAI Engine
                  </span>
                  <Button
                    onClick={resetForNewDocument}
                    size="sm"
                    variant="glass"
                    className="h-8 px-3.5 text-xs text-slate-100"
                  >
                    Analyze Another
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Glass Column: Chat & Q&A */}
            <div className="lg:col-span-7 flex flex-col h-full min-h-0">
              <div className="glass-panel glass-reactive rounded-[2rem] border border-white/25 flex flex-col h-full shadow-fluffy overflow-hidden">

                {/* Chat Header */}
                <div className="relative z-10 p-4 sm:p-5 border-b border-white/15 flex items-center justify-between flex-shrink-0 bg-white/[0.04]">
                  <div className="flex items-center gap-2.5">
                    <div className="glass-circle w-9 h-9">
                      <MessageCircle className="w-4 h-4 text-cyan-300" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white font-display">Ask AdvocAI</h3>
                      <p className="text-[11px] text-slate-300/80">Inquire about liabilities, indemnities, or termination clauses</p>
                    </div>
                  </div>
                </div>

                {/* Messages Stream */}
                <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
                  {chatHistory.map((message) => {
                    const isUser = message.sender === 'User';
                    return (
                      <div
                        key={message.id}
                        className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}
                      >
                        {!isUser && (
                          <div className="glass-circle w-8 h-8 flex-shrink-0 mb-1">
                            <Bot className="w-4 h-4 text-cyan-300" />
                          </div>
                        )}

                        <div className="max-w-[82%] sm:max-w-[75%]">
                          <div
                            className={`px-4 py-3 text-xs sm:text-sm leading-relaxed ${
                              isUser
                                ? "rounded-3xl rounded-br-md bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white border border-white/45 shadow-[inset_0_2px_2px_rgba(255,255,255,0.75),0_8px_20px_rgba(0,212,255,0.35)]"
                                : "glass-subtle rounded-3xl rounded-bl-md p-4 text-slate-100 border-white/25"
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.message}</p>
                          </div>
                          <span className={`text-[10px] text-slate-400/85 mt-1 block px-1 ${isUser ? 'text-right' : 'text-left'}`}>
                            {message.timestamp}
                          </span>
                        </div>

                        {isUser && (
                          <div className="glass-circle w-8 h-8 flex-shrink-0 mb-1">
                            <User className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {loading && (
                    <div className="flex items-center gap-2.5">
                      <div className="glass-circle w-8 h-8">
                        <Bot className="w-4 h-4 text-cyan-300" />
                      </div>
                      <div className="glass-pill px-4 py-2.5 flex items-center gap-2 text-xs text-slate-200">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-300" />
                        <span>AdvocAI is formulating clause insights...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Floating Glass Input Bar */}
                <div className="relative z-10 p-3 sm:p-4 border-t border-white/15 bg-white/[0.03]">
                  <div className="flex items-center gap-2.5">
                    <input
                      type="text"
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Ask any question about this document..."
                      disabled={!sessionId || loading}
                      className="glass-input flex-1 h-11 px-5 text-xs sm:text-sm rounded-full"
                    />

                    <Button
                      type="button"
                      onClick={handleSendMessage}
                      disabled={!sessionId || !chatMessage.trim() || loading}
                      variant="default"
                      size="icon"
                      className="w-11 h-11 flex-shrink-0"
                      title="Send Message"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      ) : (
                        <Send className="w-4 h-4 text-slate-950" />
                      )}
                    </Button>
                  </div>
                </div>

              </div>
            </div>

          </div>
        )}
      </div>

    </div>
  );
};

export default DocumentAnalyzer;
