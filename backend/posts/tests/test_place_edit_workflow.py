# Running Tests
# - All tests: `pytest`
# - Place edit tests: `pytest posts/tests/test_place_edit_workflow.py -v`
# - With coverage: `pytest --cov=posts --cov-report=html`
# - Specific test: `pytest posts/tests/test_place_edit_workflow.py::TestPlaceEditWorkflow::test_edit_place_basic_fields_success -v`

from io import BytesIO

import factory
import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from PIL import Image as PillowImage
from posts.models import Place, PlaceImage
from rest_framework import status
from rest_framework.test import APIClient

User = get_user_model()


class UserFactory(factory.django.DjangoModelFactory):
    """Factory Boy factory class for creating User instances"""

    class Meta:
        model = User

    username = factory.Sequence(lambda n: f"testuser{n}")
    email = factory.LazyAttribute(lambda obj: f"{obj.username}@example.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")


class PlaceFactory(factory.django.DjangoModelFactory):
    """Factory for creating Place instances"""

    class Meta:
        model = Place

    name = factory.Faker("city")
    subtitle = factory.Faker("sentence", nb_words=4)
    description = factory.Faker("text", max_nb_chars=200)
    longitude = factory.Faker("longitude")
    latitude = factory.Faker("latitude")
    category = factory.Iterator(["nature", "city", "other"])
    rating = factory.Faker("random_element", elements=[i * 0.5 for i in range(11)])
    author = factory.SubFactory(UserFactory)


class PlaceImageFactory(factory.django.DjangoModelFactory):
    """Factory for creating PlaceImage instances"""

    class Meta:
        model = PlaceImage

    place = factory.SubFactory(PlaceFactory)
    caption = factory.Faker("sentence", nb_words=3)
    is_thumbnail = False
    order = factory.Sequence(lambda n: n)

    # @factory.lazy_attribute generates a field(using logic, not a simple data type) when calling the factory
    @factory.lazy_attribute
    def image(self):
        """Create a simple test image"""
        image = PillowImage.new("RGB", (100, 100), color="red")
        # Save image to an in-memory file (BytesIO)
        temp_file = BytesIO()
        image.save(temp_file, format="JPEG")
        temp_file.seek(0)
        # Return a Django SimpleUploadedFile instance(mimics a file upload)
        return SimpleUploadedFile(
            name="test_image.jpg", content=temp_file.read(), content_type="image/jpeg"
        )


# Pytest blocks tests from touching database unless explicitly marked @pytest.mark.django_db
@pytest.mark.django_db
class TestPlaceEditWorkflow:
    """Comprehensive tests for the Place edit workflow"""

    def setup_method(self):
        """Set up test data before each test method"""
        # REST Framework APIClient simulates browser/frontend making requests to views
        self.client = APIClient()
        self.user = UserFactory()
        self.other_user = UserFactory()
        self.place = PlaceFactory(author=self.user)
        self.client.force_authenticate(user=self.user)

    def create_test_image_file(self, name="test.jpg", size=(100, 100), color="red"):
        """Helper method to create test image files"""
        image = PillowImage.new("RGB", size, color=color)
        temp_file = BytesIO()
        image.save(temp_file, format="JPEG")
        temp_file.seek(0)
        return SimpleUploadedFile(
            name=name, content=temp_file.read(), content_type="image/jpeg"
        )

    def test_edit_place_basic_fields_success(self):
        """Test successful editing of basic place fields"""
        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {
            "name": "Updated Place Name",
            "subtitle": "Updated subtitle",
            "description": "Updated description",
            "longitude": -122.4194,
            "latitude": 37.7749,
            "category": "city",
            "rating": 4.5,
        }

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_200_OK
        assert response.data["name"] == data["name"]

        self.place.refresh_from_db()
        assert self.place.name == "Updated Place Name"
        assert self.place.subtitle == "Updated subtitle"
        assert self.place.description == "Updated description"
        assert float(self.place.longitude) == -122.4194
        assert float(self.place.latitude) == 37.7749
        assert self.place.category == "city"
        assert float(self.place.rating) == 4.5

    def test_edit_place_add_new_images(self):
        """Test adding new images to existing place"""
        url = reverse("place_detail", kwargs={"pk": self.place.id})

        image1 = self.create_test_image_file("new_image1.jpg")
        image2 = self.create_test_image_file("new_image2.jpg")

        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
            "images_files": [image1, image2],
            "images_captions": ["Caption 1", "Caption 2"],
            "images_thumbnails": ["true", "false"],
        }

        response = self.client.put(url, data, format="multipart")
        # print(response.status_code, response.data)

        assert response.status_code == status.HTTP_200_OK
        assert self.place.images.count() == 2

        # Check image metadata
        thumbnail_image = self.place.images.filter(is_thumbnail=True).first()
        assert thumbnail_image is not None
        assert thumbnail_image.caption == "Caption 1"
        non_thumbnail = self.place.images.filter(is_thumbnail=False).first()
        assert non_thumbnail.caption == "Caption 2"

    def test_edit_place_update_existing_images(self):
        """Test updating existing images metadata"""
        image1 = PlaceImageFactory(
            place=self.place, caption="Original Caption 1", is_thumbnail=True
        )
        image2 = PlaceImageFactory(
            place=self.place, caption="Original Caption 2", is_thumbnail=False
        )

        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
            "existing_images_ids": [str(image1.id), str(image2.id)],
            "existing_images_captions": ["Updated Caption 1", "Updated Caption 2"],
            "existing_images_thumbnails": ["false", "true"],
        }

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_200_OK

        image1.refresh_from_db()
        image2.refresh_from_db()

        assert image1.caption == "Updated Caption 1"
        assert image1.is_thumbnail == False
        assert image2.caption == "Updated Caption 2"
        assert image2.is_thumbnail == True

    def test_edit_place_delete_existing_images(self):
        """Test deleting existing images from place"""
        image1 = PlaceImageFactory(place=self.place)
        image2 = PlaceImageFactory(place=self.place)
        image3 = PlaceImageFactory(place=self.place)

        initial_count = self.place.images.count()
        assert initial_count == 3

        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
            "images_to_delete": [str(image1.id), str(image2.id)],
            "existing_images_ids": [str(image3.id)],
            "existing_images_captions": [image3.caption],
            "existing_images_thumbnails": ["true"],
        }

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_200_OK
        assert self.place.images.count() == 1
        assert self.place.images.first().id == image3.id

    def test_edit_place_mixed_operations(self):
        """Test Place edit operation that includes add, update, and delete images"""
        existing_image_to_keep = PlaceImageFactory(
            place=self.place, caption="Keep me", is_thumbnail=True
        )
        existing_image_to_delete = PlaceImageFactory(
            place=self.place, caption="Delete me"
        )

        new_image = self.create_test_image_file("brand_new.jpg")

        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {
            "name": "Complex Update",
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": "nature",
            "rating": 3.5,
            # Keep and update existing_image1
            "existing_images_ids": [str(existing_image_to_keep.id)],
            "existing_images_captions": ["Updated kept image"],
            "existing_images_thumbnails": ["false"],
            # Delete existing_image2
            "images_to_delete": [str(existing_image_to_delete.id)],
            # Add new image
            "images_files": [new_image],
            "images_captions": ["New image caption"],
            "images_thumbnails": ["true"],
        }

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_200_OK

        self.place.refresh_from_db()
        assert self.place.name == "Complex Update"
        assert self.place.category == "nature"
        assert float(self.place.rating) == 3.5

        assert self.place.images.count() == 2

        existing_image_to_keep.refresh_from_db()
        assert existing_image_to_keep.caption == "Updated kept image"
        assert existing_image_to_keep.is_thumbnail == False

        assert not PlaceImage.objects.filter(id=existing_image_to_delete.id).exists()

        new_image_obj = self.place.images.filter(is_thumbnail=True).first()
        assert new_image_obj is not None
        assert new_image_obj.caption == "New image caption"

    def test_edit_place_mismatched_image_data_error(self):
        """Test error when image files, captions, and thumbnails don't match"""
        url = reverse("place_detail", kwargs={"pk": self.place.id})

        image1 = self.create_test_image_file("test1.jpg")

        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
            "images_files": [image1],
            "images_captions": [
                "Caption 1",
                "Caption 2",
            ],  # Mismatch: 2 captions for 1 file
            "images_thumbnails": ["true"],
        }

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "Mismatched number" in response.data["error"]

    def test_edit_place_invalid_existing_image_id(self):
        """Test handling of invalid existing image IDs"""
        url = reverse("place_detail", kwargs={"pk": self.place.id})

        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
            "existing_images_ids": ["999999"],  # Non-existent ID
            "existing_images_captions": ["Some caption"],
            "existing_images_thumbnails": ["true"],
        }

        response = self.client.put(url, data, format="multipart")

        # Should succeed but ignore invalid ID (as per DoesNotExist handling)
        assert response.status_code == status.HTTP_200_OK
        assert self.place.images.count() == 0

    def test_edit_place_unauthorized_user(self):
        """Test that users cannot edit other user's places"""
        self.client.force_authenticate(user=self.other_user)

        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {
            "name": "Unauthorized Edit",
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
        }

        response = self.client.put(url, data, format="multipart")
        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert self.place.name != data["name"]

    def test_edit_place_unauthenticated_user(self):
        """Test that unauthenticated users cannot edit places"""
        self.client.force_authenticate(user=None)

        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {"name": "Unauthenticated Edit"}

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_edit_place_invalid_rating(self):
        """Test rating validation"""
        url = reverse("place_detail", kwargs={"pk": self.place.id})

        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": 6.0,
        }

        response = self.client.put(url, data, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "rating" in response.data  # Ensure error is about rating

    def test_edit_place_invalid_coordinates(self):
        """Test validation for longitude/latitude"""
        url = reverse("place_detail", kwargs={"pk": self.place.id})

        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": 200.0,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
        }

        response = self.client.put(url, data, format="multipart")
        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert "longitude" in response.data

    def test_edit_place_thumbnail_uniqueness(self):
        """Test that only one image can be marked as thumbnail"""
        image1 = PlaceImageFactory(place=self.place, is_thumbnail=True)
        image2 = PlaceImageFactory(place=self.place, is_thumbnail=False)

        new_image = self.create_test_image_file("new_thumbnail.jpg")

        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {
            "name": self.place.name,
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": self.place.category,
            "rating": self.place.rating,
            "existing_images_ids": [str(image1.id), str(image2.id)],
            "existing_images_captions": [image1.caption, image2.caption],
            "existing_images_thumbnails": [
                "true",
                "false",
            ],
            "images_files": [new_image],
            "images_captions": ["New thumbnail"],
            "images_thumbnails": ["true"],
        }

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_200_OK

        thumbnail_count = self.place.images.filter(is_thumbnail=True).count()
        assert thumbnail_count == 1
        thumbnail_image = self.place.images.filter(is_thumbnail=True).first()
        assert thumbnail_image.caption == "New thumbnail"

    def test_edit_place_response_structure(self):
        """Test full response structure after editing, adding and updating images"""
        existing_image_to_keep = PlaceImageFactory(
            place=self.place,
            caption="Keep me",
            is_thumbnail=False,
        )
        existing_image_to_delete = PlaceImageFactory(
            place=self.place,
            caption="Delete me",
            is_thumbnail=False,
        )
        new_image = self.create_test_image_file("new_image.jpg")

        url = reverse("place_detail", kwargs={"pk": self.place.id})
        data = {
            "name": "Full Update",
            "subtitle": self.place.subtitle,
            "description": self.place.description,
            "longitude": self.place.longitude,
            "latitude": self.place.latitude,
            "category": "nature",
            "rating": 3.5,
            "existing_images_ids": [str(existing_image_to_keep.id)],
            "existing_images_captions": ["Updated caption"],
            "existing_images_thumbnails": ["false"],
            "images_to_delete": [str(existing_image_to_delete.id)],
            "images_files": [new_image],
            "images_captions": ["Brand new image"],
            "images_thumbnails": ["true"],
        }

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_200_OK

        response_data = response.data
        expected_fields = [
            "id",
            "name",
            "subtitle",
            "description",
            "longitude",
            "latitude",
            "category",
            "author",
            "rating",
            "images",
            "is_owner",
        ]

        for field in expected_fields:
            assert field in response_data, f"Missing field: {field}"

        assert response_data["name"] == "Full Update"
        assert response_data["author"] == self.user.username
        assert response_data["is_owner"] == True
        assert response_data["rating"] == 3.5

        images = response_data["images"]
        assert isinstance(images, list)
        assert len(images) == 2

        captions = [img["caption"] for img in images]
        assert "Updated caption" in captions
        assert "Brand new image" in captions
        assert "Delete me" not in captions

        thumbnail_images = [img for img in images if img["is_thumbnail"]]
        assert len(thumbnail_images) == 1
        assert thumbnail_images[0]["caption"] == "Brand new image"

    def test_edit_place_nonexistent_place(self):
        """Test that editing a non-existent place returns 404"""
        non_existent_id = 999999
        url = reverse("place_detail", kwargs={"pk": non_existent_id})
        data = {"name": "Non-existent Place"}

        response = self.client.put(url, data, format="multipart")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert str(response.data["detail"]) == "No Place matches the given query."
