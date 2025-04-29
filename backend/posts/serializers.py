from rest_framework import serializers
from .models import Place


class PlaceSerializer(serializers.ModelSerializer):
    author = serializers.SlugRelatedField(read_only=True, slug_field="username")
    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = (
            "id",
            "author",
            "name",
            "description",
            "created_at",
            "thumbnail_url",
            "rating",
        )

    def get_thumbnail_url(self, place):
        thumbnail = place.get_thumbnail()
        if thumbnail and thumbnail.image:
            request = self.context.get("request")
            return request.build_absolute_uri(thumbnail.image.url)
        return None

    def validate_rating(self, value):
        if value is None:
            return value
        if not (0.0 <= value <= 5.0):
            raise serializers.ValidationError("Rating must be between 0.0 and 5.0")
        if value * 2 % 1 != 0:
            raise serializers.ValidationError("Rating must be in increments of .5")
        return value


class PlaceGeoJSONSerializer(serializers.ModelSerializer):
    geometry = serializers.SerializerMethodField()
    properties = serializers.SerializerMethodField()
    id = serializers.IntegerField(source="pk")

    class Meta:
        model = Place
        fields = ["id", "type", "geometry", "properties"]
        extra_kwargs = {"type": {"default": "Feature"}}

    def get_geometry(self, obj):
        return {"type": "Point", "coordinates": [obj.longitude, obj.latitude]}

    def get_properties(self, obj):
        return {
            "name": obj.name,
            "subtitle": obj.subtitle,
            # 'thumbnail_url': xxx,
            # 'rating': obj.rating
        }
