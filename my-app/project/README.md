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
