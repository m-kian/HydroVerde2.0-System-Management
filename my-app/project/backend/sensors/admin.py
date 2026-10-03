from django.contrib import admin

from .models import Reading


@admin.register(Reading)
class ReadingAdmin(admin.ModelAdmin):
    list_display = ("created_at", "ph", "temperature", "humidity", "water_level", "shade_net_active")
    ordering = ("-created_at",)
