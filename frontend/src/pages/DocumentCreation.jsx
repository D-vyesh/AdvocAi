import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  PenTool,
  Send,
  Download,
  Bot,
  Save,
  Edit,
  Eye,
  MessageCircle,
  History,
  Menu,
  X,
  XCircle,
  Maximize,
  Minimize,
  Share2,
  Sparkles,
} from 'lucide-react';
import axios from '../api/axios';
import { saveAs } from 'file-saver';
import '../styles/MarkdownPreview.css';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";

import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Indent } from '../lib/tiptap-extensions/indent';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import ShareModal from '../Components/ShareModal';
import CommentList from '../Components/Comments/CommentList';
import MenuBar from '../Components/MenuBar';
import VersionsSidebar from '../Components/VersionsSidebar';
import SignatureModal from '../Components/SignatureModal';

const convertMarkdownToHtml = (markdownContent) => {
  if (!markdownContent) return '';
  const tempEditor = new Editor({
    extensions: [
      StarterKit,
      Markdown,
      Image.configure({ inline: true }),
      Indent,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
  });
  tempEditor.commands.setContent(markdownContent, false, { contentType: 'markdown' });
  const html = tempEditor.getHTML();
  tempEditor.destroy();
  return html;
};

const QUICK_PROMPTS = [
  "Mutual NDA with 2-year confidentiality & Delaware governing law",
  "Freelance software agreement with milestone payments & IP assignment",
  "SaaS Master Services Agreement with liability cap & SLA terms",
];

const DocumentCreation = () => {
  const { id: mongoConversationId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const versionToLoad = queryParams.get('version');

  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState('');
  const [chatMessage, setChatMessage] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [finalDocument, setFinalDocument] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const chatContainerRef = useRef(null);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [isVersionsSidebarOpen, setIsVersionsSidebarOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [originalDocumentContent, setOriginalDocumentContent] = useState('');
  const [isTitleEditing, setIsTitleEditing] = useState(false);
  const [tempTitle, setTempTitle] = useState('');
  const [commentsSidebarOpen, setCommentsSidebarOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [documentSharedWithUsers, setDocumentSharedWithUsers] = useState([]);

  const documentRef = useRef(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  const toggleFullScreen = () => {
    if (!documentRef.current) return;

    if (!document.fullscreenElement) {
      documentRef.current.requestFullscreen().then(() => {
        setIsFullScreen(true);
      }).catch(err => {
        console.error(`Error attempting full-screen: ${err.message}`);
      });
    } else {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch(err => {
        console.error(`Error attempting exit full-screen: ${err.message}`);
      });
    }
  };

  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullScreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullScreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
    };
  }, []);

  const handleShareDocument = async () => {
    if (!mongoConversationId) {
      toast('Please create and save the document before sharing.', { icon: 'ℹ️' });
      return;
    }
    setIsShareModalOpen(true);
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const ws = useRef(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Image.configure({ inline: true }),
      Indent,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: finalDocument,
    onUpdate: ({ editor }) => {
      const newContent = editor.getHTML();
      setFinalDocument(newContent);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        const message = JSON.stringify({
          type: 'document_content_change',
          content: newContent,
        });
        ws.current.send(message);
      }
    },
    editorProps: {
      attributes: {
        class: 'markdown-preview p-8 bg-transparent text-slate-100 overflow-hidden outline-none',
      },
    },
  });

  useEffect(() => {
    if (!mongoConversationId) return;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const accessToken = localStorage.getItem('access_token');
    let wsUrl = `${protocol}//${window.location.hostname}:8000/ws/document/${mongoConversationId}/`;
    if (accessToken) {
      wsUrl += `?token=${accessToken}`;
    }
    const newWs = new WebSocket(wsUrl);
    ws.current = newWs;

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'document_content_change') {
        setFinalDocument(data.content);
      } else if (data.type === 'new_comment') {
        toast.success('New collaborator comment added!');
      }
    };

    return () => {
      newWs.close();
    };
  }, [mongoConversationId, editor]);

  const fetchConversation = useCallback(async (idToFetch) => {
    if (idToFetch) {
      try {
        const convResponse = await axios.get(`/api/documents/conversations/${idToFetch}/`);
        const conversation = convResponse.data;
        setTitle(conversation.title || '');
        setMessages(conversation.messages || []);
        setDocumentSharedWithUsers(conversation.shared_with_users || []);

        if (conversation.document_versions && conversation.document_versions.length > 0) {
          let contentToLoad = '';
          let versionToSet = null;
          if (versionToLoad) {
            const specificVersion = conversation.document_versions.find(v => v.version_number === parseInt(versionToLoad));
            if (specificVersion) {
              contentToLoad = specificVersion.content;
              versionToSet = specificVersion.version_number;
            } else {
              toast.error(`Version ${versionToLoad} not found.`);
              const latestVersion = conversation.document_versions[conversation.document_versions.length - 1];
              contentToLoad = latestVersion.content;
              versionToSet = latestVersion.version_number;
            }
          } else {
            const latestVersion = conversation.document_versions[conversation.document_versions.length - 1];
            contentToLoad = latestVersion.content;
            versionToSet = latestVersion.version_number;
          }
          const htmlContent = convertMarkdownToHtml(contentToLoad);
          setFinalDocument(htmlContent);
          setCurrentVersion(versionToSet);
          setOriginalDocumentContent(htmlContent);
        } else {
          setFinalDocument('');
          setCurrentVersion(null);
          setOriginalDocumentContent('');
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
        if (error.response && error.response.status === 404) {
          toast.error('Document not found. Redirecting to Documents Hub.');
          navigate('/my-documents');
        } else {
          toast.error('Could not load conversation.');
        }
      }
    } else {
      setTitle('');
      setMessages([]);
      setFinalDocument('');
      setCurrentVersion(null);
      setOriginalDocumentContent('');
      setDocumentSharedWithUsers([]);
    }
  }, [versionToLoad, navigate]);

  const handleSelectVersion = async (versionNumber) => {
    try {
      const response = await axios.get(`/api/documents/conversations/${mongoConversationId}/`);
      const conversation = response.data;
      const specificVersion = conversation.document_versions.find(v => v.version_number === versionNumber);
      if (specificVersion) {
        setFinalDocument(specificVersion.content);
        setCurrentVersion(versionNumber);
        toast.success(`Loaded version ${versionNumber}`);
        setIsVersionsSidebarOpen(false);
      } else {
        toast.error(`Version ${versionNumber} not found.`);
      }
    } catch (error) {
      console.error('Error fetching version:', error);
      toast.error('Could not load version.');
    }
  };

  useEffect(() => {
    if (editor) {
      editor.chain().setContent(finalDocument, false).setMeta('addToHistory', false).run();
    }
  }, [finalDocument, editor]);

  useEffect(() => {
    fetchConversation(mongoConversationId);
  }, [mongoConversationId, versionToLoad, fetchConversation]);

  const handleSaveConversation = useCallback(async () => {
    if (!title.trim()) {
      toast.error('Please provide a document title.');
      return;
    }

    if (finalDocument === originalDocumentContent && mongoConversationId) {
      toast('No changes to save.', { icon: 'ℹ️' });
      return;
    }

    const conversationPayload = {
      title: title,
      messages: messages,
      new_document_content: finalDocument
    };

    try {
      let idToUseForFetch = mongoConversationId;

      if (!mongoConversationId) {
        const convResponse = await axios.post('/api/documents/conversations/', {
          title: title,
          messages: messages,
          initial_document_content: finalDocument
        });
        idToUseForFetch = convResponse.data.id;
        navigate(`/document-creation/${idToUseForFetch}`, { replace: true });
        toast.success('Document created & Version 0 saved!');
      } else {
        await axios.put(`/api/documents/conversations/${mongoConversationId}/`, conversationPayload);
        toast.success('New version snapshot saved!');
      }
      await fetchConversation(idToUseForFetch);
      setOriginalDocumentContent(finalDocument);
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error(`Failed to save: ${error.message}`);
    }
  }, [title, finalDocument, originalDocumentContent, mongoConversationId, messages, fetchConversation, navigate]);

  // Debounced save
  useEffect(() => {
    if (!mongoConversationId || !editor) return;

    const handler = setTimeout(() => {
      if (finalDocument !== originalDocumentContent && editor.isReady) {
        handleSaveConversation();
      }
    }, 2500);

    return () => clearTimeout(handler);
  }, [finalDocument, mongoConversationId, editor, originalDocumentContent, handleSaveConversation]);

  const handleDeleteVersion = async (convId, versionNumber) => {
    if (!convId || !versionNumber) return;

    try {
      await axios.delete(`/api/documents/conversations/${convId}/versions/${versionNumber}/`);
      toast.success(`Version ${versionNumber} deleted.`);
      await fetchConversation(convId);
    } catch (error) {
      console.error('Error deleting version:', error);
      toast.error(error.response?.data?.error || 'Failed to delete version.');
    }
  };

  const handleDownloadPdf = async () => {
    if (!mongoConversationId) {
      toast.error('Please save document before downloading.');
      return;
    }
    try {
      const response = await axios.get(`api/utils/conversations/${mongoConversationId}/download-latest-pdf/`, {
        responseType: 'blob',
      });
      saveAs(response.data, `${title || 'legal_document'}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error(`Failed to download PDF: ${error.message}`);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const handleEditTitleClick = () => {
    setTempTitle(title);
    setIsTitleEditing(true);
  };

  const handleSaveTitle = async () => {
    if (!tempTitle.trim()) {
      toast.error('Title cannot be empty.');
      return;
    }
    if (tempTitle === title) {
      setIsTitleEditing(false);
      return;
    }
    try {
      await axios.put(`/api/documents/conversations/${mongoConversationId}/`, { title: tempTitle });
      setTitle(tempTitle);
      toast.success('Title updated!');
      setIsTitleEditing(false);
    } catch (error) {
      console.error('Error updating title:', error);
      toast.error('Failed to update title.');
    }
  };

  const handleSendMessage = async () => {
    if (!chatMessage.trim() || isGenerating) return;

    setIsGenerating(true);
    const userMessage = { sender: 'user', text: chatMessage };
    setMessages((prev) => [...prev, userMessage]);
    setChatMessage('');

    try {
      const payload = {
        message: chatMessage,
        document_content: finalDocument,
      };

      let response;
      if (mongoConversationId) {
        response = await axios.post(`/api/documents/conversations/${mongoConversationId}/chat/`, payload);
      } else {
        response = await axios.post('/api/documents/conversations/chat/', payload);
        const newConversationId = response.data.conversation_id;
        navigate(`/document-creation/${newConversationId}`, { replace: true });
      }

      const botMessage = { sender: 'bot', text: response.data.response };
      setMessages((prev) => [...prev, botMessage]);
      const htmlUpdatedDocumentContent = convertMarkdownToHtml(response.data.updated_document_content);
      setFinalDocument(htmlUpdatedDocumentContent);
      toast.success('AI updated agreement!');
    } catch (error) {
      console.error('Error generating document:', error);
      toast.error('Failed to receive AI generation response.');
      setMessages((prev) => [...prev, { sender: 'bot', text: 'An error occurred during generation.' }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const hasDocument = !!finalDocument;

  // View when no document has been generated yet
  if (!hasDocument) {
    return (
      <div className="flex flex-col h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto pb-4 gap-4">
        {/* Top Header Card */}
        <div className="glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/25 shadow-fluffy flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto">
            <div className="glass-circle w-12 h-12 shadow-glass-glow flex-shrink-0">
              <Sparkles className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white font-display">Smart Legal Creator</h1>
              <p className="text-xs text-slate-300/80">Describe your requirements to generate a complete agreement</p>
            </div>
          </div>

          <div className="relative z-10 flex items-center gap-3 w-full sm:w-auto">
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Consulting Agreement"
              className="h-11 px-4 text-sm rounded-full min-w-[200px]"
            />
            <Button
              onClick={handleSaveConversation}
              variant="emerald"
              className="h-11 px-6 text-xs whitespace-nowrap"
            >
              <Save className="w-4 h-4" />
              <span>Create Draft</span>
            </Button>
          </div>
        </div>

        {/* Chat / Composer Window */}
        <div className="flex-1 glass-panel glass-reactive p-6 rounded-[2.25rem] border border-white/25 shadow-fluffy flex flex-col overflow-hidden min-h-0">
          <div ref={chatContainerRef} className="relative z-10 flex-1 overflow-y-auto space-y-3 custom-scrollbar p-2">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-5">
                <div className="glass-circle w-20 h-20 p-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.92),0_14px_34px_rgba(0,212,255,0.35)] animate-bubble-breathe">
                  <Bot className="w-8 h-8 text-cyan-300" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-lg font-extrabold text-white font-display">What would you like to draft today?</h3>
                  <p className="text-xs text-slate-300/80 max-w-md mx-auto">
                    Pick a quick starter below or describe your custom agreement terms in plain language.
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-2 max-w-2xl">
                  {QUICK_PROMPTS.map((prompt, idx) => (
                    <Button
                      key={idx}
                      type="button"
                      variant="glass"
                      size="sm"
                      onClick={() => setChatMessage(prompt)}
                      className="h-auto py-2 px-4 text-[11px] text-slate-100 whitespace-normal text-left"
                    >
                      <Sparkles className="w-3 h-3 text-cyan-300 flex-shrink-0" />
                      <span>{prompt}</span>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              messages.filter(msg => msg.type !== 'document_context').map((msg, index) => (
                <div key={index} className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.sender === 'bot' && (
                    <div className="glass-circle w-7 h-7 flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-cyan-300" />
                    </div>
                  )}
                  <div className={`px-4 py-2.5 rounded-3xl max-w-md text-xs sm:text-sm ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-cyan-500/80 to-blue-600/80 text-white border border-white/45 shadow-[inset_0_1px_1px_rgba(255,255,255,0.7)]'
                      : 'glass-subtle p-4 text-slate-100 border-white/20'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  </div>
                </div>
              ))
            )}

            {isGenerating && (
              <div className="flex items-center gap-2 text-xs text-cyan-300">
                <div className="glass-circle w-7 h-7">
                  <Bot className="w-3.5 h-3.5 text-cyan-300 animate-pulse" />
                </div>
                <span className="glass-pill px-4 py-2">Synthesizing agreement terms...</span>
              </div>
            )}
          </div>

          <div className="relative z-10 pt-3 border-t border-white/15 flex gap-2.5">
            <Input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your contract requirements..."
              className="flex-1 h-12 px-5 text-xs sm:text-sm rounded-full"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isGenerating || !chatMessage.trim()}
              variant="aurora"
              className="h-12 px-7 text-xs"
            >
              <Send className="w-4 h-4 text-cyan-300" />
              <span>Generate</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Document Editor View (3-Column Layout with Fluffy Liquid Glass styling)
  return (
    <div className="flex h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 pb-4 max-w-7xl mx-auto gap-4 relative">

      {/* Left Glass Sidebar: Revision Chat */}
      <div className={`${
        sidebarOpen ? 'w-72 lg:w-80' : 'w-0'
      } transition-all duration-300 h-full relative z-20 flex-shrink-0 overflow-hidden`}>
        <div className="h-full glass-panel glass-reactive rounded-[2rem] border border-white/25 p-4 flex flex-col shadow-fluffy overflow-hidden">

          <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15 flex-shrink-0">
            <div className="flex items-center gap-2">
              <div className="glass-circle w-8 h-8">
                <MessageCircle className="w-4 h-4 text-cyan-300" />
              </div>
              <span className="text-xs font-bold text-white tracking-wide font-display">AI Revision Chat</span>
            </div>
            <Button
              type="button"
              onClick={() => setSidebarOpen(false)}
              variant="glass-circle"
              size="icon-sm"
              className="w-7 h-7 text-slate-300 hover:text-white"
            >
              <X size={15} />
            </Button>
          </div>

          <div ref={chatContainerRef} className="relative z-10 flex-1 overflow-y-auto space-y-3 py-3 pr-1 custom-scrollbar">
            {messages.filter(msg => msg.type !== 'document_context').map((msg, index) => (
              <div key={index} className={`flex gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-3.5 py-2.5 rounded-2xl max-w-[85%] text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-gradient-to-r from-cyan-500/45 to-blue-600/45 text-white border border-white/35'
                    : 'glass-subtle text-slate-100'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
              </div>
            ))}
            {isGenerating && (
              <div className="text-[11px] text-cyan-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 animate-spin" />
                <span>Re-drafting agreement...</span>
              </div>
            )}
          </div>

          <div className="relative z-10 pt-2 border-t border-white/15 flex gap-2">
            <Input
              type="text"
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Prompt changes..."
              className="flex-1 h-9 px-3 text-xs rounded-full"
              disabled={isGenerating}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isGenerating || !chatMessage.trim()}
              variant="default"
              size="icon-sm"
              className="w-9 h-9 flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-slate-950" />
            </Button>
          </div>
        </div>
      </div>

      {/* Main Glass Document Workspace */}
      <div className="flex-1 flex flex-col h-full min-w-0" ref={documentRef}>

        {/* Top Control Bar */}
        <div className="glass-panel glass-reactive p-3.5 px-5 rounded-[1.75rem] border border-white/25 mb-3 flex items-center justify-between flex-shrink-0 shadow-glass">
          <div className="relative z-10 flex items-center gap-3 min-w-0 flex-1">
            {!sidebarOpen && (
              <Button
                type="button"
                onClick={() => setSidebarOpen(true)}
                variant="glass-circle"
                size="icon-sm"
                className="w-8 h-8 text-white flex-shrink-0"
                title="Open Revision Chat"
              >
                <Menu size={16} />
              </Button>
            )}

            <div className="min-w-0 flex-1 flex items-center gap-2">
              {isTitleEditing ? (
                <div className="flex items-center gap-2 flex-1">
                  <Input
                    type="text"
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    onKeyPress={(e) => { if (e.key === 'Enter') handleSaveTitle(); }}
                    className="h-9 text-sm font-bold flex-1 rounded-full"
                  />
                  <Button size="icon-sm" variant="glass-circle" onClick={handleSaveTitle} className="w-8 h-8 text-emerald-300">
                    <Save className="w-4 h-4" />
                  </Button>
                  <Button size="icon-sm" variant="glass-circle" onClick={() => setIsTitleEditing(false)} className="w-8 h-8 text-slate-300">
                    <XCircle className="w-4 h-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2 truncate">
                  <h2 className="text-base sm:text-lg font-extrabold text-white truncate font-display">{title || 'Untitled Document'}</h2>
                  <Button size="icon-sm" variant="glass-circle" onClick={handleEditTitleClick} className="w-7 h-7 text-slate-300 hover:text-white">
                    <Edit className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Attractive Action Pills */}
          <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
            <Button
              variant={isEditing ? "default" : "glass"}
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-8 px-3.5 text-xs"
            >
              {isEditing ? <Eye className="w-3.5 h-3.5" /> : <Edit className="w-3.5 h-3.5 text-cyan-300" />}
              <span className="hidden sm:inline">{isEditing ? "Preview" : "Visual Edit"}</span>
            </Button>

            <Button
              variant="emerald"
              size="sm"
              onClick={() => setIsSignatureModalOpen(true)}
              className="h-8 px-3.5 text-xs"
            >
              <PenTool className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign</span>
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={handleShareDocument}
              className="h-8 px-3.5 text-xs"
            >
              <Share2 className="w-3.5 h-3.5 text-cyan-300" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                setIsVersionsSidebarOpen(!isVersionsSidebarOpen);
                setCommentsSidebarOpen(false);
              }}
              className="h-8 px-3.5 text-xs"
            >
              <History className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Versions</span>
            </Button>

            <Button
              variant="glass"
              size="sm"
              onClick={() => {
                setCommentsSidebarOpen(!commentsSidebarOpen);
                setIsVersionsSidebarOpen(false);
              }}
              className="h-8 px-3.5 text-xs"
            >
              <MessageCircle className="w-3.5 h-3.5 text-purple-300" />
              <span className="hidden sm:inline">Comments</span>
            </Button>

            <Button
              onClick={handleDownloadPdf}
              variant="aurora"
              size="sm"
              className="h-8 px-3.5 text-xs"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>PDF</span>
            </Button>

            <Button
              type="button"
              onClick={toggleFullScreen}
              variant="glass-circle"
              size="icon-sm"
              className="w-8 h-8 text-slate-200 hover:text-white"
              title={isFullScreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullScreen ? <Minimize className="w-3.5 h-3.5" /> : <Maximize className="w-3.5 h-3.5" />}
            </Button>
          </div>
        </div>

        {/* Editor / Preview Glass Container */}
        <div className="flex-1 glass-panel rounded-[2rem] border border-white/25 shadow-fluffy overflow-hidden flex flex-col min-h-0">
          {isEditing && (
            <div className="relative z-10">
              <MenuBar editor={editor} />
            </div>
          )}

          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7">
            {isEditing ? (
              <EditorContent editor={editor} />
            ) : (
              <div
                className="markdown-preview max-w-4xl mx-auto"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(finalDocument) }}
              />
            )}
          </div>
        </div>

      </div>

      {/* Right Drawer: Versions Timeline */}
      {isVersionsSidebarOpen && (
        <div className="w-80 h-full flex-shrink-0 z-30 animate-fade-in">
          <VersionsSidebar
            conversationId={mongoConversationId}
            onSelectVersion={handleSelectVersion}
            onClose={() => setIsVersionsSidebarOpen(false)}
            currentVersion={currentVersion}
            onDeleteVersion={handleDeleteVersion}
          />
        </div>
      )}

      {/* Right Drawer: Comments */}
      {commentsSidebarOpen && (
        <div className="w-80 h-full flex-shrink-0 z-30 animate-fade-in">
          <div className="glass-panel glass-reactive h-full rounded-[2rem] border border-white/25 p-4 shadow-fluffy flex flex-col">
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
              <h3 className="text-sm font-bold text-white font-display">Collaborator Comments</h3>
              <Button
                type="button"
                onClick={() => setCommentsSidebarOpen(false)}
                variant="glass-circle"
                size="icon-sm"
                className="w-7 h-7 text-slate-300 hover:text-white"
              >
                <X size={15} />
              </Button>
            </div>
            <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar pt-3">
              <CommentList documentId={mongoConversationId} />
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isShareModalOpen && (
        <ShareModal
          documentId={mongoConversationId}
          documentTitle={title}
          initialSharedWithUsers={documentSharedWithUsers}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {isSignatureModalOpen && (
        <SignatureModal
          onClose={() => setIsSignatureModalOpen(false)}
          onSignatureAdded={async (signatureMarkdown, partyName) => {
            if (editor) {
              const newContentMarkdown = editor.getHTML() + `\n\n---\n\n${signatureMarkdown}\n\n**${partyName}**`;
              const newContentHtml = convertMarkdownToHtml(newContentMarkdown);
              editor.commands.setContent(newContentHtml);
              setFinalDocument(newContentHtml);
              await handleSaveConversation();
            }
          }}
        />
      )}

    </div>
  );
};

export default DocumentCreation;
