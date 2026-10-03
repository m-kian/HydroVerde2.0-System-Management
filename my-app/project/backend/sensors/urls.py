from django.urls import path

from . import views

urlpatterns = [
    path("", views.ReadingHistoryView.as_view()),
    path("latest/", views.LatestReadingView.as_view()),
    path("ingest/", views.ReadingIngestView.as_view()),
    path("lorawan/uplink/", views.LoRaWANUplinkView.as_view()),
]
