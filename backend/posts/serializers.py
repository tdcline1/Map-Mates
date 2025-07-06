from rest_framework import serializers

from .models import Place, PlaceImage


class PlaceImageSerializer(serializers.ModelSerializer):
    """
    Serializer for the PlaceImage model.

    Handles the creation, update, and representation of images associated with a
    Place. Includes fields for image (file) upload, URL for frontend access,
    captioning, and thumbnail designation.
    """

    image = serializers.ImageField(write_only=True)
    url = serializers.ImageField(source="image", read_only=True)
    caption = serializers.CharField(max_length=100, required=False, allow_blank=True)
    is_thumbnail = serializers.BooleanField(default=False)

    class Meta:
        model = PlaceImage
        fields = ["id", "image", "url", "caption", "is_thumbnail"]


class PlaceDetailSerializer(serializers.ModelSerializer):
    images = PlaceImageSerializer(many=True, required=False)
    author = serializers.CharField(source="author.username", read_only=True)
    rating = serializers.FloatField(min_value=0, max_value=5)
    is_owner = serializers.SerializerMethodField()

    class Meta:
        model = Place
        fields = (
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
        )

    def create(self, validated_data):
        """
        Creates a Place instance and associated PlaceImage instances

        Args:
            validated_data (dict): A dictionary of validated data from the serializer.
                                    It should contain fields for the Place model
                                    and a list of dictionaries under the 'images key
                                    for creating PlaceImage objects.
        Returns:
            place: The newly created Place instance.
        """
        images_data = validated_data.pop("images", [])
        place = Place.objects.create(**validated_data)
        for image_data in images_data:
            PlaceImage.objects.create(place=place, **image_data)
        return place

    def get_is_owner(self, obj):
        request = self.context.get("request")
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user

    # not sure this is needed... see when i implement creation
    def validate_rating(self, value):
        if value is None:
            return value
        if not (0.0 <= value <= 5.0):
            raise serializers.ValidationError("Rating must be between 0.0 and 5.0")
        if value * 2 % 1 != 0:
            raise serializers.ValidationError("Rating must be in increments of .5")
        return value


class PlaceGeoJSONSerializer(serializers.ModelSerializer):
    """
    Serializer for the Place model. Formats the output as a GeoJSON Feature
    for map display.

    This serializer transforms Place model instances into GeoJSON Feature
    objects, including geometry (Point based on longitude and latitude) and
    properties such as name, subtitle, category, thumbnail URL, and rating.

    This format, as supplemented by its associated view, ensures the data is
    structured as expected by the Mapbox API.
    """

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
