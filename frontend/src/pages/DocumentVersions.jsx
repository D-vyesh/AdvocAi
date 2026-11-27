import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { FileText, Download, History, ArrowLeft, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { saveAs } from 'file-saver';
import { Button } from '@/Components/ui/button';

const DocumentVersions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [documentTitle, setDocumentTitle] = useState('Document');

  useEffect(() => {
    const fetchDocumentVersions = async () => {
      try {
        const response = await axios.get(`api/documents/conversations/${id}/`);
        setDocumentTitle(response.data.title || 'Document');
        setVersions(response.data.document_versions || []);
      } catch (err) {
        console.error('Error fetching document versions:', err);
        setError('Failed to load document versions.');
        toast.error('Failed to load document versions.');
      } finally {
        setLoading(false);
      }
    };

    fetchDocumentVersions();
  }, [id]);

  const handleDownloadVersionPdf = async (versionNumber) => {
    try {
      const response = await axios.get(`utils/conversations/${id}/versions/${versionNumber}/download-pdf/`, {
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

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center">
        <div className="glass-panel p-8 rounded-[2rem] text-center">
          <History className="w-8 h-8 animate-spin text-cyan-400 mx-auto mb-2" />
          <p className="text-xs text-slate-300">Loading version history...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-5.5rem)] flex items-center justify-center p-4">
        <div className="glass-panel p-8 rounded-[2rem] text-center text-rose-400 text-sm">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-5.5rem)] px-4 sm:px-6 lg:px-8 py-8 max-w-4xl mx-auto space-y-6">

      {/* Back button & Title */}
      <div className="flex items-center gap-4">
        <Button
          type="button"
          onClick={() => navigate(-1)}
          variant="glass-circle"
          size="icon"
          className="w-10 h-10 text-slate-200 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight font-display">Version Snapshots</h1>
          <p className="text-xs text-slate-300/80">Chronological history for: <span className="text-cyan-300 font-semibold">{documentTitle}</span></p>
        </div>
      </div>

      {versions.length === 0 ? (
        <div className="glass-panel p-12 rounded-[2rem] text-center">
          <History className="w-10 h-10 text-slate-400 mx-auto mb-3 opacity-40" />
          <p className="text-sm text-slate-300">No versions recorded for this document.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {versions.map((version) => (
            <div
              key={version.version_number}
              className="glass-panel glass-reactive glass-panel-interactive p-5 rounded-3xl border border-white/25 flex flex-col sm:flex-row items-center justify-between gap-4"
            >
              <div className="relative z-10 flex items-center gap-3">
                <div className="glass-circle w-10 h-10">
                  <FileText className="w-5 h-5 text-cyan-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-display">Version {version.version_number}</h3>
                  <p className="text-xs text-slate-300/80 flex items-center gap-1.5 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(version.timestamp).toLocaleString()}</span>
                  </p>
                </div>
              </div>

              <div className="relative z-10 flex items-center gap-2 w-full sm:w-auto">
                <Button
                  onClick={() => handleDownloadVersionPdf(version.version_number)}
                  size="sm"
                  variant="glass"
                  className="h-9 px-4 text-xs flex-1 sm:flex-none text-white"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </Button>

                <Button
                  onClick={() => navigate(`/document-creation/${id}?version=${version.version_number}`)}
                  size="sm"
                  variant="aurora"
                  className="h-9 px-4 text-xs flex-1 sm:flex-none"
                >
                  <FileText className="w-3.5 h-3.5 text-cyan-300" />
                  <span>Open & Edit</span>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentVersions;
