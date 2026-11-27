import React, { useState, useEffect, useCallback } from 'react';
import axios from '../api/axios';
import { FileText, Download, Trash2, History, X, Check, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { Button } from "@/Components/ui/button";

const VersionsSidebar = ({ conversationId, onSelectVersion, onClose, currentVersion, onDeleteVersion }) => {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Document');

  const fetchDocumentVersions = useCallback(async () => {
    if (!conversationId) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/documents/conversations/${conversationId}/`);
      setDocumentTitle(response.data.title || 'Document');
      setVersions(response.data.document_versions || []);
    } catch (err) {
      console.error('Error fetching document versions:', err);
      setError('Failed to load document versions.');
      toast.error('Failed to load document versions.');
    } finally {
      setLoading(false);
    }
  }, [conversationId]);

  useEffect(() => {
    fetchDocumentVersions();
  }, [conversationId, fetchDocumentVersions]);

  const handleDownloadVersionPdf = async (versionNumber) => {
    try {
      const response = await axios.get(`utils/conversations/${conversationId}/versions/${versionNumber}/download-pdf/`, {
        responseType: 'blob',
      });
      const filename = `${documentTitle}_v${versionNumber}.pdf`;
      const blob = new Blob([response.data], { type: 'application/pdf' });
      saveAs(blob, filename);
      toast.success(`Version ${versionNumber} PDF downloaded!`);
    } catch (err) {
      console.error(`Error downloading version ${versionNumber} PDF:`, err);
      toast.error(`Failed to download version ${versionNumber} PDF.`);
    }
  };

  const handleDeleteVersionClick = async (versionNumber) => {
    if (onDeleteVersion) {
      await onDeleteVersion(conversationId, versionNumber);
      fetchDocumentVersions();
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel glass-reactive border border-white/25 p-4 shadow-fluffy overflow-hidden rounded-[2rem]">
      {/* Header */}
      <div className="relative z-10 pb-4 border-b border-white/15 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="glass-circle w-9 h-9">
            <History className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-wide">Version Timeline</h3>
            <p className="text-[11px] text-slate-400">Chronological snapshot restore</p>
          </div>
        </div>
        <Button
          onClick={() => onClose()}
          variant="glass-circle"
          size="icon-sm"
          className="w-7 h-7 text-slate-300 hover:text-white"
          type="button"
          title="Close Sidebar"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Version List */}
      <div className="relative z-10 flex-1 overflow-y-auto py-3 space-y-2.5 custom-scrollbar pr-1">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2 text-slate-400">
            <History className="w-5 h-5 animate-spin text-cyan-400" />
            <span className="text-xs">Loading versions...</span>
          </div>
        ) : error ? (
          <div className="text-rose-400 text-center py-8 text-xs">{error}</div>
        ) : versions.length === 0 ? (
          <div className="text-center py-12 text-slate-400">
            <History className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs">No version snapshots recorded</p>
          </div>
        ) : (
          versions.map((version) => {
            const isCurrentVersion = currentVersion === version.version_number;
            return (
              <div
                key={version.version_number}
                className={`p-3.5 rounded-2xl transition-all duration-300 ${
                  isCurrentVersion
                    ? 'bg-white/20 border border-cyan-300/65 shadow-[inset_0_2px_2px_rgba(255,255,255,0.75),0_8px_22px_rgba(0,212,255,0.28)]'
                    : 'glass-subtle hover:bg-white/12 hover:border-white/25'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <FileText className={`w-4 h-4 ${isCurrentVersion ? 'text-cyan-300' : 'text-slate-400'}`} />
                    <span className="font-bold text-xs text-white">
                      Version {version.version_number}
                    </span>
                    {isCurrentVersion && (
                      <span className="glass-pill px-2 py-0.5 text-[10px] text-emerald-300 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-slate-400 mb-3 flex items-center gap-1.5">
                  <Clock className="w-3 h-3" />
                  {new Date(version.timestamp).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => onSelectVersion(version.version_number)}
                    size="sm"
                    variant={isCurrentVersion ? "default" : "glass"}
                    className="flex-1 h-8 text-xs"
                  >
                    Load
                  </Button>
                  <Button
                    onClick={() => handleDownloadVersionPdf(version.version_number)}
                    size="icon-sm"
                    variant="glass-circle"
                    className="w-8 h-8 text-slate-200"
                    title="Download PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    onClick={() => handleDeleteVersionClick(version.version_number)}
                    size="icon-sm"
                    variant="glass-circle"
                    className="w-8 h-8 text-rose-300 hover:text-rose-100 hover:border-rose-400/50"
                    title="Delete Version"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VersionsSidebar;
