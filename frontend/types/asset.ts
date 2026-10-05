export interface Asset {
  id: number;

  // Identitas aset
  no: number;
  no_register: number | string;
  nama_barang_aset: string;

  // Instansi dan lokasi
  dinas_opd: string;
  lokasi_aset: string;
  alamat: string;

  // Data tanah
  luas_m2: number | null;
  tanggal_perolehan: string;
  hak: string;
  tanggal_sertifikat: string;
  no_sertifikat: string;

  // Penggunaan dan nilai
  penggunaan: string;
  asal_usul: string;
  nilai_perolehan: number | null;
  keterangan: string;

  // Kondisi lapangan
  keterangan_di_lapangan: string;

  // Koordinat
  koordinat_x: number | null;
  koordinat_y: number | null;
}