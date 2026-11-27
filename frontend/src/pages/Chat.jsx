import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Send, Paperclip, FileText, ArrowLeft, X, Scale } from 'lucide-react';

const Chat = () => {
  const { conversationId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [availableDocuments, setAvailableDocuments] = useState([]);
  const [showDocumentPicker, setShowDocumentPicker] = useState(false);
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async () => {
    try {
      const response = await axios.get(`api/auth/chat/conversations/${conversationId}/messages/`);
      setMessages(response.data || []);
    } catch (err) {
      console.error('Failed to load messages:', err);
      if (err.response?.status !== 404) {
        toast.error(err.response?.data?.error || 'Failed to load messages.');
      }
    }
  }, [conversationId]);

  const loadConversation = useCallback(async () => {
    try {
      const response = await axios.get('api/auth/chat/conversations/');
      const conv = (response.data || []).find(c => c.id === conversationId);
      if (conv) {
        setConversation(conv);
      }
    } catch (err) {
      console.error('Failed to load conversation:', err);
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  const loadUserDocuments = useCallback(async () => {
    try {
      const response = await axios.get('api/documents/conversations/');
      setAvailableDocuments(response.data || []);
    } catch (err) {
      console.error('Failed to load documents:', err);
    }
  }, []);

  useEffect(() => {
    if (conversationId) {
      loadMessages();
      loadConversation();
      loadUserDocuments();

      const interval = setInterval(loadMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [conversationId, loadMessages, loadConversation, loadUserDocuments]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await axios.post(`api/auth/chat/conversations/${conversationId}/messages/`, {
        message: newMessage.trim(),
        message_type: 'text',
      });
      setNewMessage('');
      await loadMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
      toast.error(err.response?.data?.error || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const shareDocument = async (documentId, documentTitle) => {
    setSending(true);
    try {
      await axios.post(`api/auth/chat/conversations/${conversationId}/messages/`, {
        message: `Shared document: ${documentTitle}`,
        message_type: 'document',
        document_id: documentId,
        document_title: documentTitle,
      });
      setShowDocumentPicker(false);
      await loadMessages();
      toast.success('Document shared successfully!');
    } catch (err) {
      console.error('Failed to share document:', err);
      toast.error(err.response?.data?.error || 'Failed to share document.');
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-[2rem] text-xs text-slate-300">
          Loading conversation...
        </div>
      </div>
    );
  }

  const otherUser =
    conversation?.client?.id === user?.id ? conversation?.lawyer : conversation?.client;
  const otherRole = conversation?.lawyer?.id === user?.id ? 'Client' : 'Lawyer';

  return (
    <div className="flex flex-col h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 pb-4 max-w-5xl mx-auto animate-fade-in">
      <div className="flex-1 glass-panel glass-reactive rounded-[2.25rem] border border-white/25 shadow-fluffy flex flex-col overflow-hidden min-h-0 relative">

        {/* Chat Header */}
        <div className="relative z-10 p-4 sm:p-5 border-b border-white/15 flex items-center justify-between gap-3 bg-white/[0.04]">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="glass-circle"
              size="icon-sm"
              onClick={() => navigate(-1)}
              className="w-9 h-9 text-slate-200 hover:text-white"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="glass-circle w-10 h-10 shadow-glass-sm">
              <Scale className="w-4 h-4 text-cyan-300" />
            </div>

            <div>
              <h2 className="text-base font-extrabold text-white font-display">
                {otherUser?.name || otherUser?.username || 'Consultation Chat'}
              </h2>
              <span className="text-[11px] font-semibold text-cyan-300">{otherRole}</span>
            </div>
          </div>
        </div>

        {/* Messages Stream */}
        <div className="relative z-10 flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 custom-scrollbar">
          {messages.length === 0 && (
            <div className="text-center text-xs text-slate-300/80 py-12">
              No messages yet. Start the conversation!
            </div>
          )}

          {messages.map((msg) => {
            const senderId = msg.sender?.id || msg.sender;
            const userId = user?.id || user;
            const isOwn = String(senderId) === String(userId);
            const isSystem = msg.message_type === 'system';

            if (isSystem) {
              return (
                <div key={msg.id} className="flex justify-center">
                  <span className="glass-pill px-4 py-1 text-[11px] text-slate-200">
                    {msg.message}
                  </span>
                </div>
              );
            }

            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'} animate-fade-in`}
              >
                <div
                  className={`max-w-[78%] sm:max-w-[68%] px-4 py-3 text-xs sm:text-sm ${
                    isOwn
                      ? 'rounded-3xl rounded-br-md bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white border border-white/45 shadow-[inset_0_1.5px_2px_rgba(255,255,255,0.75),0_8px_20px_rgba(0,212,255,0.3)]'
                      : 'glass-subtle rounded-3xl rounded-bl-md text-slate-100 border-white/25'
                  }`}
                >
                  {msg.message_type === 'document' && (
                    <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/20">
                      <FileText className="w-4 h-4 text-cyan-200 flex-shrink-0" />
                      <a
                        href={`/documentShare/${msg.document_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:no-underline font-bold text-white"
                      >
                        {msg.document_title || 'Open Shared Document'}
                      </a>
                    </div>
                  )}
                  <p className="whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                  {msg.created_at && (
                    <p className="text-[10px] opacity-70 mt-1 text-right">
                      {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Document Picker Modal */}
        {showDocumentPicker && (
          <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="w-full max-w-md glass-panel glass-reactive p-6 rounded-[2.25rem] border border-white/30 shadow-fluffy space-y-4">
              <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
                <h3 className="text-base font-extrabold text-white font-display">Share Document</h3>
                <Button
                  type="button"
                  variant="glass-circle"
                  size="icon-sm"
                  onClick={() => setShowDocumentPicker(false)}
                  className="w-8 h-8"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="relative z-10 max-h-80 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
                {availableDocuments.length === 0 ? (
                  <p className="text-xs text-slate-300 text-center py-6">No documents available to share.</p>
                ) : (
                  availableDocuments.map((doc) => {
                    const docId = doc._id || doc.id;
                    return (
                      <div
                        key={docId}
                        className="flex items-center justify-between gap-2 p-3 glass-subtle rounded-2xl border border-white/15"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <FileText className="w-4 h-4 text-cyan-300 flex-shrink-0" />
                          <span className="text-xs font-semibold text-white truncate">
                            {doc.title || 'Untitled Document'}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="default"
                          onClick={() => shareDocument(docId, doc.title || 'Untitled Document')}
                          disabled={sending}
                          className="h-8 px-3.5 text-xs flex-shrink-0"
                        >
                          Share
                        </Button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative z-10 p-3.5 sm:p-4 border-t border-white/15 bg-white/[0.03]">
          <div className="flex items-center gap-2.5">
            <Button
              type="button"
              variant="glass-circle"
              size="icon"
              onClick={() => setShowDocumentPicker(true)}
              className="w-11 h-11 flex-shrink-0 text-slate-200 hover:text-white"
              title="Share Document"
            >
              <Paperclip className="w-4 h-4" />
            </Button>

            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1 h-11 px-5 text-xs sm:text-sm rounded-full"
            />

            <Button
              type="button"
              onClick={sendMessage}
              disabled={sending || !newMessage.trim()}
              variant="default"
              size="icon"
              className="w-11 h-11 flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4 text-slate-950" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
