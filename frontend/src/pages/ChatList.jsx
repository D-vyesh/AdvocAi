import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Button } from "@/Components/ui/button";
import { MessageSquare, ArrowRight, Scale } from 'lucide-react';

const ChatList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadConversations = async () => {
    try {
      const response = await axios.get('api/auth/chat/conversations/');
      setConversations(response.data || []);
    } catch (err) {
      console.error('Failed to load conversations:', err);
      toast.error(err.response?.data?.error || 'Failed to load conversations.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-[2rem] text-xs text-slate-300">
          Loading conversations...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 glass-pill">
          <MessageSquare className="w-3.5 h-3.5 text-cyan-300" />
          <span className="text-xs font-bold text-cyan-200 uppercase tracking-wider">
            Encrypted Consultation Inbox
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
          Your Conversations
        </h1>
        <p className="text-xs sm:text-sm text-slate-300/80">
          Direct real-time discussions and document sharing with connected counsel
        </p>
      </div>

      {conversations.length === 0 ? (
        <div className="glass-panel glass-reactive p-14 rounded-[2.5rem] border border-white/25 text-center space-y-4">
          <div className="relative z-10 space-y-3">
            <div className="glass-circle w-16 h-16 mx-auto shadow-glass-glow">
              <MessageSquare className="w-8 h-8 text-cyan-300" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">No conversations yet</h3>
            <p className="text-xs text-slate-300/80 max-w-sm mx-auto">
              Connect with a verified lawyer to initiate a private legal consultation thread.
            </p>
            <Button variant="aurora" onClick={() => navigate('/lawyer-connect')} className="h-10 px-6 text-xs">
              <Scale className="w-3.5 h-3.5 text-cyan-300" />
              <span>Browse Verified Lawyers</span>
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-3.5">
          {conversations.map((conv) => {
            const otherUser = conv.client?.id === user?.id ? conv.lawyer : conv.client;
            const lastMessage = conv.last_message;
            const unreadCount = conv.unread_count || 0;

            return (
              <div
                key={conv.id}
                onClick={() => navigate(`/chat/${conv.id}`)}
                className="glass-panel glass-reactive glass-panel-interactive p-5 rounded-3xl border border-white/25 cursor-pointer flex items-center justify-between gap-4"
              >
                <div className="relative z-10 flex items-center gap-3.5 min-w-0 flex-1">
                  <div className="glass-circle w-12 h-12 flex-shrink-0 text-sm font-black text-cyan-200 shadow-glass-sm">
                    {otherUser?.name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() ||
                      otherUser?.username?.slice(0, 2).toUpperCase() || 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-white truncate font-display">
                      {otherUser?.name || otherUser?.username || 'Unknown User'}
                    </h3>
                    {lastMessage ? (
                      <p className="text-xs text-slate-300/85 truncate mt-0.5">
                        {lastMessage.message_type === 'document'
                          ? `📄 ${lastMessage.document_title || 'Document'}`
                          : lastMessage.message}
                      </p>
                    ) : (
                      <p className="text-xs text-slate-400 mt-0.5">No messages yet</p>
                    )}
                  </div>
                </div>

                <div className="relative z-10 flex items-center gap-3 flex-shrink-0">
                  {unreadCount > 0 && (
                    <span className="glass-circle w-7 h-7 bg-cyan-400/30 border-cyan-300/70 text-white text-xs font-extrabold">
                      {unreadCount}
                    </span>
                  )}
                  <span className="glass-circle w-9 h-9 text-cyan-300">
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ChatList;
