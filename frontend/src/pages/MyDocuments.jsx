import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import toast from 'react-hot-toast';
import {
  FileText,
  History,
  Download,
  Trash2,
  PlusCircle,
  Share2,
  Edit,
  Save,
  XCircle,
  Calendar,
  UserCheck,
  FolderOpen,
  Search
} from 'lucide-react';
import { Button } from "@/Components/ui/button";
import { Input } from "@/Components/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/Components/ui/Tabs";
import ShareModal from '../Components/ShareModal';
import { useAuth } from '../context/AuthContext';

const MyDocuments = () => {
  const { user } = useAuth();
  const [myDocumentsList, setMyDocumentsList] = useState([]);
  const [sharedWithMeDocumentsList, setSharedWithMeDocumentsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [editingDocId, setEditingDocId] = useState(null);
  const [newTitle, setNewTitle] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [activeTab, setActiveTab] = useState('my_documents');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/documents/conversations/');
      const allDocuments = response.data;

      const owned = [];
      const shared = [];

      allDocuments.forEach(doc => {
        if (doc.owner === user.username) {
          owned.push(doc);
        } else {
          const isSharedWithMe = doc.shared_with_users?.some(
            sharedUser => sharedUser.username === user.username
          );
          if (isSharedWithMe) {
            shared.push(doc);
          }
        }
      });

      setMyDocumentsList(owned);
      setSharedWithMeDocumentsList(shared);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError('Failed to load documents.');
      toast.error('Failed to load documents.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  const handleViewDocument = (documentId) => {
    navigate(`/document-creation/${documentId}`);
  };

  const handleDownloadPdf = async (documentId, title) => {
    try {
      const response = await axios.get(`api/utils/conversations/${documentId}/download-latest-pdf/`, {
        responseType: 'blob',
      });
      const { saveAs } = await import('file-saver');
      saveAs(response.data, `${title || 'legal_document'}.pdf`);
      toast.success('PDF downloaded successfully!');
    } catch (err) {
      console.error('Error downloading PDF:', err);
      toast.error('Failed to download PDF.');
    }
  };

  const handleEditClick = (docId, currentTitle) => {
    setEditingDocId(docId);
    setNewTitle(currentTitle);
  };

  const handleSaveTitle = async (docId) => {
    if (!newTitle.trim()) {
      toast.error('Document title cannot be empty.');
      return;
    }
    try {
      await axios.put(`api/documents/conversations/${docId}/`, { title: newTitle });
      toast.success('Document title updated!');
      setEditingDocId(null);
      setNewTitle('');
      fetchDocuments();
    } catch (err) {
      console.error('Error updating document title:', err);
      toast.error('Failed to update document title.');
    }
  };

  const handleCancelEdit = () => {
    setEditingDocId(null);
    setNewTitle('');
  };

  const handleDeleteDocument = async (documentId) => {
    if (window.confirm('Delete this document and all snapshot versions? This cannot be undone.')) {
      try {
        await axios.delete(`api/documents/conversations/${documentId}/`);
        toast.success('Document deleted!');
        fetchDocuments();
      } catch (err) {
        console.error('Error deleting document:', err);
        toast.error('Failed to delete document.');
      }
    }
  };

  const handleShareDocument = (doc) => {
    setSelectedDoc(doc);
    setIsShareModalOpen(true);
  };

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMyDocs = normalizedQuery
    ? myDocumentsList.filter((d) => (d.title || 'Untitled Document').toLowerCase().includes(normalizedQuery))
    : myDocumentsList;
  const filteredSharedDocs = normalizedQuery
    ? sharedWithMeDocumentsList.filter((d) => (d.title || '').toLowerCase().includes(normalizedQuery))
    : sharedWithMeDocumentsList;

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-6 max-w-5xl mx-auto">
      {isShareModalOpen && selectedDoc && (
        <ShareModal
          documentId={selectedDoc._id}
          documentTitle={selectedDoc.title}
          initialSharedWithUsers={selectedDoc.shared_with_users || []}
          onClose={() => setIsShareModalOpen(false)}
        />
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight font-display">
            Document Repository
          </h1>
          <p className="text-xs sm:text-sm text-slate-300/80 mt-1">
            Manage your legal agreements, revisions, and collaborative shares
          </p>
        </div>

        <Button
          onClick={() => navigate('/document-creation')}
          variant="aurora"
          className="h-11 px-6 text-xs"
        >
          <PlusCircle className="w-4 h-4 text-cyan-300" />
          <span>New Document</span>
        </Button>
      </div>

      {/* Segmented Pill Tabs & Search Bar */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <TabsList className="h-12">
            <TabsTrigger value="my_documents" className="px-6 py-2 text-xs font-bold">
              My Documents ({myDocumentsList.length})
            </TabsTrigger>
            <TabsTrigger value="shared_with_me" className="px-6 py-2 text-xs font-bold">
              Shared With Me ({sharedWithMeDocumentsList.length})
            </TabsTrigger>
          </TabsList>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-cyan-300 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter agreements..."
              className="h-10 pl-10 pr-4 text-xs rounded-full"
            />
          </div>
        </div>

        {/* Tab 1: Owned Documents */}
        <TabsContent value="my_documents">
          {loading ? (
            <div className="text-center py-20 glass-panel rounded-[2rem]">
              <History className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
              <p className="text-xs text-slate-300">Retrieving documents from vault...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-rose-400 glass-panel rounded-[2rem] text-sm">
              <p>{error}</p>
            </div>
          ) : filteredMyDocs.length === 0 ? (
            <div className="text-center py-20 glass-panel glass-reactive rounded-[2.25rem] space-y-4 p-8 border border-white/25">
              <div className="relative z-10 space-y-4">
                <div className="glass-circle w-16 h-16 mx-auto shadow-glass-glow">
                  <FolderOpen className="w-8 h-8 text-cyan-300" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-white font-display">
                    {normalizedQuery ? 'No matching documents' : 'No contracts created yet'}
                  </h3>
                  <p className="text-xs text-slate-300/80 max-w-sm mx-auto">
                    {normalizedQuery
                      ? 'Try adjusting your search keyword.'
                      : 'Create your first agreement using our AI generator or draft one from scratch.'}
                  </p>
                </div>
                {!normalizedQuery && (
                  <Button
                    onClick={() => navigate('/document-creation')}
                    variant="aurora"
                    className="h-11 px-6 text-xs"
                  >
                    Draft Your First Document
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredMyDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="glass-panel glass-reactive glass-panel-interactive p-5 rounded-[2.25rem] border border-white/25 shadow-fluffy flex flex-col justify-between group"
                >
                  <div className="relative z-10">
                    {/* Top Row: Title & Edit Icon */}
                    <div className="flex items-start justify-between gap-3 mb-2">
                      {editingDocId === doc._id ? (
                        <div className="flex-1 flex items-center gap-2">
                          <Input
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="h-9 text-sm font-bold flex-1 rounded-full"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleSaveTitle(doc._id);
                            }}
                          />
                          <Button
                            type="button"
                            onClick={() => handleSaveTitle(doc._id)}
                            variant="glass-circle"
                            size="icon-sm"
                            className="w-8 h-8 text-emerald-300"
                            title="Save Title"
                          >
                            <Save className="w-4 h-4" />
                          </Button>
                          <Button
                            type="button"
                            onClick={handleCancelEdit}
                            variant="glass-circle"
                            size="icon-sm"
                            className="w-8 h-8 text-slate-300"
                            title="Cancel Edit"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <div className="glass-circle w-9 h-9 flex-shrink-0">
                            <FileText className="w-4 h-4 text-cyan-300" />
                          </div>
                          <h3 className="text-base font-bold text-white truncate flex-1 font-display">
                            {doc.title || 'Untitled Document'}
                          </h3>
                          <Button
                            type="button"
                            onClick={() => handleEditClick(doc._id, doc.title)}
                            variant="glass-circle"
                            size="icon-sm"
                            className="w-7 h-7 text-slate-300 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Edit Title"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-300/80 mb-4 pl-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>Created {new Date(doc.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      {doc.document_versions?.length > 1 && (
                        <span className="glass-pill px-2.5 py-0.5 text-[10px] text-cyan-300">
                          {doc.document_versions.length} versions
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => handleViewDocument(doc._id)}
                      className="h-9 px-4 text-xs flex-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Open Workspace</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleShareDocument(doc)}
                      variant="glass-circle"
                      size="icon-sm"
                      className="w-9 h-9 text-slate-200 hover:text-white"
                      title="Share Document"
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleDownloadPdf(doc._id, doc.title)}
                      variant="glass-circle"
                      size="icon-sm"
                      className="w-9 h-9 text-slate-200 hover:text-white"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleDeleteDocument(doc._id)}
                      variant="glass-circle"
                      size="icon-sm"
                      className="w-9 h-9 text-rose-300 hover:text-rose-100 hover:border-rose-400/60"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Shared With Me */}
        <TabsContent value="shared_with_me">
          {loading ? (
            <div className="text-center py-20 glass-panel rounded-[2rem]">
              <History className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-3" />
              <p className="text-xs text-slate-300">Loading shared agreements...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-rose-400 glass-panel rounded-[2rem] text-sm">
              <p>{error}</p>
            </div>
          ) : filteredSharedDocs.length === 0 ? (
            <div className="text-center py-20 glass-panel glass-reactive rounded-[2.25rem] space-y-3 p-8 border border-white/25">
              <div className="relative z-10 space-y-3">
                <div className="glass-circle w-16 h-16 mx-auto">
                  <UserCheck className="w-8 h-8 text-amber-300" />
                </div>
                <h3 className="text-lg font-bold text-white font-display">No shared documents</h3>
                <p className="text-xs text-slate-300/80 max-w-sm mx-auto">
                  Agreements shared with you by other teams or clients will appear here.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">
              {filteredSharedDocs.map((doc) => (
                <div
                  key={doc._id}
                  className="glass-panel glass-reactive glass-panel-interactive p-5 rounded-[2.25rem] border border-white/25 shadow-fluffy flex flex-col justify-between"
                >
                  <div className="relative z-10">
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="glass-circle w-9 h-9 flex-shrink-0">
                        <FileText className="w-4 h-4 text-amber-300" />
                      </div>
                      <h3 className="text-base font-bold text-white truncate flex-1 font-display">
                        {doc.title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-300/80 mb-4 pl-1">
                      <span>Shared by: <strong className="text-white">@{doc.owner}</strong></span>
                      <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="relative z-10 pt-3 border-t border-white/15 flex items-center justify-between gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => navigate(`/documentShare/${doc._id}`)}
                      className="h-9 px-4 text-xs flex-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Shared Doc</span>
                    </Button>

                    <Button
                      type="button"
                      onClick={() => handleDownloadPdf(doc._id, doc.title)}
                      variant="glass-circle"
                      size="icon-sm"
                      className="w-9 h-9 text-slate-200 hover:text-white"
                      title="Download PDF"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyDocuments;
