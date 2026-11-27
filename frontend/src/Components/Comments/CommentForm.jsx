import React, { useState } from 'react';
import axios from '../../api/axios';
import { Button } from "@/Components/ui/button";

const CommentForm = ({ documentId, parentCommentId = null, onCommentAdded, placeholder = "Add a comment..." }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const payload = {
        document_id: documentId,
        content: content,
        parent_comment: parentCommentId,
      };
      await axios.post(`/api/documents/${documentId}/comments/`, payload);
      setContent('');
      if (onCommentAdded) {
        onCommentAdded();
      }
    } catch (err) {
      console.error('Error posting comment:', err);
      setError('Failed to post comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3 space-y-2.5">
      <textarea
        className="glass-input w-full p-3.5 rounded-2xl text-xs text-white placeholder:text-slate-400 resize-none outline-none"
        rows="2"
        placeholder={placeholder}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        disabled={loading}
      />
      {error && <p className="text-rose-400 text-[11px]">{error}</p>}
      <Button
        type="submit"
        size="sm"
        variant="default"
        className="h-8 px-4 text-xs"
        disabled={loading || !content.trim()}
      >
        {loading ? 'Posting...' : 'Post Comment'}
      </Button>
    </form>
  );
};

export default CommentForm;
