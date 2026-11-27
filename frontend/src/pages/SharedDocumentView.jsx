import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { Button } from "@/Components/ui/button";
import { FileText, Download, MessageCircle, X, Edit, History, PenTool, Sparkles } from 'lucide-react';
import CommentList from '../Components/Comments/CommentList';
import { saveAs } from 'file-saver';
import { useEditor, EditorContent, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Markdown } from 'tiptap-markdown';
import { Indent } from '../lib/tiptap-extensions/indent';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Image from '@tiptap/extension-image';
import MenuBar from '../Components/MenuBar';
import SignatureModal from '../Components/SignatureModal';
import VersionsSidebar from '../Components/VersionsSidebar';

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

const SharedDocumentView = () => {
  const { id: mongoConversationId } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const versionToLoad = queryParams.get('version');

  const [title, setTitle] = useState('Loading Document...');
  const [documentContent, setDocumentContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isCommentsSidebarOpen, setIsCommentsSidebarOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isVersionsSidebarOpen, setIsVersionsSidebarOpen] = useState(false);
  const [currentVersion, setCurrentVersion] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      Image.configure({ inline: true }),
      Indent,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
    ],
    content: documentContent,
    editable: isEditMode,
    onUpdate: ({ editor }) => {
      setDocumentContent(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'markdown-preview p-8 bg-transparent text-slate-100 overflow-hidden outline-none',
      },
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(isEditMode);
      if (editor.getHTML() !== documentContent) {
        editor.commands.setContent(documentContent, false);
      }
    }
  }, [isEditMode, documentContent, editor]);

  const fetchDocument = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(`api/documents/conversations/${mongoConversationId}/`);
      const conversation = response.data;
      setTitle(conversation.title || 'Untitled Document');

      if (conversation.share_permissions && conversation.share_permissions.permission_level === 'edit') {
        setCanEdit(true);
      }

      if (conversation.document_versions && conversation.document_versions.length > 0) {
        let contentToLoad = '';
        let versionToSet = null;

        if (versionToLoad) {
          const versionResponse = await axios.get(`api/documents/conversations/${mongoConversationId}/versions/${versionToLoad}/content/`);
          contentToLoad = versionResponse.data.content;
          versionToSet = parseInt(versionToLoad);
          toast.success(`Loaded version ${versionToLoad}`);
        } else {
          const latestVersion = conversation.document_versions[conversation.document_versions.length - 1];
          contentToLoad = latestVersion.content;
          versionToSet = latestVersion.version_number;
        }
        const htmlContent = convertMarkdownToHtml(contentToLoad);
        setDocumentContent(htmlContent);
        setCurrentVersion(versionToSet);
      } else {
        setDocumentContent('No content available for this document.');
        setCurrentVersion(null);
      }
    } catch (err) {
      console.error('Error fetching document:', err);
      setError('Failed to load document. It might not exist or you lack permission.');
      toast.error('Failed to load document.');
    } finally {
      setLoading(false);
    }
  }, [mongoConversationId, versionToLoad]);

  useEffect(() => {
    if (mongoConversationId) {
      fetchDocument();
    }
  }, [mongoConversationId, versionToLoad, fetchDocument]);

  const handleDownloadPdf = async () => {
    if (!mongoConversationId) {
      toast.error('Document not available for download.');
      return;
    }
    try {
      const downloadUrl = currentVersion
        ? `api/utils/conversations/${mongoConversationId}/download-version-pdf/${currentVersion}/`
        : `api/utils/conversations/${mongoConversationId}/download-latest-pdf/`;

      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
      });
      saveAs(response.data, `${title || 'shared_document'}_v${currentVersion || 'latest'}.pdf`);
      toast.success('PDF downloaded!');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error(`Failed to download PDF: ${err.message}`);
    }
  };

  const handleSave = async () => {
    if (!editor) return;
    try {
      await axios.put(`api/documents/conversations/${mongoConversationId}/`, {
        title: title,
        new_document_content: editor.getHTML(),
        notes: 'Updated from shared link'
      });
      toast.success('Document saved!');
      setIsEditMode(false);
      fetchDocument();
    } catch (err) {
      console.error('Error saving document:', err);
      toast.error('Failed to save document.');
    }
  };

  const handleSelectVersion = async (versionNumber) => {
    try {
      const response = await axios.get(`api/documents/conversations/${mongoConversationId}/versions/${versionNumber}/content/`);
      setDocumentContent(response.data.content);
      setCurrentVersion(versionNumber);
      toast.success(`Loaded version ${versionNumber}`);
      setIsVersionsSidebarOpen(false);
    } catch (error) {
      console.error('Error fetching version:', error);
      toast.error('Could not load version.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-5.5rem)]">
        <div className="glass-panel p-8 rounded-[2rem] text-center">
          <Sparkles className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-300">Decrypting document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-5.5rem)] p-4">
        <div className="glass-panel p-8 rounded-[2rem] text-center max-w-sm">
          <p className="text-rose-400 text-sm font-semibold">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 pb-4 max-w-7xl mx-auto gap-4 relative">
      <div className="flex-1 flex flex-col h-full min-w-0">

        {/* Top Control Bar */}
        <div className="glass-panel glass-reactive p-4 px-6 rounded-[1.75rem] border border-white/25 mb-3 flex items-center justify-between flex-shrink-0 shadow-glass">
          <div className="relative z-10 min-w-0 flex-1 flex items-center gap-3">
            <div className="glass-circle w-9 h-9 flex-shrink-0">
              <FileText className="w-4 h-4 text-cyan-300" />
            </div>
            <h1 className="text-base sm:text-xl font-extrabold text-white truncate font-display">
              {title}
            </h1>
          </div>

          <div className="relative z-10 flex items-center gap-2 flex-shrink-0">
            {canEdit && !isEditMode && (
              <Button onClick={() => setIsEditMode(true)} variant="glass" size="sm" className="h-8 px-3.5 text-xs">
                <Edit className="w-3.5 h-3.5 text-cyan-300" />
                <span>Edit</span>
              </Button>
            )}

            {isEditMode && (
              <Button onClick={handleSave} variant="emerald" size="sm" className="h-8 px-4 text-xs">
                Save
              </Button>
            )}

            {canEdit && (
              <Button
                onClick={() => {
                  setIsEditMode(true);
                  setShowSignatureModal(true);
                }}
                variant="emerald"
                size="sm"
                className="h-8 px-3.5 text-xs"
              >
                <PenTool className="w-3.5 h-3.5" />
                <span>Sign</span>
              </Button>
            )}

            <Button
              onClick={handleDownloadPdf}
              variant="aurora"
              size="sm"
              className="h-8 px-3.5 text-xs"
            >
              <Download className="w-3.5 h-3.5 text-cyan-300" />
              <span>PDF</span>
            </Button>

            {mongoConversationId && (
              <Button
                type="button"
                onClick={() => {
                  setIsVersionsSidebarOpen(!isVersionsSidebarOpen);
                  setIsCommentsSidebarOpen(false);
                }}
                variant="glass-circle"
                size="icon-sm"
                className="w-8 h-8 text-slate-200 hover:text-white"
                title="Versions"
              >
                <History className="w-4 h-4" />
              </Button>
            )}

            <Button
              type="button"
              onClick={() => setIsCommentsSidebarOpen(!isCommentsSidebarOpen)}
              variant="glass-circle"
              size="icon-sm"
              className="w-8 h-8 text-slate-200 hover:text-white"
              title="Comments"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Editor or Content View */}
        <div className="flex-1 glass-panel rounded-[2rem] border border-white/25 shadow-fluffy overflow-hidden flex flex-col min-h-0">
          {isEditMode && (
            <div className="relative z-10">
              <MenuBar editor={editor} />
            </div>
          )}

          <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-7">
            {isEditMode ? (
              <EditorContent editor={editor} />
            ) : (
              <div
                className="markdown-preview max-w-4xl mx-auto"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(documentContent) }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Right Drawer: Versions */}
      {isVersionsSidebarOpen && (
        <div className="w-80 h-full flex-shrink-0 z-30 animate-fade-in">
          <VersionsSidebar
            conversationId={mongoConversationId}
            onSelectVersion={handleSelectVersion}
            onClose={() => setIsVersionsSidebarOpen(false)}
            currentVersion={currentVersion}
          />
        </div>
      )}

      {/* Right Drawer: Comments */}
      {isCommentsSidebarOpen && (
        <div className="w-80 h-full flex-shrink-0 z-30 animate-fade-in">
          <div className="glass-panel glass-reactive h-full rounded-[2rem] border border-white/25 p-4 shadow-fluffy flex flex-col">
            <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/15">
              <h3 className="text-sm font-bold text-white font-display">Collaborator Discussion</h3>
              <Button
                type="button"
                onClick={() => setIsCommentsSidebarOpen(false)}
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

      {showSignatureModal && (
        <SignatureModal
          onClose={() => setShowSignatureModal(false)}
          onSignatureAdded={async (signatureMarkdown, partyName) => {
            if (editor) {
              const newContentMarkdown = editor.getHTML() + `\n\n---\n\n${signatureMarkdown}\n\n**${partyName}**`;
              const newContentHtml = convertMarkdownToHtml(newContentMarkdown);
              editor.commands.setContent(newContentHtml);
              setDocumentContent(newContentHtml);
              await handleSave();
            }
          }}
        />
      )}
    </div>
  );
};

export default SharedDocumentView;
