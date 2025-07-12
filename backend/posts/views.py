from rest_framework import generics, status
from rest_framework.response import Response

from .models import Place, PlaceImage
from .permissions import IsAuthorOrReadOnly
from .serializers import PlaceDetailSerializer, PlaceGeoJSONSerializer


class PlaceList(generics.ListCreateAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceDetailSerializer

    def create(self, request, *args, **kwargs):
        serializer_data = {
            "name": request.data.get("name"),
            "subtitle": request.data.get("subtitle"),
            "description": request.data.get("description"),
            "longitude": request.data.get("longitude"),
            "latitude": request.data.get("latitude"),
            "category": request.data.get("category"),
            "rating": request.data.get("rating"),
        }

        image_files = request.FILES.getlist("images_files")
        image_captions = request.data.getlist("images_captions")
        image_thumbnails = request.data.getlist("images_thumbnails")

        if image_files and not (
            len(image_files) == len(image_captions) == len(image_thumbnails)
        ):
            return Response(
                {"error": "Mismatched number of image files, captions, and thumbnails"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        images_data = (
            [
                {
                    "image": image_files[i],
                    "caption": image_captions[i],
                    "is_thumbnail": image_thumbnails[i] == "true",
                }
                for i in range(len(image_files))
            ]
            if image_files
            else []
        )

        serializer_data["images"] = images_data
        serializer = self.get_serializer(data=serializer_data)

        if serializer.is_valid():
            self.perform_create(serializer)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class PlaceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    API endpoint for retrieving, updating, and deleting Place instances.

    Handles complex image management including:
    - Updating existing image metadata
    - Adding new images with file uploads
    - Deleting specified images
    - Maintaining thumbnail relationships

    Optimized with select_related and prefetch_related to minimize database queries.
    """

    queryset = Place.objects.select_related("author").prefetch_related("images")
    serializer_class = PlaceDetailSerializer
    permission_classes = [IsAuthorOrReadOnly]

    def update(self, request, *args, **kwargs):
        """
        Custom update method handling complex image operations.

        Processes three types of image operations in a single transaction:
        1. Updates metadata for existing images
        2. Creates new images from uploaded files
        3. Deletes specified images

        Uses parallel arrays from FormData to associate files with metadata.
        """
        instance = self.get_object()

        # Place metadata
        serializer_data = {
            "name": request.data.get("name"),
            "subtitle": request.data.get("subtitle"),
            "description": request.data.get("description"),
            "longitude": request.data.get("longitude"),
            "latitude": request.data.get("latitude"),
            "category": request.data.get("category"),
            "rating": request.data.get("rating"),
        }

        # Existing Images
        existing_image_ids = request.data.getlist("existing_images_ids")
        existing_image_captions = request.data.getlist("existing_images_captions")
        existing_image_thumbnails = request.data.getlist("existing_images_thumbnails")

        if existing_image_ids:
            for i, image_id in enumerate(existing_image_ids):
                try:
                    image = PlaceImage.objects.get(id=image_id, place=instance)
                    image.caption = existing_image_captions[i]
                    image.is_thumbnail = existing_image_thumbnails[i] == "true"
                    image.save()
                except PlaceImage.DoesNotExist:
                    pass

        # Images to delete
        images_to_delete = request.data.getlist("images_to_delete")
        if images_to_delete:
            PlaceImage.objects.filter(id__in=images_to_delete, place=instance).delete()

        # New Images
        image_files = request.FILES.getlist("images_files")
        image_captions = request.data.getlist("images_captions")
        image_thumbnails = request.data.getlist("images_thumbnails")

        if image_files:
            if not (len(image_files) == len(image_captions) == len(image_thumbnails)):
                return Response(
                    {
                        "error": (
                            "Mismatched number of image files, captions or"
                            " thumbnail designations"
                        )
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            for i, image_file in enumerate(image_files):
                PlaceImage.objects.create(
                    place=instance,
                    image=image_file,
                    caption=image_captions[i],
                    is_thumbnail=image_thumbnails[i] == "true",
                )

        # Validate and update Place instance
        serializer = self.get_serializer(instance, data=serializer_data, partial=True)
        if serializer.is_valid():
            self.perform_update(serializer)
            instance.refresh_from_db()
            updated_serializer = self.get_serializer(instance)
            return Response(updated_serializer.data, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PlaceGeoJSONView(generics.ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceGeoJSONSerializer

    def get_queryset(self):
        queryset = super().get_queryset()
        category = self.request.query_params.get("category", None)

        if category:
            queryset = queryset.filter(category=category)

        return queryset.order_by("-rating")

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"type": "FeatureCollection", "features": serializer.data})
