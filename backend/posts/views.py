from rest_framework import generics, permissions

from .models import Place
from .permissions import IsAuthorOrReadOnly
from .serializers import PlaceSerializer


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
