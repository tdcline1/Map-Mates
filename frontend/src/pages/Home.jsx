import { useState, useEffect } from 'react';
import api from '../api';

function Home() {
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    getNotes();
  }, []);

  const getNotes = () => {
    api
      .get('/api/v1/')
      .then((res) => res.data)
      .then((data) => {
        setNotes(data);
      })
      .catch((err) => alert(err));
  };

  const deleteNote = (id) => {
    api
      .delete(`/api/v1/${id}`)
      .then((res) => {
        if (res.status === 204) alert('Post deleted!');
        else alert('Failed to delete post.');
        getNotes();
      })
      .catch((error) => alert(error));
  };

  const createNote = (e) => {
    e.preventDefault();
    api
      .post('/api/v1/', { body, title })
      .then((res) => {
        if (res.status === 201) alert('Post created!');
        else alert('Failed to make post');
        getNotes();
      })
      .catch((err) => alert(err));
  };

  return (
    <div>
      <div>
        <h2>Posts</h2>
      </div>
      <h2> Create a Post</h2>
      <form onSubmit={createNote}>
        <label htmlFor="title">Title:</label>
        <br />
        <input
          type="text"
          id="title"
          name="title"
          required
          onChange={(e) => setTitle(e.target.value)}
          value={title}
        />
        <label htmlFor="body">Body:</label>
        <br />
        <textarea
          id="body"
          name="body"
          required
          onChange={(e) => setBody(e.target.value)}
          value={body}
        ></textarea>
        <br />
        <input type="submit" value="Submit"></input>
      </form>
    </div>
  );
}

export default Home;
