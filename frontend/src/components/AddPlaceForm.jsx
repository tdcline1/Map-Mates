import { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import api from '../api';
import '../styles/AddPlaceForm.css';

const AddPlaceForm = ({ coordinates, onClose, fetchPlaces }) => {
  const [inputs, setInputs] = useState({
    longitude: coordinates.longitude,
    latitude: coordinates.latitude,
    name: '',
    subtitle: '',
    description: '',
    category: 'city',
    rating: 0,
  });
  const [images, setImages] = useState([]);
  const categories = ['nature', 'city', 'other'];

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleRating = (rate) => {
    setInputs((values) => ({ ...values, rating: rate }));
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...images];
    if (field === 'file') {
      const file = value;
      if (
        file &&
        !['image/jpeg', 'image/jpg', 'image/png'].includes(file.type)
      ) {
        alert('Only JPG, JPEG, or PNG files are allowed.');
        return;
      }
      if (file && file.size > 5 * 1024 * 1024) {
        alert('Image size should not exceed 5mb.');
        return;
      }
      newImages[index] = {
        ...newImages[index],
        file,
        preview: URL.createdObjectURL(file),
      };
    } else if (field === 'caption') {
      newImages[index] = { ...newImages[index], caption: value };
    } else if (field === 'is_thumbnail') {
      newImages.forEach((img, i) => {
        img.is_thumbnail = i === index ? value : false;
      });
    }
    setImages(newImages);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    api
      .post('api/v1/', inputs)
      .then((res) => {
        if (res.status === 201) {
          alert('Place added!');
          fetchPlaces();
        } else alert('Failed to add place');
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
              value={inputs.name}
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
            <label>
              Pictures:
              <input
                type="file"
                name="images"
                multiple
                value={inputs.images}
                onChange={handleChange}
              />
            </label>
          </div>
          <button type="submit">Send Adventure</button>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceForm;
