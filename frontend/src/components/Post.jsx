import React from 'react';
import '../styles/Note.css';

function Post({ post, onDelete }) {
  const formattedDate = new Date(post.created_at).toLocaleDateString('en-US');
  return (
    <div className="note-container">
      <p className="note-title">{post.title}</p>
      <p className="note-content">{post.body}</p>
      <p className="note-date">{formattedDate}</p>
      <button className="delete-button" onClick={() => onDelete(post.id)}>
        Delete
      </button>
    </div>
  );
}

export default Post;
