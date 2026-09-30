from django.urls import path
from .views import ParkingListView


urlpatterns = [ path('parking/', ParkingListView.as_view(), name='parking-list'),]