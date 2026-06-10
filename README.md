# Anyar Retail Indonesia — HRIS & Purchasing System

Sistem informasi HRIS (Human Resource Information System) dan Purchasing untuk **Anyar Retail Indonesia**, berbasis arsitektur microservices.

## Arsitektur

```
anyar-retail/
├── auth-service/          # Laravel 13 — Autentikasi & JWT
├── employee-service/      # Laravel 13 — Data karyawan, cabang, posisi
├── purchase-service/      # Laravel 13 — Vendor, item, purchase order
├── frontend/              # React 19 + TypeScript + Vite + Tailwind
├── nginx/                 # API Gateway (reverse proxy)
└── docker-compose.yml     # Orchestrasi semua container
```

### Tech Stack

| Layer           | Teknologi                                   |
| --------------- | ------------------------------------------- |
| Backend         | PHP 8.4, Laravel 13, JWT-Auth               |
| Frontend        | React 19, TypeScript, Vite 6, Tailwind CSS  |
| Database        | MySQL 8.0 (3 instance: `db_auth`, `db_hrm`, `db_purchasing`) |
| Cache/Session   | Redis 7                                     |
| API Gateway     | Nginx (port 80)                             |
| Container       | Docker Compose, Alpine Linux                |

### Alur Autentikasi

Auth service sebagai **centralized authentication**. Service lain memvalidasi JWT dengan memanggil `auth-service` via HTTP (Guzzle). Refresh token di-blacklist di Redis saat logout.

## Persyaratan

- [Docker](https://docs.docker.com/get-docker/) + [Docker Compose](https://docs.docker.com/compose/install/)
- Node.js 18+ (untuk frontend)
- Git

## Cara Menjalankan

### 1. Clone & Siapkan Environment

```bash
git clone <repo-url>
cd anyar-retail

cp .env.example .env
```

Edit `.env` dan isi nilai yang diperlukan:

| Variable                | Keterangan                               |
| ----------------------- | ---------------------------------------- |
| `MYSQL_ROOT_PASSWORD`   | Password MySQL root untuk 3 database     |
| `AUTH_APP_KEY`          | App key Laravel auth-service             |
| `EMPLOYEE_APP_KEY`      | App key Laravel employee-service         |
| `PURCHASING_APP_KEY`    | App key Laravel purchase-service         |
| `JWT_SECRET`            | Shared secret JWT untuk semua service    |

Generate app key Laravel:
```bash
docker run --rm php:8.4-cli-alpine php -r "echo 'base64:'.base64_encode(random_bytes(32));"
```

Generate JWT secret:
```bash
docker run --rm php:8.4-cli-alpine php -r "echo base64_encode(random_bytes(64));"
```

Atau jika sudah ada PHP + Composer di lokal, jalankan di masing-masing service:
```bash
php artisan key:generate --show
php artisan jwt:secret --show
```

### 2. Jalankan Backend (Docker)

```bash
docker-compose up -d --build
```

Perintah ini akan:
- Build 3 image PHP 8.4 custom (masing-masing dengan nginx + supervisor + Composer)
- Pull MySQL 8.0, Redis 7, dan Nginx Alpine
- Menjalankan migrasi & seeder otomatis di setiap service
- Nginx gateway siap di port **80**

### 3. Jalankan Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend berjalan di `http://localhost:5173`.

Pastikan `frontend/.env` terisi dengan benar:
```
VITE_AUTH_API=http://localhost:8001/api
VITE_EMPLOYEE_API=http://localhost:8002/api
VITE_PURCHASE_API=http://localhost:8003/api
```

## URL Service

| Service                  | URL Internal (Docker)          | URL Eksternal (Localhost) |
| ------------------------ | ------------------------------ | ------------------------- |
| API Gateway              | —                              | `http://localhost`        |
| Auth Service             | `http://auth-service:8080`     | `http://localhost:8001`   |
| Employee Service         | `http://employee-service:8080` | `http://localhost:8002`   |
| Purchase Service         | `http://purchase-service:8080` | `http://localhost:8003`   |
| Frontend (dev)           | —                              | `http://localhost:5173`   |

### Endpoint API Gateway

| Prefix                              | Tujuan            |
| ----------------------------------- | ----------------- |
| `/api/auth/*`, `/auth/*`            | Auth Service      |
| `/employees/*`, `/branches/*`, `/positions/*` | Employee Service |
| `/vendors/*`, `/items/*`, `/purchase-orders/*` | Purchase Service |

## Struktur Service

### Auth Service (`auth-service/`)
- Port: `8001` | DB: `db_auth`
- Login, JWT (access + refresh token), validasi token, logout
- Refresh token di-blacklist di Redis

### Employee Service (`employee-service/`)
- Port: `8002` | DB: `db_hrm`
- Manajemen karyawan, cabang (`/branches`), posisi (`/positions`)

### Purchase Service (`purchase-service/`)
- Port: `8003` | DB: `db_purchasing`
- Manajemen vendor (`/vendors`), item (`/items`), purchase order (`/purchase-orders`)

### Frontend (`frontend/`)
- React 19 + TypeScript + Vite 6 + Tailwind CSS 3
- State management: Zustand 5
- Routing: React Router DOM v7
- HTTP client: Axios

## Perintah Umum

```bash
# Lihat log container
docker-compose logs -f auth-service

# Restart semua service
docker-compose restart

# Hentikan container
docker-compose down

# Hapus container + volume (data akan hilang)
docker-compose down -v

# Masuk ke container
docker exec -it auth_service sh
```
