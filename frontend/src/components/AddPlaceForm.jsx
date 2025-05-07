import { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import api from '../api';
import '../styles/AddPlaceForm.css';

const AddPlaceForm = ({ coordinates, onClose }) => {
  const [inputs, setInputs] = useState({
    longitude: coordinates.longitude,
    latitude: coordinates.latitude,
  });
  const categories = ['nature', 'city', 'other'];

  const handleChange = (event) => {
    const name = event.target.name;
    const value = event.target.value;
    setInputs((values) => ({ ...values, [name]: value }));
    console.log(inputs);
  };

  const handleRating = (rate) => {
    setInputs((values) => ({ ...values, rating: rate }));
    console.log(inputs);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post('api/v1/', inputs)
      .then((res) => {
        if (res.status === 201) alert('Place added!');
        else alert('Failed to add place');
      })
      .catch((err) => alert(err));
    onClose();
  };

  return (
    <div className="form-overlay">
      <div className="add-place-form">
        <button className="close-button" onClick={onClose}>
          x
        </button>
        <form onSubmit={handleSubmit}>
          <label>
            Place Name:
            <input
              type="text"
              name="name"
              label="Place name:"
              value={inputs.name || ''}
              onChange={handleChange}
              placeholder="ex: New York City"
            />
          </label>
          <label>
            Adventure Subtitle:
            <input
              type="text"
              name="subtitle"
              value={inputs.subtitle || ''}
              onChange={handleChange}
              placeholder="ex: The city that never sleeps"
            />
          </label>
          <label>
            Full Description:
            <textarea
              name="description"
              value={inputs.description}
              onChange={handleChange}
              placeholder="Tell us what you did at this place!"
            />
          </label>
          <label>
            Category:{' '}
            <select
              value={inputs.category}
              name="category"
              onChange={handleChange}
            >
              <option value="nature">Nature/hiking</option>
              <option value="city">City/culture</option>
              <option value="other">other</option>
            </select>
          </label>
          <div className="form-row">
            <p>
              <strong>Category: </strong>
            </p>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                name="category"
                value={cat}
                className={
                  inputs.category === cat
                    ? 'customButton active'
                    : 'customButton'
                }
                onClick={handleChange}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="form-row">
            <label>
              Rating:{' '}
              <Rating
                onClick={handleRating}
                allowFraction
                showTooltip
                tooltipArray={[
                  'Terrible',
                  'Terrible+',
                  'Bad',
                  'Bad+',
                  'Average',
                  'Average+',
                  'Great',
                  'Great+',
                  'Awesome',
                  'Awesome+',
                ]}
                transition
              />
            </label>
          </div>
          <button type="submit">Send</button>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceForm;
