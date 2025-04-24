from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Place


class PlaceSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(read_only=True, slug_field="username")

    class Meta:
        model = Place
        fields = ("id", "author", "name", "description", "created_at")
