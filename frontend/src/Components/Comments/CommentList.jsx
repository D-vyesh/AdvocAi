import React, { useState, useEffect, useCallback } from 'react';
import axios from '../../api/axios';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';
import { useLocation } from 'react-router-dom';

const CommentList = ({ documentId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const [highlightCommentId, setHighlightCommentId] = useState(null);

  const fetchComments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/documents/${documentId}/comments/`);
      setComments(response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments.');
    } finally {
      setLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchComments();

    const queryParams = new URLSearchParams(location.search);
    const commentIdFromUrl = queryParams.get('comment');
    if (commentIdFromUrl) {
      setHighlightCommentId(commentIdFromUrl);
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const accessToken = localStorage.getItem('access_token');
    let wsUrl = `${protocol}//${window.location.hostname}:8000/ws/document/${documentId}/`;
    if (accessToken) {
      wsUrl += `?token=${accessToken}`;
    }
    const newWs = new WebSocket(wsUrl);

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_comment') {
        setComments((prevComments) => {
          if (!prevComments.some(c => c.id === data.comment.id)) {
            return [...prevComments, data.comment];
          }
          return prevComments;
        });
      }
    };

    return () => {
      newWs.close();
    };
  }, [documentId, fetchComments, location.search]);

  if (!documentId) {
    return (
      <div className="text-center py-6 text-xs text-slate-400 glass-subtle rounded-2xl p-4">
        Save the document to enable live comments.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-6 text-xs text-slate-300">
        Loading comments...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-xs text-rose-400 glass-subtle rounded-2xl p-3">
        {error}
      </div>
    );
  }

  return (
    <div className="comment-section space-y-4">
      <CommentForm documentId={documentId} onCommentAdded={fetchComments} />
      <div className="comments-list mt-4 overflow-y-auto custom-scrollbar space-y-2">
        {comments.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6 glass-subtle rounded-2xl">
            No comments yet. Start the discussion above!
          </p>
        ) : (
          comments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              documentId={documentId}
              onCommentAdded={fetchComments}
              highlightCommentId={highlightCommentId}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default CommentList;
