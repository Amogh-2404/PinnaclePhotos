# PinnaclePhotos

![Python](https://img.shields.io/badge/python-3.11%2B-blue.svg) ![Django](https://img.shields.io/badge/Django-5.0-green.svg) ![License](https://img.shields.io/badge/license-MIT-lightgrey.svg)

A **full-featured social image bookmarking platform** built with Django 5.  Users can save images from around the web, organise them, follow other photographers, and discover the most-loved pictures through real-time rankings powered by Redis.

---

## ✨ Key Features

* **Image bookmarking & upload** – save via URL or local upload
* **Social auth** – login with Google OAuth 2 or email/password
* **Like & follow** – engage with images and creators you love
* **Real-time popularity ranking** – Redis-backed view/like counters
* **User profiles & activity stream** – stay up-to-date with followers
* **Responsive UI** – modern templates with Bootstrap 5
* **Production-ready** – configured for Render, Gunicorn & WhiteNoise

_Screenshots coming soon …_

---

## ⚙️ Tech Stack

| Layer            | Technology |
|------------------|------------|
| Backend Framework| Django 5   |
| Database         | PostgreSQL |
| Caching / Stats  | Redis      |
| Storage          | Local / S3‐ready via `ImageField` |
| Auth             | social-auth-app-django (Google) |
| Static Serving   | WhiteNoise |
| Thumbnails       | easy-thumbnails |

---

## 🚀 Quick Start (Local Development)

1. **Clone & enter the project**
   ```bash
   git clone https://github.com/Amogh-2404/PinnaclePhotos.git
   cd PinnaclePhotos
   ```
2. **Create a virtualenv** (Python 3.11+ recommended)
   ```bash
   python -m venv .venv
   source .venv/bin/activate
   ```
3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```
4. **Prepare services**
   * **PostgreSQL** – create a database/user or use Docker
   * **Redis** – ensure Redis server is running (default `localhost:6379`)
5. **Configure environment** – copy `.env.example` and set values:
   ```env
   # Database
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/mysite

   # Google OAuth
   GOOGLE_OAUTH2_KEY=<your-client-id>
   GOOGLE_OAUTH2_SECRET=<your-client-secret>

   # Django
   SECRET_KEY=<strong-secret-key>
   DEBUG=True
   ```
6. **Apply migrations & create superuser**
   ```bash
   python manage.py migrate
   python manage.py createsuperuser
   ```
7. **Run development server**
   ```bash
   python manage.py runserver
   ```
   Visit `http://127.0.0.1:8000/` and log in to start bookmarking!

---

## ☁️ One-Click Deploy (Render.com)

A ready-to-use [`render.yaml`](./render.yaml) is included.  It provisions:

* **Web Service** – Gunicorn served Django app
* **PostgreSQL** & **Redis** add-ons
* **Static Files** – WhiteNoise + render build hooks

1. Push the repo to GitHub (private or public).
2. Click the **Import an Existing Repo** button on Render.
3. In **Environment** tab add variables from `.env.example`.
4. Hit **Apply** – Render builds & deploys in minutes.

---

## 📂 Project Structure (abridged)

```
PinnaclePhotos/
├── account/            # User profiles, auth, Google OAuth pipeline
├── actions/            # Activity stream utilities
├── images/             # Image CRUD, likes, ranking
├── bookmarks/          # Django project settings & URLs
├── static/             # Compiled CSS/JS delivered by WhiteNoise
├── media/              # Uploaded user content (dev only)
├── requirements.txt    # Python dependencies
├── render.yaml         # Render.com deploy spec
├── build.sh            # Build helper for container environments
└── manage.py           # Django entrypoint
```

---

## 🛠️ Development Tips

* Use `python manage.py shell_plus` (from **django-extensions**) for a better shell.
* Enable `DEBUG_TOOLBAR` by uncommenting its lines in `settings.py` during local dev.
* Pre-commit linting/formatting is recommended (Black, isort, flake8).

---

## 🤝 Contributing

Pull requests are welcome!  Please:

1. Fork & create a feature branch.
2. Add tests for new behaviour.
3. Follow the existing code style.
4. Open a PR describing your changes.

---

## 📝 License

Distributed under the **MIT License**.  See [`LICENSE`](LICENSE) for details.
