import React, { useState, useRef } from 'react';
import { X, Upload, PenTool } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/Input';
import { Label } from '@/Components/ui/Label';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const SignatureModal = ({ onClose, onSignatureAdded }) => {
  const [partyName, setPartyName] = useState('');
  const [signatureFile, setSignatureFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
      setSignatureFile(file);
    } else {
      toast.error('Please select a PNG, JPG, or WEBP image.');
    }
  };

  const handleAddSignature = async () => {
    if (!partyName.trim() || !signatureFile) {
      toast.error('Please provide a signatory label and signature image.');
      return;
    }

    setLoading(true);
    try {
      const form = new FormData();
      form.append('signature', signatureFile);
      const res = await axios.post('api/utils/upload-signature/', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const url = res.data?.url;
      if (!url) {
        toast.error('Upload failed. No URL returned.');
        setLoading(false);
        return;
      }

      const signatureMarkdown = `![Signature for ${partyName}](${url})`;
      onSignatureAdded(signatureMarkdown, partyName);
      toast.success('Signature bound to agreement!');
      onClose();
    } catch (error) {
      console.error('Signature upload error:', error);
      const msg = error.response?.data?.error || 'Failed to upload signature.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-md glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/30 shadow-fluffy space-y-6">
        {/* Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="glass-circle w-11 h-11 shadow-[inset_0_2px_3px_rgba(255,255,255,0.85),0_6px_18px_rgba(16,185,129,0.35)]">
              <PenTool className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white font-display">Attach E-Signature</h3>
              <p className="text-xs text-slate-300/80">Cryptographically stamp document</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="glass-circle"
            size="icon-sm"
            className="w-8 h-8 text-slate-300 hover:text-white"
            aria-label="Close signature modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Inputs */}
        <div className="relative z-10 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="party-name" className="text-xs font-semibold text-slate-200 pl-1">
              Signatory / Party Label
            </Label>
            <Input
              id="party-name"
              value={partyName}
              onChange={(e) => setPartyName(e.target.value)}
              placeholder="e.g. Authorized Officer, Client Representative"
              className="h-10 text-xs rounded-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold text-slate-200 pl-1">
              Signature Image Stamp
            </Label>
            <div
              className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-white/25 rounded-3xl glass-subtle cursor-pointer hover:border-cyan-300/70 hover:bg-white/[0.1] transition-all cursor-glass-target"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="space-y-2 text-center">
                <div className="glass-circle w-12 h-12 mx-auto">
                  <Upload className="h-5 w-5 text-cyan-300" />
                </div>
                <div className="text-xs text-slate-200">
                  <p className="font-semibold">{signatureFile ? signatureFile.name : 'Tap to upload signature'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, or WEBP (transparent background ideal)</p>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          <Button
            onClick={handleAddSignature}
            disabled={loading || !partyName || !signatureFile}
            variant="emerald"
            className="w-full h-11 text-xs mt-2"
          >
            {loading ? 'Binding Signature...' : 'Stamp Signature into Document'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignatureModal;
