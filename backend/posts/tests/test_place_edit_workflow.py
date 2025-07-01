# Running Tests
# - All tests: `pytest`
# - Place edit tests: `pytest posts/tests/test_place_edit_workflow.py -v`
# - With coverage: `pytest --cov=posts --cov-report=html`
# - Specific test: `pytest posts/tests/test_place_edit_workflow.py::TestPlaceEditWorkflow::test_edit_place_basic_fields_success -v`

import pytest
from django.contrib.auth import get_user_model
from django.core.files.uploadedfile import SimpleUploadedFile
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
import factory
from io import BytesIO
from PIL import Image as PillowImage

from posts.models import Place

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
