import { useState, useEffect } from 'react';
import { Rating } from 'react-simple-star-rating';
import api from '../api';
import '../styles/AddPlaceForm.css';

/**
 * AddPlaceForm Component
 *
 * Modal form for adding new places or editing existing places.
 * Supports image uploads and metadata editing.
 */
const AddPlaceForm = ({
  coordinates,
  onClose,
  fetchPlaces,
  placeToEdit = null,
  onClosePopup,
}) => {
  const [inputs, setInputs] = useState({
    longitude: coordinates?.longitude || 0,
    latitude: coordinates?.latitude || 0,
    name: '',
    subtitle: '',
    description: '',
    category: 'city',
    rating: 0,
  });
  const [newImages, setNewImages] = useState([]);
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rate) => {
    setInputs((prev) => ({ ...prev, rating: rate }));
  };

  const addNewImage = () => {
    if (newImages.length + existingImages.length >= 10) {
      alert('Maximum 10 images allowed.');
      return;
    }

    const isFirstImage = newImages.length === 0 && existingImages.length === 0;
    setNewImages([
      ...newImages,
      { file: null, caption: '', preview: null, is_thumbnail: isFirstImage },
    ]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (imageId) => {
    setImagesToDelete([...imagesToDelete, imageId]);
    setExistingImages(existingImages.filter((img) => img.id !== imageId));
  };

  const updateNewImage = (index, field, value) => {
    const updatedImages = [...newImages];
    if (field === 'file') {
      const file = value;

      // Validate file type and size
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

      // Create preview URL
      updatedImages[index] = {
        ...updatedImages[index],
        file,
        preview: URL.createObjectURL(file),
      };
    } else if (field === 'caption') {
      updatedImages[index] = { ...updatedImages[index], caption: value };
    } else if (field === 'is_thumbnail') {
      // Clear other thumbnails
      updatedImages.forEach((img, i) => {
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
    setNewImages(updatedImages);
  };

  const updateExistingImage = (id, field, value) => {
    if (field === 'is_thumbnail' && value) {
      // Only one thumbnail allowed across all images
      setExistingImages(
        existingImages.map((img) => ({
          ...img,
          is_thumbnail: img.id === id ? value : false,
        }))
      );
      setNewImages(
        newImages.map((img) => ({
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

  /**
   * Handle form Submission
   * 1. Assemble FormData object
   * 2. Send FormData object to API via Post (new) or Put (edit)
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    // Assemble FormData object
    const formData = new FormData();

    Object.keys(inputs).forEach((key) => {
      formData.append(key, inputs[key]);
    });
    newImages.forEach((image) => {
      if (image.file) {
        formData.append('images_files', image.file);
        formData.append('images_captions', image.caption || '');
        formData.append('images_thumbnails', image.is_thumbnail);
      }
    });

    if (isEditMode) {
      existingImages.forEach((image) => {
        formData.append('existing_images_ids', image.id);
        formData.append('existing_images_captions', image.caption);
        formData.append('existing_images_thumbnails', image.is_thumbnail);
      });

      imagesToDelete.forEach((imageId) => {
        formData.append('images_to_delete', imageId);
      });
    }

    // Send FormData object to API via Post (new) or Put (edit)
    try {
      const endpoint = isEditMode ? `api/v1/${placeToEdit.id}/` : 'api/v1/';
      const method = isEditMode ? 'put' : 'post';
      const expectedStatus = isEditMode ? 200 : 201;

      const response = await api[method](endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (response.status === expectedStatus) {
        const message = isEditMode
          ? 'Place updated successfully!'
          : 'Place added!';
        alert(message);
        fetchPlaces();
        onClose();
        onClosePopup();
      } else {
        const errorMessage = isEditMode
          ? 'Failed to update Place'
          : 'Failed to add place';
        alert(errorMessage);
      }
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  return (
    <div className="form-overlay">
      <div className="add-place-form">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2 className="form-title">
          {isEditMode ? 'Edit Adventure' : 'Share the Adventure!'}
        </h2>
        <form onSubmit={handleSubmit}>
          {/* Basic place information */}
          <label>
            Place:
            <input
              type="text"
              name="name"
              required
              value={inputs.name}
              onChange={handleInputChange}
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
              onChange={handleInputChange}
              placeholder="ex: Time machine to the Renaissance!"
            />
          </label>
          <label>
            Full Description:
            <textarea
              name="description"
              required
              value={inputs.description}
              onChange={handleInputChange}
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
                onClick={handleInputChange}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
          <div className="form-row">
            <label>
              Rating:
              <Rating
                onClick={handleRatingChange}
                initialValue={inputs.rating}
                allowFraction
                size="28"
                transition
              />
            </label>
          </div>

          {/* Existing Images section (Edit Mode Only) */}
          {isEditMode && existingImages.length > 0 && (
            <div className="image-section">
              <h3>Existing Images</h3>
              {existingImages
                .filter((img) => !imagesToDelete.includes(img.id))
                .map((image) => (
                  <div key={image.id} className="image-entry">
                    <img
                      src={image.url}
                      alt={image.caption || 'Place image'}
                      className="image-preview"
                    />
                    <label>
                      Caption:
                      <input
                        type="text"
                        value={image.caption || ''}
                        onChange={(e) =>
                          updateExistingImage(
                            image.id,
                            'caption',
                            e.target.value
                          )
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
                            updateExistingImage(
                              image.id,
                              'is_thumbnail',
                              e.target.checked
                            )
                          }
                        />
                        <span>Set as Thumbnail</span>
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingImage(image.id)}
                      className="remove-image-button"
                    >
                      Remove Image
                    </button>
                  </div>
                ))}
            </div>
          )}

          {/* New Images Section */}
          <div className="image-section">
            <h3>{isEditMode ? 'Add New Images' : 'Images'}</h3>
            {newImages.map((image, index) => (
              <div key={index} className="image-entry">
                <label>
                  Image {index + 1}:
                  <input
                    type="file"
                    accept="image/jpeg,image/jpg,image/png"
                    onChange={(e) =>
                      updateNewImage(index, 'file', e.target.files[0])
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
                      updateNewImage(index, 'caption', e.target.value)
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
                        updateNewImage(index, 'is_thumbnail', e.target.checked)
                      }
                    />
                    <span>Set as Thumbnail</span>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => removeNewImage(index)}
                  className="remove-image-button"
                >
                  Remove Image
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addNewImage}
              className="add-image-button"
            >
              Add Image
            </button>
          </div>
          <button type="submit" className="add-image-button">
            {isEditMode ? 'Confirm Edits' : 'Send Adventure'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddPlaceForm;
