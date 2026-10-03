import os
import tempfile

from django.core.management import call_command
from django.db import connections
from django.test import TransactionTestCase, override_settings

from accounts.models import User
from sensors.models import Reading


class SyncTests(TransactionTestCase):
    databases = {"default", "supabase"}

    def test_sync_copies_new_rows_once(self):
        User.objects.create_user(email="a@b.com", password="pw123456", name="A")
        for i in range(3):
            Reading.objects.create(ph=6 + i, temperature=24, humidity=70, water_level=80, shade_net_active=False)
        call_command("sync_supabase")
        call_command("sync_supabase")  # second run must not duplicate
        assert User.objects.using("supabase").count() == 1
        assert Reading.objects.using("supabase").count() == 3
        Reading.objects.create(ph=7, temperature=24, humidity=70, water_level=80, shade_net_active=True)
        call_command("sync_supabase")
        assert Reading.objects.using("supabase").count() == 4
