import time

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from accounts.models import User
from sensors.models import Reading

CLOUD = "supabase"
BATCH = 500


class Command(BaseCommand):
    help = "Copy users and sensor readings from local SQLite to the Supabase database."

    def add_arguments(self, parser):
        parser.add_argument("--loop", type=int, default=0, help="Repeat every N seconds (0 = run once)")

    def handle(self, *args, **opts):
        if CLOUD not in settings.DATABASES:
            raise CommandError("SUPABASE_DB_URL is not set in backend/.env")
        while True:
            try:
                u, r = self.sync()
                self.stdout.write(f"{time.strftime('%H:%M:%S')} synced {u} new users, {r} new readings")
            except Exception as e:  # e.g. no internet: report and retry on the next cycle
                if not opts["loop"]:
                    raise
                self.stderr.write(f"{time.strftime('%H:%M:%S')} sync failed ({type(e).__name__}); retrying")
                from django.db import connections
                connections.close_all()
            if not opts["loop"]:
                break
            time.sleep(opts["loop"])

    def sync(self):
        cloud_users = set(User.objects.using(CLOUD).values_list("id", flat=True))
        new_users = [u for u in User.objects.all() if u.id not in cloud_users]
        User.objects.using(CLOUD).bulk_create(new_users, ignore_conflicts=True)

        last = Reading.objects.using(CLOUD).order_by("-id").values_list("id", flat=True).first() or 0
        total = 0
        while True:
            batch = list(Reading.objects.filter(id__gt=last).order_by("id")[:BATCH])
            if not batch:
                break
            Reading.objects.using(CLOUD).bulk_create(batch, ignore_conflicts=True)
            last = batch[-1].id
            total += len(batch)
        return len(new_users), total
