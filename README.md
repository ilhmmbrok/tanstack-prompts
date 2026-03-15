# ✨ Tanstack Prompts

Aplikasi **Prompt Manager** full-stack yang dibangun dengan **TanStack Start**, dilengkapi autentikasi, CRUD prompt, dark/light mode, dan UI component library kustom.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TanStack Start](https://img.shields.io/badge/TanStack_Start-latest-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)
![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-0.45-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)

## 🚀 Fitur

- **Autentikasi** — Sign-up & sign-in dengan hashing password (bcrypt) dan session-based auth
- **CRUD Prompts** — Buat, lihat, edit, dan hapus prompt milik user
- **Pencarian** — Cari prompt berdasarkan judul atau konten (case-insensitive)
- **Dark/Light Mode** — Toggle tema dengan deteksi preferensi sistem
- **Protected Routes** — Middleware autentikasi untuk route yang memerlukan login
- **Server Functions** — Logika server yang aman dengan `createServerFn` dan `createServerOnlyFn`
- **Kustom UI Library** — Komponen UI reusable (Selia) berbasis Base UI + CVA

---

## 🛠 Tech Stack

| Layer          | Teknologi                                                                   |
| -------------- | --------------------------------------------------------------------------- |
| **Framework**  | [TanStack Start](https://tanstack.com/start) + React 19                     |
| **Routing**    | [TanStack Router](https://tanstack.com/router) (file-based)                 |
| **Styling**    | [Tailwind CSS v4](https://tailwindcss.com/) + [Selia](https://selia.earth/) |
| **Database**   | PostgreSQL via [Neon](https://neon.tech/) (serverless)                      |
| **ORM**        | [Drizzle ORM](https://orm.drizzle.team/)                                    |
| **Auth**       | Session-based (bcryptjs + iron-session via TanStack)                        |
| **State**      | [Zustand](https://zustand.docs.pmnd.rs/)                                    |
| **Validation** | [Zod](https://zod.dev/)                                                     |
| **Icons**      | [Lucide React](https://lucide.dev/)                                         |
| **Build**      | [Vite](https://vite.dev/) + [Nitro](https://nitro.build/)                   |
| **Testing**    | [Vitest](https://vitest.dev/) + Testing Library                             |

---

## 📁 Struktur Project

```
tanstack-start/
├── drizzle/                  # Migration files
├── public/                   # Static assets
├── src/
│   ├── components/
│   │   ├── selia/            # UI component library (Button, Card, Menu, Toast, dll.)
│   │   ├── DeleteDialog.tsx  # Dialog konfirmasi hapus
│   │   ├── Header.tsx        # Header layout
│   │   ├── PromptForm.tsx    # Form buat/edit prompt
│   │   ├── PromptSearch.tsx  # Komponen pencarian
│   │   └── ThemeToggle.tsx   # Toggle dark/light mode
│   ├── database/
│   │   ├── db.ts             # Koneksi database (Neon + Drizzle)
│   │   └── schema.ts         # Schema tabel (users, prompts)
│   ├── lib/
│   │   ├── auth.ts           # Server functions autentikasi
│   │   ├── session.ts        # Konfigurasi session
│   │   └── utils.ts          # Utility functions (cn, dll.)
│   ├── middlewares/
│   │   └── auth-middleware.ts # Middleware proteksi route
│   ├── routes/
│   │   ├── __authed/          # Route yang memerlukan login
│   │   │   ├── index.tsx      # Halaman utama (daftar prompt)
│   │   │   ├── create.tsx     # Buat prompt baru
│   │   │   ├── edit.$promptId.tsx  # Edit prompt
│   │   │   ├── view.$promptId.tsx  # Lihat detail prompt
│   │   │   └── route.tsx      # Layout authed (auth check)
│   │   ├── __guess/           # Route untuk guest (belum login)
│   │   │   ├── sign-in.tsx    # Halaman sign in
│   │   │   ├── sign-up.tsx    # Halaman sign up
│   │   │   └── route.tsx      # Layout guest
│   │   └── __root.tsx         # Root layout
│   ├── stores/
│   │   └── DeleteStore.ts     # Zustand store untuk delete dialog
│   ├── router.tsx             # Konfigurasi router
│   └── styles.css             # Global styles + Tailwind
├── drizzle.config.ts          # Konfigurasi Drizzle Kit
├── vite.config.ts             # Konfigurasi Vite
├── tsconfig.json
└── package.json
```

---

## 📌 Prasyarat

- [Node.js](https://nodejs.org/) v18+ atau [Bun](https://bun.sh/) v1+
- Akun [Neon](https://neon.tech/) (PostgreSQL serverless) atau instance PostgreSQL lain

---

## ⚙️ Instalasi

1. **Clone repository**

   ```bash
   git clone <repository-url>
   cd tanstack-start
   ```

2. **Install dependencies**

   ```bash
   bun install
   # atau
   npm install
   ```

3. **Setup environment variables** (lihat bagian di bawah)

4. **Jalankan migrasi database**

   ```bash
   bunx drizzle-kit push
   ```

5. **Jalankan aplikasi**

   ```bash
   bun --bun run dev
   ```

---

## 🔐 Environment Variables

Buat file `.env` di root project:

```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
SESSION_SECRET=your-session-secret-min-32-characters
```

| Variable         | Deskripsi                                            |
| ---------------- | ---------------------------------------------------- |
| `DATABASE_URL`   | Connection string PostgreSQL (Neon recommended)      |
| `SESSION_SECRET` | Secret key untuk enkripsi session (min. 32 karakter) |

---

## 🗄 Database

Project ini menggunakan **Drizzle ORM** dengan **PostgreSQL** (Neon serverless).

### Schema

- **`users`** — Tabel user (id, name, email, password, timestamps)
- **`prompts`** — Tabel prompt (id, userId, title, content, timestamps)

### Perintah Drizzle Kit

```bash
# Push schema ke database
bunx drizzle-kit push

# Generate migration
bunx drizzle-kit generate

# Jalankan migration
bunx drizzle-kit migrate

# Buka Drizzle Studio (GUI)
bunx drizzle-kit studio
```

---

## 🏃 Menjalankan Aplikasi

### Development

```bash
bun --bun run dev
```

Aplikasi berjalan di `http://localhost:3000`.

### Production Build

```bash
bun --bun run build
bun --bun run preview
```

---

## 📜 Scripts

| Script    | Perintah                             | Deskripsi                |
| --------- | ------------------------------------ | ------------------------ |
| `dev`     | `vite dev --port 3000`               | Jalankan dev server      |
| `build`   | `vite build`                         | Build untuk production   |
| `preview` | `vite preview`                       | Preview build production |
| `test`    | `vitest run`                         | Jalankan test            |
| `lint`    | `eslint`                             | Cek linting              |
| `format`  | `prettier --check .`                 | Cek formatting           |
| `check`   | `prettier --write . && eslint --fix` | Auto-fix format & lint   |

---

## 🗺 Routing

Menggunakan **TanStack Router** dengan **file-based routing**. Route dikelompokkan menggunakan layout groups:

| Route Group | Deskripsi                            |
| ----------- | ------------------------------------ |
| `__authed/` | Route yang memerlukan autentikasi    |
| `__guess/`  | Route untuk guest (sign-in, sign-up) |

### Daftar Route

| Path              | Akses  | Deskripsi             |
| ----------------- | ------ | --------------------- |
| `/`               | Authed | Daftar prompt user    |
| `/create`         | Authed | Form buat prompt baru |
| `/edit/:promptId` | Authed | Form edit prompt      |
| `/view/:promptId` | Authed | Detail prompt         |
| `/sign-in`        | Guest  | Halaman sign in       |
| `/sign-up`        | Guest  | Halaman sign up       |

## 🎨 UI Components

Project ini menggunakan library komponen kustom **Selia** yang dibangun di atas [Base UI](https://base-ui.com/) dan [CVA](https://cva.style/):

| Komponen        | Deskripsi                              |
| --------------- | -------------------------------------- |
| `Button`        | Tombol dengan variasi (solid, outline) |
| `Card`          | Container card                         |
| `Menu`          | Dropdown menu                          |
| `Toast`         | Notifikasi toast                       |
| `AlertDialog`   | Dialog konfirmasi                      |
| `Field / Input` | Form field & input                     |
| `Textarea`      | Text area input                        |
| `Heading`       | Heading typography                     |
| `Separator`     | Garis pemisah                          |
| `Stack`         | Vertical stack layout                  |
| `IconBox`       | Icon container                         |

---
