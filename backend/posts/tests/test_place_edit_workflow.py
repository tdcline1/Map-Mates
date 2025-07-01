import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
import factory

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
    rating = factory.Faker(
        "pydecimal", left_digits=1, right_digits=1, min_value=0, max_value=5
    )
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
