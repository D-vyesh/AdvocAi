import React, { useState, useEffect } from 'react';
import { Copy, X, UserPlus, Trash2, Share2, Globe, Users } from 'lucide-react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/Input';
import { Switch } from '@/Components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/Components/ui/Select';
import axios from '../api/axios';
import toast from 'react-hot-toast';

const ShareModal = ({ documentId, documentTitle, onClose, initialSharedWithUsers = [] }) => {
  const [publicPermissionLevel, setPublicPermissionLevel] = useState('view');
  const [shareUrl, setShareUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [usernameToShare, setUsernameToShare] = useState('');
  const [userPermissionLevel, setUserPermissionLevel] = useState('view');
  const [sharedUsers, setSharedUsers] = useState(initialSharedWithUsers);

  useEffect(() => {
    const fetchShareSettings = async () => {
      if (!documentId) return;
      try {
        const response = await axios.get(`api/documents/conversations/${documentId}/`);
        const conversation = response.data;
        if (conversation.share_permissions) {
          setPublicPermissionLevel(conversation.share_permissions.permission_level);
        }
        setSharedUsers(conversation.shared_with_users || []);
      } catch (error) {
        console.error('Error fetching share settings:', error);
        toast.error('Failed to load share settings.');
      }
    };
    fetchShareSettings();
  }, [documentId]);

  const generateLink = async () => {
    setLoading(true);
    try {
      const response = await axios.post('api/documents/generate-share-link/', {
        document_id: documentId,
        permission_level: publicPermissionLevel,
      });
      const url = `${window.location.origin}${response.data.share_url}`;
      setShareUrl(url);
      toast.success('Public share link generated!');
    } catch (err) {
      console.error('Error generating share link:', err);
      toast.error('Failed to generate public share link.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success('Link copied to clipboard!');
  };

  const handleShareWithUser = async () => {
    if (!usernameToShare.trim()) {
      toast.error('Please enter a username.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`api/documents/conversations/${documentId}/share-with-user/`, {
        username: usernameToShare,
        permission_level: userPermissionLevel,
      });
      toast.success(`Document shared with ${usernameToShare}!`);
      setUsernameToShare('');
      const response = await axios.get(`api/documents/conversations/${documentId}/`);
      setSharedUsers(response.data.shared_with_users || []);
    } catch (error) {
      console.error('Error sharing with user:', error);
      toast.error(error.response?.data?.error || 'Failed to share with user.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveUserShare = async (username) => {
    setLoading(true);
    try {
      await axios.post(`api/documents/conversations/${documentId}/share-with-user/`, {
        username: username,
        permission_level: null,
      });
      toast.success(`Access revoked for ${username}.`);
      const response = await axios.get(`api/documents/conversations/${documentId}/`);
      setSharedUsers(response.data.shared_with_users || []);
    } catch (error) {
      console.error('Error revoking access:', error);
      toast.error(error.response?.data?.error || 'Failed to revoke access.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeUserPermission = async (username, newPermissionLevel) => {
    setLoading(true);
    try {
      await axios.post(`api/documents/conversations/${documentId}/share-with-user/`, {
        username: username,
        permission_level: newPermissionLevel,
      });
      toast.success(`Permissions updated for ${username}.`);
      const response = await axios.get(`api/documents/conversations/${documentId}/`);
      setSharedUsers(response.data.shared_with_users || []);
    } catch (error) {
      console.error('Error changing permissions:', error);
      toast.error(error.response?.data?.error || 'Failed to change permissions.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/65 backdrop-blur-xl flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="w-full max-w-lg glass-panel glass-reactive p-6 sm:p-8 rounded-[2.25rem] border border-white/30 shadow-fluffy space-y-6">
        {/* Modal Header */}
        <div className="relative z-10 flex items-center justify-between pb-4 border-b border-white/15">
          <div className="flex items-center gap-3">
            <div className="glass-circle w-11 h-11 shadow-glass-glow">
              <Share2 className="w-5 h-5 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white leading-tight font-display">Share Document</h3>
              <p className="text-xs text-slate-300/80 truncate max-w-xs">{documentTitle}</p>
            </div>
          </div>
          <Button
            type="button"
            onClick={onClose}
            variant="glass-circle"
            size="icon-sm"
            className="w-8 h-8 text-slate-300 hover:text-white"
            aria-label="Close share modal"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Public Share Link Section */}
        <div className="relative z-10 space-y-3 pb-5 border-b border-white/15">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
            <Globe className="w-4 h-4" />
            <span>Public Access Link</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl glass-subtle">
            <div>
              <p className="text-sm font-semibold text-white">Public Editing</p>
              <p className="text-xs text-slate-400">Allow anyone with this link to edit clauses</p>
            </div>
            <Switch
              id="public-edit-permission"
              checked={publicPermissionLevel === 'edit'}
              onCheckedChange={(checked) => setPublicPermissionLevel(checked ? 'edit' : 'view')}
              disabled={loading}
            />
          </div>

          <Button
            onClick={generateLink}
            disabled={loading}
            variant="aurora"
            className="w-full h-10 text-xs"
          >
            {loading ? 'Generating Link...' : 'Generate / Refresh Link'}
          </Button>

          {shareUrl && (
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={shareUrl}
                readOnly
                className="flex-1 h-10 text-xs font-mono rounded-full"
              />
              <Button
                onClick={handleCopyToClipboard}
                variant="glass"
                className="h-10 px-4 text-xs flex-shrink-0"
              >
                <Copy className="w-4 h-4 text-cyan-300" />
                <span>Copy</span>
              </Button>
            </div>
          )}
        </div>

        {/* Share with Specific Users Section */}
        <div className="relative z-10 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-300">
            <Users className="w-4 h-4" />
            <span>Direct Collaborator Invite</span>
          </div>

          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Enter username"
              value={usernameToShare}
              onChange={(e) => setUsernameToShare(e.target.value)}
              disabled={loading}
              className="flex-1 h-10 text-xs rounded-full"
            />
            <Select value={userPermissionLevel} onValueChange={setUserPermissionLevel} disabled={loading}>
              <SelectTrigger className="w-[110px] h-10 text-xs rounded-full">
                <SelectValue placeholder="Access" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View</SelectItem>
                <SelectItem value="edit">Edit</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleShareWithUser}
              disabled={loading || !usernameToShare.trim()}
              variant="default"
              className="h-10 px-4 text-xs"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Add</span>
            </Button>
          </div>

          {/* List of Shared Users */}
          {sharedUsers.length > 0 && (
            <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar pt-2">
              <p className="text-xs text-slate-400 font-medium">Collaborators with access:</p>
              {sharedUsers.map((user) => (
                <div key={user.username} className="flex items-center justify-between p-2.5 rounded-2xl glass-subtle text-xs">
                  <span className="font-semibold text-white">@{user.username}</span>
                  <div className="flex items-center gap-2">
                    <Select
                      value={user.permission_level}
                      onValueChange={(newLevel) => handleChangeUserPermission(user.username, newLevel)}
                      disabled={loading}
                    >
                      <SelectTrigger className="w-[85px] h-7 text-[11px] rounded-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => handleRemoveUserShare(user.username)}
                      disabled={loading}
                      variant="glass-circle"
                      size="icon-sm"
                      className="w-7 h-7 text-rose-300 hover:text-rose-100 hover:border-rose-400/60"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
