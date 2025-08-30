# CashTracker - Platform Manajemen Keuangan Modern

![CashTracker](https://img.shields.io/badge/CashTracker-v1.0.0-blue.svg)
![React](https://img.shields.io/badge/React-18.x-61DAFB.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6.svg)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.x-38B2AC.svg)

## 📋 Tentang Aplikasi

CashTracker adalah platform manajemen keuangan all-in-one yang dirancang untuk membantu bisnis dan individu mengelola transaksi, menganalisis data keuangan, dan membuat laporan profesional dengan mudah. Dengan interface yang modern dan intuitif, CashTracker menyediakan semua tools yang Anda butuhkan untuk mengoptimalkan pengelolaan keuangan.

## ✨ Fitur Utama

### 📊 Dashboard Analitik
- **Visualisasi Data Komprehensif**: Grafik dan chart interaktif untuk memahami tren keuangan
- **Ringkasan Real-time**: Overview keuangan dengan data terkini
- **Metrik Kinerja**: KPI dan indikator keuangan penting
- **Responsive Design**: Tampilan optimal di semua perangkat

### 💰 Manajemen Transaksi
- **CRUD Lengkap**: Tambah, edit, hapus, dan lihat semua transaksi
- **Kategorisasi Otomatis**: Pengelompokan transaksi berdasarkan jenis
- **Pencarian & Filter**: Temukan transaksi dengan mudah
- **Validasi Data**: Sistem validasi untuk memastikan akurasi data

### 📈 Laporan Keuangan
- **Generate Laporan**: Buat laporan keuangan detail dengan berbagai format
- **Export Excel**: Ekspor data ke format Excel untuk analisis lanjutan
- **Laporan Periodik**: Laporan harian, mingguan, bulanan, dan tahunan
- **Analisis Tren**: Insight mendalam tentang pola keuangan

### 🔐 Keamanan & Autentikasi
- **Sistem Login Aman**: Autentikasi dengan enkripsi tingkat enterprise
- **Manajemen Session**: Kontrol akses dan session management
- **Role-based Access**: Pengaturan hak akses berdasarkan peran
- **Data Protection**: Perlindungan data dengan standar keamanan tinggi

### ⚙️ Pengaturan & Konfigurasi
- **Profil Pengguna**: Kelola informasi personal dan preferensi
- **Pengaturan Perusahaan**: Konfigurasi data perusahaan dan branding
- **Kustomisasi Interface**: Personalisasi tampilan sesuai kebutuhan
- **Backup & Restore**: Sistem backup otomatis untuk keamanan data

## 🚀 Teknologi yang Digunakan

### Frontend
- **React 18** - Library JavaScript modern untuk UI
- **TypeScript** - Type-safe JavaScript untuk development yang lebih robust
- **Vite** - Build tool super cepat untuk development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Komponen UI modern dan accessible
- **React Query** - Data fetching dan state management
- **React Router** - Routing untuk Single Page Application

### Backend
- **Node.js** - Runtime JavaScript untuk server
- **Express.js** - Web framework untuk Node.js
- **MySQL** - Database relational untuk penyimpanan data
- **JWT** - JSON Web Token untuk autentikasi
- **Bcrypt** - Hashing password untuk keamanan

### Tools & Libraries
- **Lucide React** - Icon library modern
- **Recharts** - Library untuk visualisasi data
- **React Hook Form** - Form handling yang efisien
- **Zod** - Schema validation
- **Date-fns** - Utility untuk manipulasi tanggal

## 📦 Instalasi & Setup

### Prasyarat
- Node.js (versi 18 atau lebih baru)
- npm atau yarn
- MySQL database

### Langkah Instalasi

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd cashtracker-app
   ```

2. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   cd ..
   ```

3. **Setup Database**
   ```bash
   # Buat database MySQL
   # Import schema dari backend/config/schema.sql
   # Konfigurasi koneksi database di backend/.env
   ```

4. **Konfigurasi Environment**
   ```bash
   # Copy dan edit file environment
   cp backend/.env.example backend/.env
   # Sesuaikan konfigurasi database dan JWT secret
   ```

5. **Jalankan Aplikasi**
   ```bash
   # Terminal 1: Jalankan backend
   cd backend
   npm run dev
   
   # Terminal 2: Jalankan frontend
   npm run dev
   ```

6. **Akses Aplikasi**
   - Frontend: `http://localhost:5173`
   - Backend API: `http://localhost:3000`

## 🎯 Cara Penggunaan

1. **Landing Page**: Kunjungi halaman utama untuk melihat overview aplikasi
2. **Login**: Masuk menggunakan kredensial yang valid
3. **Dashboard**: Lihat ringkasan keuangan dan analitik
4. **Transaksi**: Kelola semua transaksi keuangan
5. **Laporan**: Generate dan export laporan keuangan
6. **Pengaturan**: Konfigurasi profil dan preferensi

## 🔧 Development

### Struktur Project
```
cashtracker-app/
├── src/
│   ├── components/     # Komponen React reusable
│   ├── pages/          # Halaman aplikasi
│   ├── hooks/          # Custom React hooks
│   ├── services/       # API services
│   ├── contexts/       # React contexts
│   └── lib/            # Utility functions
├── backend/
│   ├── controllers/    # API controllers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── utils/          # Backend utilities
└── public/             # Static assets
```

### Scripts Available
```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint

# Backend
npm run dev          # Start development server with nodemon
npm start            # Start production server
npm run migrate      # Run database migrations
npm run seed         # Seed database with sample data
```

## 📱 Responsive Design

CashTracker dirancang dengan pendekatan mobile-first dan fully responsive:
- **Desktop**: Pengalaman penuh dengan sidebar dan layout multi-kolom
- **Tablet**: Layout yang dioptimalkan untuk layar medium
- **Mobile**: Interface yang disederhanakan dengan navigasi mobile-friendly

## 🔒 Keamanan

- **Autentikasi JWT**: Token-based authentication untuk keamanan API
- **Password Hashing**: Bcrypt untuk enkripsi password
- **Input Validation**: Validasi komprehensif di frontend dan backend
- **CORS Protection**: Konfigurasi CORS untuk mencegah akses tidak sah
- **SQL Injection Prevention**: Prepared statements untuk keamanan database

## 🤝 Kontribusi

Kami menyambut kontribusi dari komunitas! Silakan:
1. Fork repository ini
2. Buat branch untuk fitur baru (`git checkout -b feature/AmazingFeature`)
3. Commit perubahan (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## 📄 Lisensi

Project ini dilisensikan di bawah MIT License - lihat file [LICENSE](LICENSE) untuk detail.

## 📞 Support

Jika Anda memiliki pertanyaan atau membutuhkan bantuan:
- 📧 Email: support@cashtracker.com
- 💬 Discord: [Join our community](https://discord.gg/cashtracker)
- 📖 Documentation: [docs.cashtracker.com](https://docs.cashtracker.com)

---

**CashTracker** - Kelola Keuangan Lebih Cerdas 🚀
