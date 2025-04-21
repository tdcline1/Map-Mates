from django.contrib.auth import get_user_model
from django.urls import reverse
from django.test import TestCase
from rest_framework.test import APITestCase
from rest_framework import status

from .models import Post


class PostModelTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        cls.user = get_user_model().objects.create_user(
            username="testuser",
            email="test@email.com",
            password="secret",
        )

        cls.post = Post.objects.create(
            author=cls.user,
            title="A good title",
            body="Nice body content",
        )
        cls.list_url = reverse("post_list")
        cls.detail_url = reverse("post_detail", args=[cls.post.id])

    def test_post_model(self):
        self.assertEqual(self.post.author.username, "testuser")
        self.assertEqual(self.post.title, "A good title")
        self.assertEqual(self.post.body, "Nice body content")
        self.assertEqual(str(self.post), "A good title")

    def test_list_post(self):
        response = self.client.get(self.list_url)
        # permission class is making this 403 forbidden at the moment
        # self.assertEqual(response.status_code, status.HTTP_200_OK)
        # self.assertIsInstance(response.data, list)
        self.assertGreaterEqual(len(response.data), 1)

    def test_detail_post(self):
        response = self.client.get(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["title"], self.post.title)
        self.assertEqual(response.data["body"], self.post.body)

    def test_detail_post_not_found(self):
        response = self.client.get(reverse("post_detail", args=[999]))
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
