# Panduan Integrasi BE

> **Author** : Hari <br> **Date** : 27 Aug 2025 <br> **Version** : 1.0


Project Transformation Maturity Assessment Telkom University

## 🌟Prerequisite
1. 🟩Node JS v22.0.0 or higher
2. 🦁Nest JS v11.0.1 or higher
3. 🚀Postman v11.60.1 or higher
4. 🐘PostgreSQL v16.4 or higher
5. 🔗Git Bash

## 📑Cheat Sheet

> **Migrasi** <br> Migrasi merupakan mekanisme untuk mengatur perubahan struktur database.

> **Seeder** <br> Seeder merupakan mekanisme penambahan data ke dalam skema database. Biasa digunakan untuk data awal/inisiasi
### 🤖 Daftar Command 
```bash
npx prisma migrate reset
```
- Menghapus semua data
- Menjalankan semua file migrasi dari awal

```bash
npx prisma migrate deploy
```
- Menjalankan semua file migrasi yang belum di-_run_

```bash
npx prisma migrate status
```
- Menampilkan migrasi mana yang sudah/belum diterapkan
```bash
npx prisma db seed
```
- Menjalankan file seeder yang tersedia

## 🪜 Tahapan Integrasi
### 1. Lakukan clone dari repository BE berikut: [GitHub](https://github.com/jokopurnomoa/tma-be/tree/dev) 😺
### 2. Buka folder project 📂
Buka hasil clone tersebut di komputer kita, bisa melalui IDE seperti VS Code
### 3. Install aplikasi 📦
Install menggunakan perintah berikut di command prompt
```bash
npm install
```
### 4. Konfigurasi ENV 🔧
Buat file `.env` pada root project dengan isi sebagai berikut:
```bash
DATABASE_URL="postgresql://postgres:admin@localhost:5432/tma"

# Keterangan
#postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```
### 5. Setup Database 🗄️
1. Buat database bernama `tma` melalui pgAdmin4
2. Jalankan migrasi dengan perintah

    ```bash
    npx prisma migrate reset
    ```
3. Jalankan data seeder dengan perintah

    ```bash
    npx prisma db seed
    ```
Konfirmasi kembali skema database anda melalui pgAdmin4
### 6. Jalankan aplikasi tma-be 🏃‍♂️
Anda dapat menjalankan aplikasi melalui perintah berikut
```bash
npm run start:dev   # mode development
#atau
npm run start       # mode production
```
### 7. Uji Coba *Endpoint* 🧪
Anda dapat menguji Endpoint dari tma-be menggunakan *collection* Postman

1. Unduh [collection](https://trello.com/c/MpkZtZZj) terbaru
2. Buka aplikasi Postman
3. Import collection

    Buka **Menu** > **Import** > **Pilih Workspace** > **Pilih File Collection yang Telah Diunduh**

4. Menjalankan *Endpoint*
    
    Pada Postman buka folder **User Management** > **List User** > **Klik 'Send'**
1. Jika Aplikasi berjalan, Anda akan mendapatkan respon berstatus '***success***' dengan berisi daftar user
1. Anda dapat melihat field/payload yang dikirim ke API melalui subbagian **Body** > **raw**


### 8. Aplikasi telah berjalan 🎉

Aplikasi telah berjalan dan Anda bisa mengakses *database* menggunakan API/Entrypoint yang sudah disiapkan oleh aplikasi `tma-be`

Contoh fungsi FE yang menggunakan API

### 📥handleLogin
```ts
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Akses Entrypoint API menggunakan fetch
      const res = await fetch('http://localhost:3000/api/auth/login', {
        // Metode seperti: POST, GET, PUT
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Payload yang dikirimkan
        body: JSON.stringify({ username, password }),
      });

      // Menerima hasil dari fetch
      const result = await res.json();

      // Aksi dari respon yang diterima
      if (result.status === 'success') {
        localStorage.setItem('user', JSON.stringify(result.data));
        router.push('/welcome');
      } else {
        setError(result.message || 'Login gagal');
      }
    } catch {
      setError('Terjadi kesalahan, coba lagi');
    } finally {
      setLoading(false);
    }
  };

```
