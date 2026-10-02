# MoneyLover — Expense Tracker Mahasiswa

## Ringkasan

MoneyLover adalah aplikasi web untuk membantu mahasiswa mengelola keuangan pribadi secara sederhana. Pengguna membuat akun, masuk ke aplikasi, mencatat pemasukan dan pengeluaran, lalu melihat identitas akun, saldo, total pemasukan, total pengeluaran, dan transaksi terbaru pada dashboard.

Setiap transaksi dimiliki oleh satu pengguna. Pengguna hanya dapat melihat dan mengelola transaksi miliknya sendiri.

## Teknologi

| Bagian | Teknologi | Kegunaan |
|---|---|---|
| Aplikasi web | Next.js (App Router) | Halaman, Server Actions, dan proteksi rute. |
| Database | PostgreSQL dalam Docker | Penyimpanan akun, session, dan transaksi secara persisten. |
| Akses database | Prisma | Skema, migrasi, dan query database terparameterisasi. |
| Tampilan | React + CSS/Tailwind yang tersedia di proyek | Form dan dashboard responsif. |

## User Stories

| ID | User story |
|---|---|
| US-01 | Sebagai pengunjung, saya ingin mendaftar dengan email dan password agar dapat memiliki akun MoneyLover. |
| US-02 | Sebagai pengguna, saya ingin login dan logout agar hanya saya yang dapat mengakses area pribadi saya. |
| US-03 | Sebagai pengguna, saya ingin session login tetap aktif saat halaman dimuat ulang agar tidak perlu login berulang kali. |
| US-04 | Sebagai pengguna, saya ingin mengelola **CRUD transaksi** pemasukan dan pengeluaran saya agar catatan keuangan tetap benar. |
| US-05 | Sebagai pengguna, saya ingin melihat dashboard berisi identitas akun, saldo, total pemasukan, total pengeluaran, dan transaksi terbaru agar memahami kondisi keuangan saya. |
| US-06 | Sebagai pengguna, saya ingin memfilter transaksi berdasarkan semua, pemasukan, atau pengeluaran agar riwayat lebih mudah dibaca. |
| US-07 | Sebagai pengguna, saya ingin data transaksi saya tidak dapat diakses pengguna lain agar keuangan pribadi tetap aman. |
| US-08 | Sebagai pengguna, saya ingin satu preferensi tampilan tersimpan di cookie agar pilihan saya tetap digunakan saat membuka ulang aplikasi. |

## Requirement MVP

| Area | Requirement | Batas implementasi sederhana |
|---|---|---|
| Register | Pengunjung dapat membuat akun dengan email unik dan password. | Password disimpan sebagai hash, bukan teks asli. |
| Login & logout | Pengguna dapat login dengan email/password yang valid dan logout dari aplikasi. | Login gagal menampilkan pesan aman tanpa menjelaskan apakah email atau password yang salah. |
| Session | Login membuat session dan melindungi dashboard serta Server Action yang memerlukan autentikasi. | Session tetap valid saat reload selama belum kedaluwarsa; logout menghapus session. |
| Dashboard | Dashboard menampilkan identitas akun, saldo, total pemasukan, total pengeluaran, dan transaksi terbaru. | Untuk MVP, identitas akun dapat ditampilkan dari email pengguna. |
| Transaksi (CRUD) | Pengguna dapat menambah, melihat, mengubah, dan menghapus transaksi miliknya dalam satu alur/form sederhana. | Field: jenis (`income`/`expense`), nominal positif, tanggal, dan keterangan. |
| Filter transaksi | Pengguna dapat memilih filter Semua, Pemasukan, atau Pengeluaran. | Filter hanya mengubah daftar transaksi pengguna yang sedang login; tidak perlu halaman terpisah. |
| Otorisasi | Pengguna hanya boleh membaca, mengubah, dan menghapus transaksi miliknya. | Server mengambil identitas pengguna dari session, bukan `user_id` dari browser. |
| Preferensi cookie | Aplikasi menyimpan satu preferensi pengguna di cookie. | Tetapkan tema `light`/`dark`; cookie ini tidak dipakai untuk login. |
| Validasi & umpan balik | Jenis transaksi wajib valid, nominal harus lebih dari nol, dan tanggal wajib diisi. | Form menampilkan pesan berhasil/gagal; hapus meminta konfirmasi. |
| Tampilan | Login, register, dashboard, dan form transaksi dapat dipakai di ponsel maupun desktop. | Cukup responsif dasar, label jelas, dan tidak ada horizontal scroll. |

## Session, Cookie, dan Data Sensitif

| Item | Ketentuan |
|---|---|
| Cookie session | Cookie hanya menyimpan ID session acak. Gunakan `HttpOnly`, `SameSite=Lax`, dan `Secure` ketika aplikasi berjalan melalui HTTPS. |
| Validasi session | Setiap halaman atau aksi privat memvalidasi session di server sebelum membaca atau mengubah data. |
| Cookie preferensi | Menyimpan hanya nilai tema `light` atau `dark`. Cookie preferensi terpisah dari cookie session dan bukan bukti autentikasi. |
| Password & rahasia | Password hanya disimpan sebagai hash. `DATABASE_URL`, password PostgreSQL, dan nilai rahasia lain berada di `.env`, tidak di-commit, dan tidak memakai prefix `NEXT_PUBLIC_`. |
| Kepemilikan data | `user_id` transaksi ditentukan dari session yang valid. Browser tidak boleh mengirim atau memilih pemilik transaksi. |
| Database Docker | PostgreSQL dipakai untuk pengembangan lokal dan port database dibatasi ke `127.0.0.1`; database tidak diekspos ke publik. |

## ERD

Session disimpan di database agar dapat divalidasi dan diakhiri saat logout. Cookie browser hanya membawa ID session, bukan password atau data transaksi. Preferensi tema tetap berada di cookie lokal sehingga tidak memerlukan tabel.

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ TRANSACTION : owns

    USER {
        uuid id PK
        string email UK
        string password_hash
        datetime created_at
    }

    SESSION {
        uuid id PK
        uuid user_id FK
        datetime expires_at
        datetime created_at
    }

    TRANSACTION {
        uuid id PK
        uuid user_id FK
        string type "income | expense"
        decimal amount
        date transaction_date
        text description
        datetime created_at
        datetime updated_at
    }
```

| Relasi / aturan | Ketentuan |
|---|---|
| `USER` → `SESSION` | Satu pengguna dapat memiliki nol atau lebih session; satu session hanya milik satu pengguna. |
| `USER` → `TRANSACTION` | Satu pengguna dapat memiliki nol atau lebih transaksi; satu transaksi hanya milik satu pengguna. |
| Saldo | `total income - total expense` dari transaksi pengguna yang sedang login. Saldo boleh negatif. |
| Riwayat | Transaksi ditampilkan terbaru lebih dahulu berdasarkan tanggal transaksi dan waktu pembuatan. |

## Pembagian Kerja

Inisialisasi Next.js, Docker PostgreSQL, Prisma, environment, dan skema database dasar sudah tersedia. Keduanya fokus menyelesaikan fitur produk, bukan mengulang setup atau mengubah infrastruktur. Setiap developer memiliki direktori sendiri; jangan mengubah file milik developer lain tanpa menyepakati perubahan kontrak terlebih dahulu.

| Developer | Fokus | File yang dimiliki |
|---|---|---|
| **Yuma** | Fitur akun dan session secara utuh: register, login, logout, proteksi rute, serta validasi pengguna aktif. | `src/app/(auth)/**`, `src/app/page.tsx`, `src/actions/auth/**`, `src/lib/auth/**`, `src/lib/users/**`, dan `middleware.ts`. |
| **Fritz** | Fitur keuangan secara utuh: dashboard, CRUD transaksi, filter, ringkasan, tema, dan responsivitas. | `src/app/(dashboard)/**`, `src/actions/transactions/**`, `src/lib/transactions/**`, `src/app/layout.tsx`, `src/app/globals.css`, `src/components/dashboard/**`, `src/components/transactions/**`, dan `src/components/preferences/**`. |

### Tugas Detail

| Developer | Tugas yang harus selesai |
|---|---|
| **Yuma** | Membuat halaman dan Server Action register/login/logout; hash password; membuat, membaca, dan menghapus cookie session; memvalidasi session; mengarahkan pengguna tanpa session dari dashboard ke login; serta menyediakan fungsi `requireSession` untuk fitur Fritz. |
| **Fritz** | Membuat dashboard dengan identitas akun, kartu ringkasan, transaksi terbaru, empty state, filter jenis, form CRUD, konfirmasi hapus, dan toggle tema berbasis cookie. Semua operasi transaksi menggunakan Prisma melalui domain `transactions` dan wajib memanggil `requireSession` dari Yuma. |

## Kontrak Integrasi Yuma ↔ Fritz

Yuma tidak mengubah komponen dashboard Fritz. Fritz tidak mengatur cookie session dan tidak menerima `user_id` dari browser. Fritz boleh memakai Prisma hanya di domain `src/lib/transactions/**`, setelah memanggil `requireSession`. Keduanya memakai kontrak berikut.

| Kontrak | Input | Output yang disepakati | Pemilik |
|---|---|---|---|
| `register` | `email`, `password` | `{ ok, message, fieldErrors? }` | Yuma |
| `login` | `email`, `password` | `{ ok, message }`; session dibuat bila berhasil | Yuma |
| `logout` | Tidak ada | Session dihapus dan pengguna kembali ke login | Yuma |
| `requireSession` | Tidak ada dari browser | `{ userId, userEmail }` atau redirect/penolakan bila session tidak valid | Yuma |
| `getDashboardData` | Tidak ada dari browser | `{ userEmail, totalIncome, totalExpense, balance, transactions }` untuk pengguna yang sedang login | Fritz, memakai `requireSession` |
| `createTransaction` | `type`, `amount`, `transactionDate`, `description` | `{ ok, message, fieldErrors? }` | Fritz, memakai `requireSession` |
| `updateTransaction` | `id`, `type`, `amount`, `transactionDate`, `description` | `{ ok, message, fieldErrors? }` | Fritz, memakai `requireSession` |
| `deleteTransaction` | `id` | `{ ok, message }` | Fritz, memakai `requireSession` |
| Tampilan filter | Daftar transaksi dari `getDashboardData` dan pilihan filter | Hanya menampilkan data yang sesuai di UI | Fritz |
| Toggle tema | Nilai `light`/`dark` | Menulis cookie preferensi dan menerapkan tema | Fritz |

### Aturan Merge

| Situasi | Aturan |
|---|---|
| Perlu mengubah bentuk `requireSession` atau alur session | Yuma memberi tahu Fritz terlebih dahulu; kontrak di atas diperbarui sebelum kode di-merge. |
| Perlu data baru di dashboard | Fritz menambahkannya di domain `transactions` tanpa mengubah autentikasi Yuma. |
| Perubahan skema database atau infrastruktur yang sudah ada | Dibahas dan dikerjakan bergantian; bukan bagian dari tugas fitur default. |
| Konflik pada file bersama | Jangan merge sendiri. Sepakati satu pemilik untuk perubahan tersebut atau lakukan perubahan bergantian. |

## Kriteria Selesai

| ID | Kondisi selesai |
|---|---|
| AC-01 | Pengunjung dapat register, login, dan logout; email duplikat serta login tidak valid ditolak dengan pesan aman. |
| AC-02 | Dashboard dan aksi transaksi tidak dapat diakses tanpa session valid. |
| AC-03 | Session tetap aktif saat reload dan berakhir setelah logout atau kedaluwarsa. |
| AC-04 | Pengguna dapat melakukan CRUD transaksi sendiri dan melihat perubahan pada riwayat serta ringkasan. |
| AC-05 | Filter Semua/Pemasukan/Pengeluaran bekerja pada transaksi pengguna yang sedang login. |
| AC-06 | Pengguna tidak dapat membaca, mengubah, atau menghapus transaksi milik pengguna lain. |
| AC-07 | Tema terang/gelap tersimpan di cookie preferensi dan tetap diterapkan setelah halaman dimuat ulang. |



# MoneyLover — Expense Tracker Mahasiswa (Fase 2)

## Ringkasan

MoneyLover adalah aplikasi web untuk membantu mahasiswa mengelola keuangan pribadi. Pada Fase 2 ini, aplikasi diperluas dengan fitur **Manajemen Anggaran Bulanan (Budgeting)**. Pengguna dapat menetapkan batas anggaran setiap bulannya. Aplikasi akan secara otomatis memantau total pengeluaran dan menampilkan indikator sisa anggaran secara *real-time* (menggunakan pendekatan AJAX / Server Actions tanpa *full page reload*).

Setiap transaksi dan anggaran dimiliki oleh satu pengguna. Pengguna hanya dapat melihat dan mengelola data miliknya sendiri.

## Teknologi
*   Aplikasi web: Next.js (App Router) + Server Actions (implementasi AJAX).
*   Database: PostgreSQL (Docker) + Prisma ORM.
*   Tampilan: React + Tailwind CSS.

## User Stories Tambahan (Fase 2)

| ID | User story |
|---|---|
| US-09 | Sebagai pengguna, saya ingin dapat menetapkan anggaran bulanan agar saya memiliki batas target pengeluaran. |
| US-10 | Sebagai pengguna, saya ingin melihat ringkasan anggaran (total pengeluaran bulanan vs anggaran, serta sisa anggaran) di dashboard. |
| US-11 | Sebagai pengguna, saya ingin melihat indikator visual (status aman/peringatan/melebihi batas) dari penggunaan anggaran saya bulan ini. |
| US-12 | Sebagai pengguna, saya ingin memilih dan memfilter dashboard berdasarkan bulan tertentu, sehingga seluruh data transaksi dan anggaran menyesuaikan dengan bulan tersebut secara mulus (AJAX). |

## ERD (Pembaruan)

Penambahan tabel `BUDGET` untuk menyimpan anggaran bulanan pengguna. Hubungan: Satu Pengguna bisa memiliki banyak Anggaran (satu untuk tiap bulan).

```mermaid
erDiagram
    USER ||--o{ SESSION : has
    USER ||--o{ TRANSACTION : owns
    USER ||--o{ BUDGET : sets

    USER {
        uuid id PK
        string email UK
        string password_hash
    }
    
    TRANSACTION {
        uuid id PK
        uuid user_id FK
        string type "income | expense"
        decimal amount
        date transaction_date
    }

    BUDGET {
        uuid id PK
        uuid user_id FK
        string month_year "Format: YYYY-MM"
        decimal amount
    }
```

## Pembagian Kerja (Yuma, Fritz, Anandra)

Karena tim sekarang bertambah menjadi 3 orang, pembagian tanggung jawab didefinisikan secara spesifik agar tidak terjadi bentrok kode (konflik *merge*).

| Developer | Peran & Fokus | Direktori Utama |
|---|---|---|
| **Yuma** | **Sistem Core & Keamanan**: Menjaga kestabilan *auth*, sesi, dan keamanan *database*. Memastikan fungsi pelindung seperti `requireSession` siap melayani komponen/fungsi baru buatan Anandra. | `(auth)/**`, `lib/auth/**` |
| **Fritz** | **Dashboard Inti & Filter**: Melakukan *refactor* dasbor dan CRUD transaksi agar mendukung filter berbasis waktu (Monthly Filter). Memastikan filter dasbor memuat data secara AJAX / *asinkron*. | `(dashboard)/**`, `lib/transactions/**` |
| **Anandra** | **Manajemen Anggaran (Budget)**: Bertanggung jawab membuat *schema* tabel Budget, logika Server Action untuk *Set Budget*, dan antarmuka komponen indikator anggaran. | `lib/budget/**`, `actions/budget/**`, komponen budget |

### Detail Tugas & Kontrak Kerja

**1. Yuma (Core & Auth)**
*   Memastikan `requireSession` bekerja dengan baik untuk memproteksi API / aksi baru dari Anandra.
*   Tidak banyak fitur UI baru untuk Yuma di fase ini, tapi Yuma bertugas melakukan *review* terhadap logika keamanan yang dibuat oleh Fritz dan Anandra, serta mengelola konfigurasi server/infrastruktur jika ada perubahan.

**2. Fritz (Transaction & Dashboard Filters)**
*   **Tugas UI:** Membuat elemen antarmuka (misal *Dropdown* atau *Date Picker* khusus bulan) di Dashboard untuk memilih Bulan aktif (misalnya: Oktober 2026).
*   **Tugas Logika:** Memperbarui fungsi `getDashboardData` untuk menerima parameter bulan (`monthYear`).
*   **AJAX:** Saat bulan diganti, memuat ulang tabel transaksi dan total pengeluaran untuk bulan tersebut **tanpa me-reload seluruh halaman browser** (bisa memanfaatkan _Search Parameters_ Next.js atau `useTransition`).
*   *Kontrak dengan Anandra:* Fritz akan mengirimkan variabel `monthYear` yang sedang aktif serta angka `totalExpense` bulanan ke dalam komponen UI buatan Anandra.

**3. Anandra (Budgeting Features)**
*   **Database:** Menambahkan skema model `Budget` ke dalam file `schema.prisma`.
*   **Server Actions:** Membuat fungsi `setBudgetAction(monthYear, amount)` dan `getBudgetAction(monthYear)`.
*   **Tugas UI:**
    *   Membuat form modal/komponen **Set Budget** yang memungkinkan user memasukkan target angka.
    *   Membuat komponen **Budget Summary & Indicator**: Menampilkan visualisasi batang progres (*progress bar*). 
        *   Warna **Hijau**: Pengeluaran < 75% dari Anggaran.
        *   Warna **Kuning**: Pengeluaran antara 75% - 99%.
        *   Warna **Merah**: Pengeluaran >= 100% (Over Budget).
*   *Kontrak dengan Fritz:* Komponen Anandra sifatnya menunggu informasi dari Fritz. Komponen Anandra butuh dimasukkan ke dalam halaman dasbor Fritz, menerima `monthYear` dan `totalExpense` sebagai *props* untuk menghitung progres indikator.

## Aturan Kolaborasi & Integrasi
1.  **Pemegang State:** State tentang "Bulan apa yang sedang dilihat user" dipegang oleh Fritz. Anandra hanya membaca state tersebut.
2.  **Migrasi Database:** Perubahan skema `schema.prisma` oleh Anandra wajib diinfokan ke Yuma dan Fritz agar mereka bisa menjalankan `npx prisma db push` atau `npx prisma migrate dev` di mesin lokal masing-masing.
3.  **Tidak Boleh Melangkahi Ranah:** Anandra tidak boleh mengubah kode form transaksi milik Fritz. Fritz tidak boleh membongkar logika kalkulasi *progress bar* milik Anandra. Interaksi harus melalui *Props* React atau Server Actions.
