import { useState, useEffect } from 'react';
import api from '../api';
import Place from '../components/Place';
import '../styles/Home.css';

function Places() {
  const [places, setPlaces] = useState([]);
  const [description, setDescription] = useState('');
  const [name, setName] = useState('');

  useEffect(() => {
    getPlaces();
  }, []);

  const getPlaces = () => {
    api
      .get('/api/v1/')
      .then((res) => res.data)
      .then((data) => {
        setPlaces(data);
      })
      .catch((err) => alert(err));
  };

  const removePlace = (id) => {
    api
      .delete(`/api/v1/${id}/`)
      .then((res) => {
        if (res.status === 204) alert('Place deleted!');
        else alert('Failed to delete place.');
        getPlaces();
      })
      .catch((error) => alert(error));
  };

  const addPlace = (e) => {
    e.preventDefault();
    api
      .post('/api/v1/', { description, name })
      .then((res) => {
        if (res.status === 201) alert('Place added!');
        else alert('Failed to add place');
        getPlaces();
      })
      .catch((err) => alert(err));
  };

  return (
    <div>
      <div>
        <h2>Places</h2>
        {places.map((place) => (
          <Place place={place} onDelete={removePlace} key={place.id} />
        ))}
      </div>
      <h2> Add a Place</h2>
      <form onSubmit={addPlace}>
        <label htmlFor="name">Name:</label>
        <br />
        <input
          type="text"
          id="name"
          name="name"
          required
          onChange={(e) => setName(e.target.value)}
          value={name}
        />
        <label htmlFor="description">Description:</label>
        <br />
        <textarea
          id="description"
          name="description"
          required
          onChange={(e) => setDescription(e.target.value)}
          value={description}
        ></textarea>
        <br />
        <input type="submit" value="Submit"></input>
      </form>
    </div>
  );
}

export default Places;
