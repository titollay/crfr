# CRFR Dashboard — Backend API

A Laravel 12 REST API backend for managing a training center that combines **accommodation** (chambres/rooms) with **training operations** (formations, salles, intervenants, formateurs). Designed to power a React/Vue frontend dashboard.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Data Model](#data-model)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Artisan Commands](#artisan-commands)
- [Project Structure](#project-structure)

---

## Overview

CRFR Dashboard manages two main domains in a single API:

| Domain | Description |
|---|---|
| **Hébergement** | Rooms (chambres), reservations for intervenants, auto-sync of room occupancy status |
| **Formation** | Training sessions, classrooms (salles), trainers (formateurs), organisations, participant tracking |

The API is stateless and token-based (Laravel Sanctum). A companion frontend (React or Vue) consumes it.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Laravel 12 |
| PHP | 8.2+ |
| Authentication | Laravel Sanctum 4 |
| Database | SQLite (default) / MySQL |
| ORM | Eloquent |
| Dev Tools | Laravel Breeze, Sail, Pint, Pail |
| Testing | PHPUnit 11 |
| Date handling | Carbon |

---

## Features

- **Token-based authentication** — register, login, logout via Sanctum
- **Room management (Chambres)** — CRUD, three statuses (`Disponible`, `Occupée`, `Maintenance`) with configurable maintenance duration
- **Auto-sync room status** — status is automatically recalculated based on active reservations on each request and via an Artisan command
- **Reservations** — book up to two intervenants per room, with overlap detection for available rooms
- **Classroom management (Salles)** — auto-sync status based on active formations
- **Training sessions (Formations)** — full lifecycle (`planifiee` → `en cours` → `terminee`), linked to organisations, salles, and formateurs (many-to-many)
- **Formation images** — file upload support per formation
- **Intervenants** — participant profiles linked to organisations, with an `a_formation` flag
- **Formateurs** — trainer profiles linked to formations
- **Organisations** — hierarchical (parent/child) organisational structure
- **Dashboard summary** — key metrics, recent reservations, upcoming formations, 6-month chart
- **Analytics endpoints** — occupancy calendar, monthly occupancy rate, top reserved rooms, heatmap (90 days), statistics with period filtering
- **Settings system** — key/value settings with type support (string, json, etc.)
- **User management** — admin CRUD for users with roles and profile photos

---

## Data Model

```
organisations
  ├── id_org, nom, ville_org, type, parent_id
  ├── hasMany: intervenants, formations
  └── belongsTo: parent (self-referential)

chambres
  ├── id_chambre, num_chambre, type_chambre, statut, etage, equipements
  ├── maintenance_at, maintenance_duree
  └── hasMany: reservations

salles
  ├── id_salle, num_salle, statut
  └── hasMany: formations

intervenants
  ├── id_inter, nom, prenom, cin, telephone, email, ville
  ├── id_org, date_naissance, cadre, mission, nationalite, adresse, a_formation
  └── belongsTo: organisation

formateurs
  ├── id_formateur, cin, num_location, attribut
  └── belongsToMany: formations

formations
  ├── id_forma, sujet, statut, categorie_cible, id_org, id_salle
  ├── date_debut, date_fin, nbr_prevu, nbr_reel, superviseur
  ├── heures_formation, observations, nb_formateurs
  ├── belongsTo: organisation, salle_relation
  ├── belongsToMany: formateurs
  └── hasMany: images

reservations
  ├── id_resev, id_inter, id_inter_2 (optional), id_chambre
  ├── id_salle (optional), date_debut, date_fin, statut, created_by
  ├── belongsTo: intervenant, intervenant2, chambre, salle, createur (User)
  └── statut: Confirmée | En attente | Annulée

users
  └── id_user, nom, prenom, email, password, role, photo, last_login_at

settings
  └── key, value, type, group, label
```

---

## API Endpoints

All protected endpoints require the `Authorization: Bearer {token}` header.

### Auth (public)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Register a new user |
| POST | `/api/login` | Login and receive a Bearer token |
| GET | `/api/settings` | Fetch public app settings |

### Auth (protected)

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/user` | Get the authenticated user |
| POST | `/api/logout` | Logout (revoke current token) |

### Dashboard

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/summary` | Metrics, room stats, recent activity, 6-month chart |

### Reservations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/reservations` | List all reservations |
| POST | `/api/reservations` | Create a reservation |
| GET | `/api/reservations/{id}` | Show a reservation |
| PUT | `/api/reservations/{id}` | Update a reservation |
| DELETE | `/api/reservations/{id}` | Delete a reservation |
| GET | `/api/reservations/options` | Get chambres and intervenants for forms |
| GET | `/api/reservations/available-chambres` | Available rooms for a given date range |
| GET | `/api/reservations/statistics` | Charts and KPIs (period filter: today/week/month/all) |

### Chambres

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/chambres` | List all rooms |
| POST | `/api/chambres` | Create a room |
| GET | `/api/chambres/{id}` | Show a room |
| PUT | `/api/chambres/{id}` | Update a room |
| DELETE | `/api/chambres/{id}` | Delete a room |
| GET | `/api/chambres/statistics` | Room statistics |
| GET | `/api/chambres/analytics` | Occupancy analytics (calendar, top rooms, monthly rates) |
| POST | `/api/chambres/sync-status` | Manually trigger status sync |

### Salles

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/salles` | List all classrooms |
| POST | `/api/salles` | Create a classroom |
| GET | `/api/salles/{id}` | Show a classroom |
| PUT | `/api/salles/{id}` | Update a classroom |
| DELETE | `/api/salles/{id}` | Delete a classroom |

### Intervenants

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/intervenants` | List all intervenants |
| POST | `/api/intervenants` | Create an intervenant |
| GET | `/api/intervenants/{id}` | Show an intervenant |
| PUT | `/api/intervenants/{id}` | Update an intervenant |
| DELETE | `/api/intervenants/{id}` | Delete an intervenant |
| GET | `/api/intervenants/statistics` | Intervenant statistics |
| GET | `/api/intervenants/organisations` | Get organisations for forms |

### Formations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/formations` | List all formations |
| POST | `/api/formations` | Create a formation |
| PUT | `/api/formations/{id_forma}` | Update a formation |
| DELETE | `/api/formations/{id_forma}` | Delete a formation |
| GET | `/api/formations/available-salles` | Available salles for a date range |

### Organisations

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/organisations` | List all organisations |
| POST | `/api/organisations` | Create an organisation |
| PUT | `/api/organisations/{id_org}` | Update an organisation |
| DELETE | `/api/organisations/{id_org}` | Delete an organisation |

### Formateurs

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/formateurs` | List all formateurs |
| POST | `/api/formateurs` | Create a formateur |
| PUT | `/api/formateurs/{id}` | Update a formateur |
| DELETE | `/api/formateurs/{id}` | Delete a formateur |

### Settings

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/settings` | Update settings |
| POST | `/api/settings/reset` | Reset settings to defaults |

### Users

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users` | List all users |
| POST | `/api/users` | Create a user |
| GET | `/api/users/{id_user}` | Show a user |
| PUT | `/api/users/{id_user}` | Update a user |
| DELETE | `/api/users/{id_user}` | Delete a user |

---

## Installation

### Prerequisites

- PHP 8.2+
- Composer
- Node.js & npm (for Vite assets if needed)
- SQLite (default) or MySQL

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/crfr.git
cd crfr

# 2. Install PHP dependencies
composer install

# 3. Copy environment file and generate app key
cp .env.example .env
php artisan key:generate

# 4. Run database migrations
php artisan migrate

# 5. (Optional) Install and build frontend assets
npm install && npm run build

# 6. Start the development server
php artisan serve
```

Or use the built-in composer setup script:

```bash
composer run setup
```

The API will be available at `http://localhost:8000/api`.

### Using Laravel Sail (Docker)

```bash
./vendor/bin/sail up -d
./vendor/bin/sail artisan migrate
```

---

## Environment Variables

Key variables to configure in `.env`:

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `Laravel` | Application name |
| `APP_URL` | `http://localhost` | Base URL |
| `DB_CONNECTION` | `sqlite` | Database driver (`sqlite` or `mysql`) |
| `DB_HOST` | `127.0.0.1` | Database host (MySQL only) |
| `DB_PORT` | `3306` | Database port (MySQL only) |
| `DB_DATABASE` | *(sqlite file)* | Database name |
| `DB_USERNAME` | `root` | Database username |
| `DB_PASSWORD` | | Database password |
| `SESSION_DRIVER` | `database` | Session storage |
| `QUEUE_CONNECTION` | `database` | Queue driver |

To switch to MySQL, update these in `.env`:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=crfr
DB_USERNAME=root
DB_PASSWORD=your_password
```

---

## Artisan Commands

| Command | Description |
|---|---|
| `php artisan rooms:sync-status` | Sync all room statuses based on active reservations |
| `php artisan salles:sync-status` | Sync all classroom statuses based on active formations |
| `php artisan migrate` | Run database migrations |
| `php artisan tinker` | Interactive REPL |

---

## Project Structure

```
app/
├── Console/Commands/
│   ├── SyncRoomStatusCommand.php     # rooms:sync-status
│   ├── SyncRoomStatuses.php
│   └── SyncSalleStatus.php           # salles:sync-status
├── Http/
│   ├── Controllers/Api/
│   │   ├── AuthController.php
│   │   ├── ChambreController.php
│   │   ├── DashboardController.php
│   │   ├── FormateurController.php
│   │   ├── FormationController.php
│   │   ├── IntervenantController.php
│   │   ├── OrganisationController.php
│   │   ├── ReservationController.php
│   │   ├── SalleController.php
│   │   ├── SettingController.php
│   │   └── UserController.php
│   └── Resources/
│       ├── FormationResource.php
│       ├── IntervenantResource.php
│       ├── OrganisationResource.php
│       └── ReservationResource.php
├── Models/
│   ├── Chambre.php                   # Room model with auto-sync logic
│   ├── Formation.php
│   ├── FormationImage.php
│   ├── Formateur.php
│   ├── Intervenant.php
│   ├── Organisation.php
│   ├── Reservation.php
│   ├── Salle.php                     # Classroom model with auto-sync logic
│   ├── Setting.php
│   └── User.php
└── Services/
    └── ChambreAnalyticsService.php   # Occupancy analytics (calendar, heatmap, top rooms)
database/
└── migrations/                       # 25 migrations
routes/
└── api.php                           # All API routes
```

---

## License

This project is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).
