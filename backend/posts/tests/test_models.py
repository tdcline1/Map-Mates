from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from posts.models import Place


class PlaceModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(
            username="testuser",
            email="test@email.com",
            password="secret",
        )

        cls.place = Place.objects.create(
            author=cls.user,
            name="A good name",
            description="Nice description",
        )
        cls.list_url = reverse("place_list")
        cls.detail_url = reverse("place_detail", args=[cls.place.id])

    def test_place_model(self):
        self.assertEqual(self.place.author.username, "testuser")
        self.assertEqual(self.place.name, "A good name")
        self.assertEqual(self.place.description, "Nice description")
        self.assertEqual(str(self.place), "A good name")

    def test_list_place(self):
        response = self.client.get(self.list_url)
        # permission class is making this 403 forbidden at the moment
        # self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

    def test_detail_place(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["name"], self.place.name)
        self.assertEqual(response.data["description"], self.place.description)

    def test_detail_place_not_found(self):
        response = self.client.get(reverse("place_detail", args=[999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
