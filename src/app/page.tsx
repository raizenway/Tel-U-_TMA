"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button
} from "@/components/ui/tab-button";
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
  Plus, Edit2, Trash2, Eye, Loader2, LogOut, Info, Upload, Copy, ExternalLink, ArrowRight
} from "lucide-react";

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

          <Section title="3. Destructive">
            <Button variant="destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Hapus
            </Button>
          </Section>

          <Section title="4. Icon + Label">
            <Button>
              <Plus className="mr-2 w-4 h-4" />
              Tambah Data
            </Button>
          </Section>

          <Section title="5. Icon Only">
            <Button variant="ghost" size="icon"><Edit2 className="h-4 w-4" /></Button>
            <Button variant="outline" size="icon"><Eye className="h-4 w-4" /></Button>
            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
          </Section>

          <Section title="6. Loading Button">
            <Button disabled>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Loading...
            </Button>
          </Section>

          <Section title="7. Ukuran Tombol">
            <Button size="sm">Kecil</Button>
            <Button size="default">Normal</Button>
            <Button size="lg">Besar</Button>
          </Section>

          <Section title="8. Full Width">
            <Button className="w-full justify-center">
              <ArrowRight className="h-4 w-4 mr-2" />
              Lanjut
            </Button>
          </Section>

          <Section title="9. Disabled">
            <Button disabled>Tidak Bisa Diklik</Button>
          </Section>

          <Section title="10. Toggle Button">
            <Button variant={toggle ? "default" : "outline"} onClick={() => setToggle(!toggle)}>
              {toggle ? "Aktif" : "Nonaktif"}
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
                <Button variant="destructive">Hapus Akun</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Yakin ingin menghapus akun?</DialogTitle>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="ghost">Batal</Button>
                  <Button variant="destructive" onClick={() => alert("Dihapus")}>Hapus</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </Section>

          <Section title="13. Upload File">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
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
            <Button onClick={() => router.push("/dashboard")}>
              <ExternalLink className="mr-2 h-4 w-4" />
              Ke Dashboard
            </Button>
          </Section>

          <Section title="16. Tooltip Button">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon">
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
              <Button variant="default">1</Button>
              <Button variant="outline">Next</Button>
            </div>
          </Section>

        </div>
      </div>
    </TooltipProvider>
  );
}
