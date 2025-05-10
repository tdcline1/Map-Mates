from rest_framework import generics, status, permissions
from rest_framework.response import Response

from .models import Place
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
    queryset = Place.objects.select_related("author").prefetch_related("images")
    serializer_class = PlaceDetailSerializer
    # permission_classes = [IsAuthorOrReadOnly]

    # Not sure we need this becuase of permission
    # def get_queryset(self):
    #     user = self.request.user
    #     return Place.objects.filter(author=user)


class PlaceGeoJSONView(generics.ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceGeoJSONSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"type": "FeatureCollection", "features": serializer.data})
