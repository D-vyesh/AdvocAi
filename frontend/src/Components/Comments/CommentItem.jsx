import React, { useState, useRef, useEffect } from 'react';
import CommentForm from './CommentForm';
import { Button } from "@/Components/ui/button";

const CommentItem = ({ comment, documentId, onCommentAdded, highlightCommentId }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const commentRef = useRef(null);

  useEffect(() => {
    if (highlightCommentId && comment.id === highlightCommentId && commentRef.current) {
      commentRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      commentRef.current.classList.add('highlight-comment');
      const timer = setTimeout(() => {
        commentRef.current?.classList.remove('highlight-comment');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [highlightCommentId, comment.id]);

  const handleReplyAdded = () => {
    setShowReplyForm(false);
    onCommentAdded();
  };

  return (
    <div
      ref={commentRef}
      id={`comment-${comment.id}`}
      className={`mb-3 p-3.5 glass-subtle rounded-2xl border border-white/20 transition-all duration-300 ${
        highlightCommentId === comment.id ? 'border-cyan-400 shadow-[0_0_20px_rgba(0,212,255,0.45)]' : ''
      }`}
    >
      <div className="flex justify-between items-center mb-1.5">
        <span className="font-bold text-xs text-white">@{comment.user}</span>
        <span className="text-[10px] text-slate-400">{new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
      </div>
      <p className="text-xs text-slate-200 mb-2.5 leading-relaxed whitespace-pre-wrap">{comment.content}</p>

      <div className="flex items-center gap-3">
        <Button
          type="button"
          onClick={() => setShowReplyForm(!showReplyForm)}
          variant="glass"
          size="sm"
          className="h-6 px-3 text-[11px] text-cyan-300"
        >
          {showReplyForm ? 'Cancel' : 'Reply'}
        </Button>
      </div>

      {showReplyForm && (
        <div className="mt-3 pl-3 border-l-2 border-cyan-400/50">
          <CommentForm
            documentId={documentId}
            parentCommentId={comment.id}
            onCommentAdded={handleReplyAdded}
            placeholder={`Replying to @${comment.user}...`}
          />
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-3 mt-3 border-l border-white/15 pl-3 space-y-2">
          {comment.replies.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              documentId={documentId}
              onCommentAdded={onCommentAdded}
              highlightCommentId={highlightCommentId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem;
