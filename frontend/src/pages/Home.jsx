import { useState, useEffect } from 'react';
import api from '../api';
import Post from '../components/Post';
import '../styles/Home.css';

function Home() {
  const [posts, setPosts] = useState([]);
  const [body, setBody] = useState('');
  const [title, setTitle] = useState('');

  useEffect(() => {
    getPosts();
  }, []);

  const getPosts = () => {
    api
      .get('/api/v1/')
      .then((res) => res.data)
      .then((data) => {
        setPosts(data);
      })
      .catch((err) => alert(err));
  };

  const deletePost = (id) => {
    api
      .delete(`/api/v1/${id}/`)
      .then((res) => {
        if (res.status === 204) alert('Post deleted!');
        else alert('Failed to delete post.');
        getPosts();
      })
      .catch((error) => alert(error));
  };

  const createPost = (e) => {
    e.preventDefault();
    api
      .post('/api/v1/', { body, title })
      .then((res) => {
        if (res.status === 201) alert('Post created!');
        else alert('Failed to make post');
        getPosts();
      })
      .catch((err) => alert(err));
  };

  return (
    <div>
      <div>
        <h2>Posts</h2>
        {posts.map((post) => (
          <Post post={post} onDelete={deletePost} key={post.id} />
        ))}
      </div>
      <h2> Create a Post</h2>
      <form onSubmit={createPost}>
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
