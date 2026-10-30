# HydroVerde backend (Django + DRF)

## Run
    python -m venv venv && source venv/bin/activate   # Windows: venv\Scripts\activate
    pip install -r requirements.txt
    python manage.py migrate
    python manage.py createsuperuser
    python manage.py runserver 0.0.0.0:8000

## Endpoints (prefix /api/auth/)
| Method | Path        | Body                    | Returns            |
|--------|-------------|-------------------------|--------------------|
| POST   | register/   | name, email, password   | token, user        |
| POST   | login/      | email, password         | token, user        |
| GET    | me/         | — (Authorization: Token <t>) | user          |
| POST   | logout/     | — (auth)                | 204                |

## Supabase (cloud DB)
Set DATABASE_URL to the Supabase Postgres connection string, then `python manage.py migrate`.
Unset it to fall back to local SQLite.

## Frontend
Copy frontend-changes/api.js and AuthContext.jsx into the app's lib/ folder (delete db.js),
and set EXPO_PUBLIC_API_URL in the Expo app's .env.

## Real-time monitoring
The app's `SensorDashboard` updates live (with a Live / Offline / No new data badge) from either path:

1. **ESP32 -> Django** (default): `POST /api/readings/ingest/` with header `X-Device-Key: <DEVICE_API_KEY>`
   and JSON `{"ph": 6.5, "temperature": 24.1, "humidity": 60, "water_level": 80, "shade_net_active": false}`.
   Django saves it and pushes it to every signed-in app over the WebSocket (`/ws/`).
   Only `temperature` and `humidity` are required; `ph`, `water_level` and `shade_net_active` are optional
   (shown as "--"), so a DHT22-only board works. Sketch: `project/firmware/esp32_dht22/esp32_dht22.ino`.
   After pulling this change run `python manage.py migrate` (and `python manage.py migrate --database supabase`
   if you use Supabase).
2. **ESP32 -> Supabase directly**: set `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   in the Expo app's `.env` (see `.env.example`). The app subscribes to INSERTs on `sensors_reading`
   (override with `EXPO_PUBLIC_SUPABASE_READINGS_TABLE`). Run once in the Supabase SQL Editor:

       alter publication supabase_realtime add table public.sensors_reading;
       alter table public.sensors_reading enable row level security;
       create policy "App can read readings" on public.sensors_reading for select to anon, authenticated using (true);
       grant select on public.sensors_reading to anon, authenticated;

   If the ESP32 inserts with the publishable key it also needs an insert policy, which lets anyone with
   that key insert rows; prefer path 1 if that matters. Rows written straight to Supabase are not copied
   back to local SQLite by `sync_supabase`.
