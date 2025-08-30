//import TableButton from '@/components/Tablebutton';

//Tambah kan di atas retrun 
//sesuaikan dengan isi table nya
//const dataForExport = currentData.map((item, index) => ({
  //Nomor: startIndex + index + 1,
  //'Nama Variable': item.nama,
  //Variable: item.variable,
  //Bobot: item.bobot,
  //Pertanyaan: item.pertanyaan,
  //Deskripsi: item.deskripsi,
  //Referensi: item.referensi,
  //'Logo URL': item.logoUrl || '-',
 //Aksi: item.status === 'Active' ? 'Edit, Nonaktifkan' : 'Edit, Aktifkan'
//}));

//cara pemakaian
//ganti button search ,print dan dwonload menjadi seperti ini
//jadi si dataforExport tuh ambil nya dari const data export dan columnsadalah isi apa yang mau kita tambahkan atau print download dan lain lain
//jadi contoh nya kita ambil data nih nah kita tuh mau ambil data apa ajah nah si data export tuh pungsi nya adalah memberikan list atau mendefinsikan 
//oh dta kamu tuh ada apa aja nih kan disini ada nomor variable bobot dll 
//nah si columns tuh tugas nya memuncul atau ngambil yang ingin di muncul kan oh ada apa ajah ni list ny misal kan kamu tidak perlu nih si aksi maka 
//di column nya kamu jangan ambil si aksi nih nah otomatis aksi akan di hilngakan ketika kamu akan print dll
//<TableButton 
 //data={dataForExport}
 //columns={['Nomor', 'Nama Variable', 'Variable', 'Bobot', 'Pertanyaan', 'Deskripsi', 'Referensi', 'Logo URL', 'Aksi']}
///>