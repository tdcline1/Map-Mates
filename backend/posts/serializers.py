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
    type = serializers.CharField(default="Feature", read_only=True)

    class Meta:
        model = Place
        fields = ["id", "type", "geometry", "properties"]

    def get_geometry(self, place):
        return {"type": "Point", "coordinates": [place.longitude, place.latitude]}

    def get_properties(self, place):
        thumbnail = place.get_thumbnail()
        thumbnail_url = None
        if thumbnail and thumbnail.image:
            # access the request object provided by the view in the context dict so that we can build absolute url... Frontend will not be able to access relative url provided by thumbnail.image.url as backend and frontend are on separate domains
            request = self.context.get("request")
            thumbnail_url = request.build_absolute_uri(thumbnail.image.url)
        return {
            "name": place.name,
            "subtitle": place.subtitle,
            "category": place.category,
            "thumbnail_url": thumbnail_url,
            "rating": place.rating,
        }
