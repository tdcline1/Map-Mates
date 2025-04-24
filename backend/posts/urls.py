from django.urls import path

from .views import PlaceList, PlaceDetail

urlpatterns = [
    path("<int:pk>/", PlaceDetail.as_view(), name="place_detail"),
    path("", PlaceList.as_view(), name="place_list"),
]
