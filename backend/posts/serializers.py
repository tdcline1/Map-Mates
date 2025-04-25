from rest_framework import serializers
from .models import Place


class PlaceSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(read_only=True, slug_field="username")
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = ("id", "author", "name", "description", "created_at", "thumbnail_url")

    def get_thumbnail_url(self, place):
        thumbnail = place.get_thumbnail()
        if thumbnail and thumbnail.image:
            request = self.context.get("request")
            return request.build_absolute_uri(thumbnail.image.url)
        return None
