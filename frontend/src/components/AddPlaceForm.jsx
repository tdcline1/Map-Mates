import { useState } from 'react';
import { Rating } from 'react-simple-star-rating';
import api from '../api';
import '../styles/AddPlaceForm.css';

const AddPlaceForm = ({
  coordinates,
  onClose,
  fetchPlaces,
  placeToEdit = null,
}) => {
  const [inputs, setInputs] = useState({
    longitude: coordinates.longitude || 0,
    latitude: coordinates.latitude || 0,
    name: '',
    subtitle: '',
    description: '',
    category: 'city',
    rating: 0,
  });
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [imagesToDelete, setImagesToDelete] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const categories = ['nature', 'city', 'other'];

  useEffect(() => {
    if (placeToEdit) {
      setIsEditMode(true);
      setInputs({
        longitude: placeToEdit.longitude,
        latitude: placeToEdit.latitude,
        name: placeToEdit.name,
        subtitle: placeToEdit.subtitle,
        description: placeToEdit.description,
        category: placeToEdit.category || 'city',
        rating: placeToEdit.rating || 0,
      });

      if (placeToEdit.images && placeToEdit.images.length > 0) {
        setExistingImages(placeToEdit.images);
      }
    }
  }, [placeToEdit]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs((values) => ({ ...values, [name]: value }));
  };

  const handleRating = (rate) => {
    setInputs((values) => ({ ...values, rating: rate }));
  };

  const addImage = () => {
    const is_first =
      images.length === 0 && existingImages.length === 0 ? true : false;
    if (images.length + existingImages.length >= 10) {
      alert('Maximum 10 images allowed.');
      return;
    }
    setImages([
      ...images,
      { file: null, caption: '', preview: null, is_thumbnail: is_first },
    ]);
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const removeExistingImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExisitngImages(...existingImages.filter((img) => img.id !== imageId));
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

      if (value) {
        setExistingImages(
          existingImages.map((img) => ({
            ...img,
            is_thumbnail: false,
          }))
        );
      }
    }
    setImages(newImages);
  };

  const handleExistingImageChange = (id, field, value) => {
    if (field === 'is_thumbnail' && value) {
      setExistingImages(
        existingImages.map((img) => ({
          ...img,
          is_thumbnail: img.id === id ? value : false,
        }))
      );

      setImages(
        images.map((img) => ({
          ...img,
          is_thumbnail: false,
        }))
      );
    } else {
      setExistingImages(
        existingImages.map((img) =>
          img.id === id ? { ...img, [field]: value } : img
        )
      );
    }
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
    images.forEach((image) => {
      if (image.file) {
        formData.append('images_files', image.file);
        formData.append('images_captions', image.caption || '');
        formData.append('images_thumbnails', image.is_thumbnail);
      }
    });

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
              required
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
              required
              value={inputs.subtitle}
              onChange={handleChange}
              placeholder="ex: Time machine to the Renaissance!"
            />
          </label>
          <label>
            Full Description:
            <textarea
              name="description"
              required
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
