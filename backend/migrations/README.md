# Database Migrations

Sistem migrasi database untuk mengelola perubahan skema database secara terstruktur dan terkontrol.

## Perintah Migration

### 1. Membuat Migration Baru
```bash
npm run migrate:create <nama_migration>
```

Contoh:
```bash
npm run migrate:create add_user_avatar_column
npm run migrate:create create_products_table
npm run migrate:create update_settings_structure
```

### 2. Menjalankan Migration
```bash
npm run migrate
```
Menjalankan semua migration yang belum dieksekusi.

### 3. Melihat Status Migration
```bash
npm run migrate:status
```
Menampilkan daftar migration dan statusnya (executed/pending).

### 4. Rollback Migration
```bash
npm run migrate:rollback [jumlah_step]
```

Contoh:
```bash
npm run migrate:rollback     # Rollback 1 migration terakhir
npm run migrate:rollback 3   # Rollback 3 migration terakhir
```

## Format File Migration

### Migration File
File migration menggunakan format: `YYYYMMDDHHMMSS_nama_migration.sql`

Contoh isi file migration:
```sql
-- Migration: add_user_avatar_column
-- Created: 2024-01-15T10:30:00.000Z

-- Tambah kolom avatar untuk tabel users
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url VARCHAR(500);

-- Tambah index untuk performa
CREATE INDEX IF NOT EXISTS idx_users_avatar ON users(avatar_url);
```

### Rollback File (Opsional)
Untuk rollback, buat file dengan format: `YYYYMMDDHHMMSS_nama_migration_rollback.sql`

Contoh isi file rollback:
```sql
-- Rollback: add_user_avatar_column

-- Hapus index
DROP INDEX IF EXISTS idx_users_avatar ON users;

-- Hapus kolom avatar
ALTER TABLE users DROP COLUMN IF EXISTS avatar_url;
```

## Best Practices

### 1. Gunakan IF NOT EXISTS / IF EXISTS
```sql
-- ✅ BENAR
CREATE TABLE IF NOT EXISTS products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);

ALTER TABLE users ADD COLUMN IF NOT EXISTS email VARCHAR(255);
DROP TABLE IF EXISTS old_table;

-- ❌ SALAH
CREATE TABLE products (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL
);
```

### 2. Buat Migration Kecil dan Spesifik
```bash
# ✅ BENAR - Migration terpisah
npm run migrate:create add_user_email_column
npm run migrate:create create_products_table
npm run migrate:create add_product_indexes

# ❌ SALAH - Migration terlalu besar
npm run migrate:create update_entire_database_structure
```

### 3. Selalu Test Migration
1. Test di database development
2. Test rollback jika ada
3. Backup database production sebelum migrate

### 4. Naming Convention
- Gunakan snake_case
- Deskriptif dan jelas
- Awali dengan action (add, create, update, remove)

Contoh:
```bash
add_user_avatar_column
create_products_table
update_settings_structure
remove_old_logs_table
add_foreign_key_constraints
```

## Troubleshooting

### Migration Gagal
1. Cek error message di console
2. Pastikan syntax SQL benar
3. Cek koneksi database
4. Pastikan user database punya permission yang cukup

### Rollback Gagal
1. Pastikan file rollback ada
2. Cek syntax SQL di file rollback
3. Pastikan operasi rollback valid (tidak menghapus data yang dibutuhkan)

### Migration Sudah Dijalankan Manual
Jika migration sudah dijalankan manual di database:
```sql
-- Tambahkan record ke tabel migrations
INSERT INTO migrations (filename, executed_at) 
VALUES ('20240115103000_nama_migration.sql', NOW());
```

## File Structure
```
backend/migrations/
├── README.md                           # Dokumentasi ini
├── migrate.js                          # Script utama migration
├── rollback.js                         # Script rollback
├── create-migration.js                 # Script buat migration baru
├── status.js                           # Script cek status
├── 001_initial_schema.sql              # Migration awal
├── 20240115103000_add_user_avatar.sql  # Migration example
└── 20240115103000_add_user_avatar_rollback.sql  # Rollback example
```