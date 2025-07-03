from django.urls import path

from .views import PlaceDetailView, PlaceGeoJSONView, PlaceList

urlpatterns = [
    path("<int:pk>/", PlaceDetailView.as_view(), name="place_detail"),
    path("", PlaceList.as_view(), name="place_list"),
    path("geojson/", PlaceGeoJSONView.as_view(), name="geojson"),
]
