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

  const addImage = () => {
    if (images.length >= 10) {
      alert('Maximum 10 images allowed.');
      return;
    }
    setImages([
      ...images,
      { file: null, caption: '', preview: null, is_thumbnail: false },
    ]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
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
        preview: URL.createObjectURL(file),
      };
    } else if (field === 'caption') {
      newImages[index] = { ...newImages[index], caption: value };
    } else if (field === 'is_thumbnail') {
      newImages.forEach((img, i) => {
        img.is_thumbnail = i === index ? value : false;
      });
    }
    setImages(newImages);
    console.log(images);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    // This approach not taken to avoid iterating over inherited properties
    // for (let key in inputs) {
    //     formData.append(key, inputs[key])
    // }
    Object.keys(inputs).forEach((key) => {
      formData.append(key, inputs[key]);
    });
    images.forEach((image, index) => {
      if (image.file) {
        formData.append(`images[${index}][image]`, image.file);
        formData.append(`images[${index}][caption]`, image.caption || '');
        formData.append(`images[${index}][is_thumbnail]`, image.is_thumbnail);
      }
    });
    console.log(formData);

    try {
      const res = await api.post('api/v1/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.status === 201) {
        alert('Place added!');
        fetchPlaces();
        onClose();
      } else {
        alert('Failed to add place');
      }
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="form-overlay">
      <div className="add-place-form">
        <button className="close-button" onClick={onClose}>
          x
        </button>
        <h2 className="form-title">Share the Adventure!</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Place:
            <input
              type="text"
              name="name"
              value={inputs.name}
              onChange={handleChange}
              placeholder="ex: Florence, Italy"
            />
          </label>
          <label>
            Subtitle:
            <input
              type="text"
              name="subtitle"
              value={inputs.subtitle}
              onChange={handleChange}
              placeholder="ex: Time machine to the Renaissance!"
            />
          </label>
          <label>
            Full Description:
            <textarea
              name="description"
              value={inputs.description}
              onChange={handleChange}
              placeholder="Tell us what you liked most about this place!"
            />
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
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="form-row">
            <label>
              Rating:
              <Rating
                onClick={handleRating}
                allowFraction
                size="28"
                transition
              />
            </label>
          </div>
          <div className="image-section">
            <h3>Images</h3>
            {images.map((image, index) => (
              <div key={index} className="image-entry">
                <label>
                  Image {index + 1}:
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) =>
                      handleImageChange(index, 'file', e.target.files[0])
                    }
                  />
                </label>
                {image.preview && (
                  <img
                    src={image.preview}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
                <label>
                  Caption:
                  <input
                    type="text"
                    value={image.caption}
                    onChange={(e) =>
                      handleImageChange(index, 'caption', e.target.value)
                    }
                    placeholder="Image caption"
                    className="image-caption"
                  />
                </label>
                <div className="thumbnail-checkbox">
                  <label>
                    <input
                      type="checkbox"
                      checked={image.is_thumbnail}
                      onChange={(e) =>
                        handleImageChange(
                          index,
                          'is_thumbnail',
                          e.target.checked
                        )
                      }
                    />
                  </label>
                  <label htmlFor={`thumbnail-${index}`}>
                    <span>Set as Thumbnail</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="remove-image-button"
                >
                  Remove Image
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addImage}
              className="add-image-button"
            >
              Add Image
            </button>
          </div>
          <button type="submit" className="add-image-button">
            Send Adventure
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceForm;
