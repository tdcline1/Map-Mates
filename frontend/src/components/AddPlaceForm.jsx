import { useState } from 'react';
import { Rating } from 'react-simple-star-rating';

const AddPlaceForm = ({ coordinates }) => {
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

  const handleSubmit = (event) => {
    event.preventDefault();
    alert(inputs);
  };

  return (
    <form action={handleSubmit}>
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
        <select value={inputs.category} name="category" onChange={handleChange}>
          <option value="nature">Nature/hiking</option>
          <option value="city">City/culture</option>
          <option value="other">other</option>
        </select>
      </label>
      <p>Category: </p>
      {categories.map((cat) => (
        <button key={cat} type="button" onClick={handleChange}>
          {cat}
        </button>
      ))}
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
      <button type="submit">Send</button>
    </form>
  );
};

export default AddPlaceForm;
