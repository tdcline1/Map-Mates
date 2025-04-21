from rest_framework import generics
from django.contrib.auth import get_user_model

from .serializers import UserSerializer


# Create your views here.
class UserList(generics.ListAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer


class UserDetail(generics.RetrieveAPIView):
    queryset = get_user_model().objects.all()
    serializer_class = UserSerializer
