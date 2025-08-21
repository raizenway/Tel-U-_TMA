  "use client";

  import { useState } from "react";
  import { useRouter } from "next/navigation";
  
  
  
  import {
    Tooltip,
    TooltipProvider,
    TooltipTrigger,
    TooltipContent
  } from "@/components/ui/tooltip";
  import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
  } from "@/components/ui/dropdown-menu";
  import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
  } from "@/components/ui/dialog";
import {
    Plus, Edit2, Trash2, Eye, Loader2, LogOut, Info, Upload, Copy, ExternalLink, ArrowRight,
    DoorOpen,
    ArrowLeft,
    Printer,
    Search,
    ChevronDown,
    ChevronRight
  } from "lucide-react";
  import Button  from "@/components/button"
  import { X, Save} from "lucide-react";


  function Section({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div>
        <h2 className="text-lg font-semibold mb-2">{title}</h2>
        <div className="bg-gray-50 p-4 rounded-lg border space-x-2 space-y-2">{children}</div>
      </div>
    );
  }

  // | No | Kategori              | Penjelasan                        |
  // | -- | --------------------- | --------------------------------- |
  // | 1  | **Default**           | Tombol biasa                      |
  // | 2  | **Outline & Ghost**   | Tombol dengan style minimalis     |
  // | 3  | **Destructive**       | Tombol berbahaya (hapus, dll)     |
  // | 4  | **Icon + Label**      | Tombol dengan ikon dan teks       |
  // | 5  | **Icon Only**         | Tombol hanya ikon (action cepat)  |
  // | 6  | **Loading Button**    | Menampilkan animasi loading       |
  // | 7  | **Ukuran Tombol**     | Variasi ukuran: sm, default, lg   |
  // | 8  | **Full Width**        | Tombol selebar container          |
  // | 9  | **Disabled**          | Tidak bisa diklik                 |
  // | 10 | **Toggle**            | Toggle antara aktif/nonaktif      |
  // | 11 | **Dropdown Menu**     | Aksi pilihan pakai dropdown       |
  // | 12 | **Dialog**            | Konfirmasi dialog sebelum aksi    |
  // | 13 | **Upload File**       | Tombol bertema upload             |
  // | 14 | **Copy ke Clipboard** | Menyalin teks ke clipboard        |
  // | 15 | **Link ke Halaman**   | Arahkan ke halaman lain           |
  // | 16 | **Tooltip**           | Info tambahan saat hover          |
  // | 17 | **Warna Custom**      | Style tombol bebas pakai Tailwind |
  // | 18 | **Button Group**      | Tombol grup untuk navigasi        |


  export default function UniversalButtonPage() {
    const [toggle, setToggle] = useState(false);
    const router = useRouter();

    const handleDownload = () => {
  // Helper untuk escape karakter tab atau newline
  const escapeTSV = (value) => {
    if (typeof value === "string") {
      return value.replace(/\t/g, " ").replace(/\n/g, " ");
    }
    return value ?? "";
  };

  const tsv =
    columns.map((col) => escapeTSV(col.header)).join("\t") +
    "\n" +
    filteredData
      .map((row, i) =>
        columns
          .map((col) =>
            col.key === "nomor"
              ? i + 1 // kalau mau pagination: (i + 1) + (currentPage - 1) * rowsPerPage
              : escapeTSV(row[col.key])
          )
          .join("\t")
      )
      .join("\n");

  const blob = new Blob([tsv], { type: "text/tab-separated-values;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "tabel.tsv";
  document.body.appendChild(a); // biar kompatibel di Firefox
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

    

    const handlePrint = () => window.print();

    const handleCopy = () => {
      navigator.clipboard.writeText("Teks berhasil disalin!");
      alert("Teks disalin ke clipboard!");
    };

    return (
      <TooltipProvider>
        <div className="min-h-screen bg-white p-10">
          <h1 className="text-3xl font-bold mb-10">🎛️ Demo Tombol Universal Lengkap</h1>
          <div className="grid gap-8">

            <Section title="1. Default">
              <Button>Click Me</Button>
            </Section>

            <Section title="2. Outline & Ghost">
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
            </Section>

            

            <Section title="4. Icon + Label">
              <Button variant="simpan"
               icon={ChevronDown}
              iconPosition="right"
              className="px-5">
              Tambah User
              </Button>
            </Section>

            <Section title="5. Icon Only">
              <Button variant="ghost" ><Edit2 className="h-4 w-4" /></Button>
              <Button variant="outline" ><Eye className="h-4 w-4" /></Button>
            </Section>

            <Section title="6. Loading Button">
              <Button disabled>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Loading...
              </Button>
            </Section>

            <Section title="7. Ukuran Tombol">
              <Button size="sm">Kecil</Button>  
              <Button size="lg">Besar</Button>
            </Section>

            <Section title="8. Full Width">
              <Button className="w-full justify-center">
                <ArrowRight className="h-4 w-4 mr-2" />
                Lanjut
              </Button>
            </Section>

            <Section title="9. tidak bisa di simpan sebelum mengisi">
              <Button disabled
                variant="simpan"
                icon={Save}
                iconPosition="left"
                className="rounded-[12px] px-10 py-2 text-sm font-semibold "
              >
                Simpan
              </Button>            
            </Section>

            

            <Section title="11. Dropdown Menu">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">Pilih Aksi</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => alert("Edit")}>Edit</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert("Hapus")}>Hapus</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => alert("Logout")}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Section>

            <Section title="12. Dialog Konfirmasi">
              <Dialog>
                <DialogTrigger asChild>
                 
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Yakin ingin menghapus akun?</DialogTitle>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="ghost">Batal</Button>
                   
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </Section>

            <Section title="13. Upload File">
              <Button>
                <Upload className="flex items-center mr-2 h-4 w-4"/>
                Upload File
              </Button>
            </Section>

            <Section title="14. Copy ke Clipboard">
              <Button onClick={handleCopy}>
                <Copy className="mr-2 h-4 w-4" />
                Salin Teks
              </Button>
            </Section>

            <Section title="15. Link ke Halaman">
              <Button
                onClick={() => router.push("/dashboard")}
                variant="primary"
                icon={ExternalLink}
                iconPosition="left"
              >
                Ke Dashboard
              </Button> 

              <Button
                variant="success"
                icon={DoorOpen} 
                iconPosition="right"
                className="text-blue-500"
              >
                uji coba
              </Button>
            </Section>

            <Section title="16. Tooltip Button">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" >
                    <Info className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Info tambahan</TooltipContent>
              </Tooltip>
            </Section>

            <Section title="17. Warna Custom (Tailwind)">
              <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">Tombol Kuning</Button>
              <Button className="bg-purple-600 hover:bg-purple-700 text-white">Tombol Ungu</Button>
            </Section>

            <Section title="18. Button Group">
              <div className="inline-flex rounded-md shadow-sm" role="group">
                <Button variant="outline">Prev</Button>
                
                <Button variant="outline">Next</Button>
              </div>
            </Section>      

            <Section title="19. Button Simpan">
<Button
  variant="ghost"
  icon={X}
  iconColor="text-red-600"
  iconPosition="left"
  className="rounded-[12px] px-17 py-2 text-sm font-semibold text-[#263859] hover:bg-gray-100 border border-[#263859]"
>
  Batal
</Button>

              <Button
                variant="simpan"
                icon={Save}
                iconPosition="left"
                className="rounded-[12px] px-17 py-2 text-sm font-semibold"
              >
                Simpan
              </Button>
            </Section>

            <Section title="20. approval">
              <Button variant="success" className=" px-14  bg-green-100 text-green-800">Approval</Button>
              <Button variant="danger" className=" px-16 bg-red-100 text-red-800">Revisi</Button>
            </Section>

            
            <Section title="22. Tutup">
              <Button variant="simpan" className="px-30 py-2 text-lg rounded-md">
              Tutup
              </Button>
            </Section>
             
             <Section title="23. Start Assessment">
              <Button 
              variant="outline"
              icon={X}
              iconColor="text-red-600"
              iconPosition="left"
              className="px-14 text-red-600 border-red-500 hover:bg-red-100"
              >
              Batal
              </Button>

              <Button 
              variant="outline"
              icon={ArrowLeft}
              iconColor="text-red-600"
              iconPosition="left"
              className="px-8"
              >
              Previous Question
              </Button>

              <Button 
              variant="simpan"
              icon={ArrowRight}
              iconPosition="right"
              className="px-8"
              >
                Next Question
                </Button>
            </Section>

            <Section title="24. Copy">
              <Button
               variant="outline"
               icon={Copy}
              iconPosition="left" 
              onClick={handleCopy}
               >
                Copy
                </Button>
                 <Button
               variant="outline"
               icon={Printer}
              iconPosition="left" 
              onClick={handlePrint}
               >
                Print
                </Button>
                 <div className="flex items-center gap-2 border rounded-lg px-3 py-2 w-64 bg-gray-100">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Cari"
                  className="flex-1 outline-none text-sm text-gray-700 bg-transparent"
                  onChange={(e) => console.log("Search:", e.target.value)}
                 />
                </div>
                 <Button
               variant="outline"
               icon={ChevronDown}
              iconPosition="right" 
                  onClick={handleDownload}
               >
                Download
                </Button>
            </Section>
            
            <Section title="25. Lihat Details">
             <Button
              variant="outline"
              icon={ChevronRight}
              iconPosition="right" 
              onClick={handleDownload}              >
                Lihat detail
              </Button>
            </Section>

          </div>
        </div>
      </TooltipProvider>
    );
  }
