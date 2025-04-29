from rest_framework import generics, permissions
from rest_framework.response import Response

from .models import Place
from .permissions import IsAuthorOrReadOnly
from .serializers import PlaceSerializer, PlaceGeoJSONSerializer


class PlaceList(generics.ListCreateAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer

    def perform_create(self, serializer):
        if serializer.is_valid():
            serializer.save(author=self.request.user)
        else:
            print(serializer.errors)


class PlaceDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceSerializer
    permission_classes = [IsAuthorOrReadOnly]

    # Not sure we need this becuase of permission
    def get_queryset(self):
        user = self.request.user
        return Place.objects.filter(author=user)


class PlaceGeoJSONView(generics.ListAPIView):
    queryset = Place.objects.all()
    serializer_class = PlaceGeoJSONSerializer

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response({"type": "FeatureCollection", "features": serializer.data})
