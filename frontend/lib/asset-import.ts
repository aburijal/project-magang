import * as XLSX from "xlsx";
import ExcelJS from "exceljs";
import { Asset } from "@/types/asset";

export interface AssetImportPreview {
  rowNumber: number;
  asset: Asset | null;
  error: string | null;
  photos: string[];
  existingAssetId?: number;
  warning?: string;
}

const headerAliases: Record<keyof Omit<Asset, "id">, string[]> = {
  no: ["no", "nomor", "nomor urut"],
  no_register: ["no register", "nomor register", "register"],
  nama_barang_aset: ["nama aset", "nama barang/aset", "nama barang", "aset"],
  dinas_opd: ["dinas / opd", "dinas/opd", "dinas", "opd"],
  lokasi_aset: ["lokasi aset", "lokasi", "kecamatan"],
  alamat: ["alamat"],
  luas_m2: ["luas", "luas m2", "luas (m2)", "luas (m²)"],
  tanggal_perolehan: ["tanggal perolehan", "tgl perolehan"],
  hak: ["hak", "status tanah"],
  tanggal_sertifikat: ["tanggal sertifikat", "tgl sertifikat"],
  no_sertifikat: ["nomor sertifikat", "no sertifikat", "no. sertifikat"],
  penggunaan: ["penggunaan"],
  asal_usul: ["asal usul", "asal-usul"],
  nilai_perolehan: ["nilai perolehan", "nilai"],
  keterangan: ["keterangan", "catatan"],
  keterangan_di_lapangan: ["keterangan di lapangan", "keterangan lapangan"],
  koordinat_x: ["koordinat x", "latitude", "lintang"],
  koordinat_y: ["koordinat y", "longitude", "bujur"],
};

function normalizeHeader(value: unknown): string {
  return String(value ?? "").trim().toLowerCase().replace(/[._-]+/g, " ").replace(/\s+/g, " ");
}

function getValue(row: unknown[], columns: Partial<Record<keyof Omit<Asset, "id">, number>>, key: keyof Omit<Asset, "id">): unknown {
  const index = columns[key];
  return index === undefined ? "" : row[index];
}

function textValue(value: unknown, fallback = "-"): string {
  const text = String(value ?? "").trim();
  return text || fallback;
}

function numberValue(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") return null;
  const text = String(value).trim().replace(/\s/g, "");
  const normalized = text.includes(",")
    ? text.replace(/\./g, "").replace(/,/g, "")
    : text;
  const parsed = typeof value === "number" ? value : Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function dateValue(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return `${String(value.getDate()).padStart(2, "0")}/${String(value.getMonth() + 1).padStart(2, "0")}/${value.getFullYear()}`;
  }
  if (typeof value === "number") {
    const date = XLSX.SSF.parse_date_code(value);
    if (date) return `${String(date.d).padStart(2, "0")}/${String(date.m).padStart(2, "0")}/${date.y}`;
  }
  return textValue(value);
}

function cellValue(sheet: XLSX.WorkSheet, address: string): unknown {
  return sheet[address]?.v ?? "";
}

function coordinateValues(value: unknown): { x: number | null; y: number | null } {
  const text = String(value ?? "");
  const match = text.match(/X\s*:\s*(-?\d+(?:[.,]\d+)?)\s+Y\s*:\s*(-?\d+(?:[.,]\d+)?)/i);
  if (!match) return { x: null, y: null };
  return {
    x: Number(match[1].replace(",", ".")),
    y: Number(match[2].replace(",", ".")),
  };
}

function bufferToDataUrl(buffer: Uint8Array, extension: string): string {
  let binary = "";
  const chunkSize = 0x8000;
  for (let index = 0; index < buffer.length; index += chunkSize) {
    binary += String.fromCharCode(...buffer.subarray(index, index + chunkSize));
  }
  const mimeType = extension === "png" ? "image/png" : extension === "gif" ? "image/gif" : "image/jpeg";
  return `data:${mimeType};base64,${btoa(binary)}`;
}

async function extractSheetPhotos(workbook: ExcelJS.Workbook, sheetName: string): Promise<string[]> {
  const worksheet = workbook.getWorksheet(sheetName);
  if (!worksheet) return [];

  const images = worksheet.getImages()
    .filter((image) => image.range.tl.row >= 5)
    .sort((left, right) => left.range.tl.row - right.range.tl.row || left.range.tl.col - right.range.tl.col);

  return images.flatMap((image) => {
    const workbookImage = workbook.getImage(Number(image.imageId));
    if (workbookImage.base64) {
      return [workbookImage.base64.startsWith("data:") ? workbookImage.base64 : `data:image/${workbookImage.extension};base64,${workbookImage.base64}`];
    }
    if (workbookImage.buffer) {
      return [bufferToDataUrl(new Uint8Array(workbookImage.buffer), workbookImage.extension)];
    }
    return [];
  });
}

function isReportSheet(sheet: XLSX.WorkSheet): boolean {
  return normalizeHeader(cellValue(sheet, "B5")) === "nama barang/aset";
}

function sameAssetDetails(left: Asset, right: Asset): boolean {
  const keys: Array<keyof Omit<Asset, "id">> = [
    "no", "no_register", "nama_barang_aset", "dinas_opd", "lokasi_aset", "alamat",
    "luas_m2", "tanggal_perolehan", "hak", "tanggal_sertifikat", "no_sertifikat",
    "penggunaan", "asal_usul", "nilai_perolehan", "keterangan", "keterangan_di_lapangan",
    "koordinat_x", "koordinat_y",
  ];
  return keys.every((key) => String(left[key] ?? "").trim() === String(right[key] ?? "").trim());
}

function reportSheetPreview(
  sheet: XLSX.WorkSheet,
  sheetName: string,
  existingAssets: Asset[],
  nextId: number,
  offset: number,
  photos: string[],
): AssetImportPreview {
  const register = textValue(cellValue(sheet, "E6"), "");
  const name = textValue(cellValue(sheet, "E5"), "");
  const address = textValue(cellValue(sheet, "L7"), "");
  const coordinates = coordinateValues(cellValue(sheet, "L16"));
  const asset: Asset = {
    id: nextId + offset + 1,
    no: numberValue(cellValue(sheet, "B13")) ?? nextId + offset + 1,
    no_register: register || nextId + offset + 1,
    nama_barang_aset: name,
    dinas_opd: textValue(cellValue(sheet, "L5")),
    lokasi_aset: textValue(cellValue(sheet, "L6")),
    alamat: address,
    luas_m2: numberValue(cellValue(sheet, "C13")),
    tanggal_perolehan: dateValue(cellValue(sheet, "E13")),
    hak: textValue(cellValue(sheet, "F13")),
    tanggal_sertifikat: dateValue(cellValue(sheet, "G13")),
    no_sertifikat: textValue(cellValue(sheet, "H13")),
    penggunaan: textValue(cellValue(sheet, "I13")),
    asal_usul: textValue(cellValue(sheet, "L13")),
    nilai_perolehan: numberValue(cellValue(sheet, "M13")),
    keterangan: textValue(cellValue(sheet, "N13")),
    keterangan_di_lapangan: textValue(cellValue(sheet, "L17"), ""),
    koordinat_x: coordinates.x,
    koordinat_y: coordinates.y,
  };
  const hasIdentifier = Boolean(register || asset.no_sertifikat !== "-");
  const identifierMatch = existingAssets.find((existing) => (
    (register && String(existing.no_register).trim() === register)
    || (asset.no_sertifikat !== "-" && existing.no_sertifikat === asset.no_sertifikat)
  ));
  const existingAsset = hasIdentifier && identifierMatch && sameAssetDetails(asset, identifierMatch)
    ? identifierMatch
    : undefined;
  let error: string | null = null;
  let warning: string | undefined;

  if (!name || !address) error = "Nama aset dan alamat wajib diisi.";
  else if (existingAsset) error = `${sheetName}: data identik sudah ada; aset tidak dibuat ulang, foto akan ditambahkan.`;
  else if (identifierMatch) warning = `${sheetName}: register atau sertifikat sama, tetapi detail berbeda; disimpan sebagai aset terpisah.`;

  return {
    rowNumber: offset + 1,
    asset: { ...asset, id: existingAsset?.id ?? asset.id },
    error: error ? `${sheetName}: ${error}` : null,
    photos,
    existingAssetId: existingAsset?.id,
    warning,
  };
}

export async function previewAssetImport(file: File, existingAssets: Asset[]): Promise<AssetImportPreview[]> {
  const arrayBuffer = await file.arrayBuffer();
  const workbook = XLSX.read(arrayBuffer, { cellDates: true });
  const imageWorkbook = new ExcelJS.Workbook();
  await imageWorkbook.xlsx.load(arrayBuffer);
  const reportSheets = workbook.SheetNames
    .map((name) => ({ name, sheet: workbook.Sheets[name] }))
    .filter(({ sheet }) => sheet && isReportSheet(sheet));
  const nextId = Math.max(0, ...existingAssets.map((asset) => asset.id));

  if (reportSheets.length) {
    return Promise.all(reportSheets.map(async ({ name, sheet }, index) => reportSheetPreview(
      sheet,
      name,
      existingAssets,
      nextId,
      index,
      await extractSheetPhotos(imageWorkbook, name),
    )));
  }

  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) throw new Error("Sheet pertama pada file Excel tidak ditemukan.");

  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: "" });
  const assetKeys = Object.keys(headerAliases) as Array<keyof Omit<Asset, "id">>;
  const headerCandidates = rows.map((row, rowIndex) => {
    const columns: Partial<Record<keyof Omit<Asset, "id">, number>> = {};
    row.forEach((cell, index) => {
      const header = normalizeHeader(cell);
      const key = assetKeys.find((item) => headerAliases[item].includes(header));
      if (key) columns[key] = index;
    });
    return { rowIndex, columns, score: Object.keys(columns).length };
  }).filter((candidate) => candidate.columns.nama_barang_aset !== undefined);
  const header = headerCandidates.sort((left, right) => right.score - left.score)[0];
  if (!header || header.score < 2) {
    throw new Error("Header Excel tidak dikenali. Pastikan file memiliki kolom Nama Aset dan Alamat.");
  }
  const headerRow = header.rowIndex;
  const columns = header.columns;

  const existingRegisters = new Set(existingAssets.map((asset) => String(asset.no_register).trim()).filter(Boolean));
  const importedRegisters = new Set<string>();

  const previews = rows.slice(headerRow + 1)
    .map((row, index) => {
      const rowNumber = headerRow + index + 2;
      if (row.every((cell) => String(cell ?? "").trim() === "")) return null;

      const name = textValue(getValue(row, columns, "nama_barang_aset"), "");
      const address = textValue(getValue(row, columns, "alamat"), "");
      const register = textValue(getValue(row, columns, "no_register"), "");
      let error: string | null = null;
      if (!name || !address) error = "Nama aset dan alamat wajib diisi.";
      else if (register && existingRegisters.has(register)) error = `Nomor register ${register} sudah ada.`;
      else if (register && importedRegisters.has(register)) error = `Nomor register ${register} duplikat di file.`;

      if (register) importedRegisters.add(register);
      const asset: Asset = {
        id: nextId + index + 1,
        no: numberValue(getValue(row, columns, "no")) ?? nextId + index + 1,
        no_register: register || nextId + index + 1,
        nama_barang_aset: name,
        dinas_opd: textValue(getValue(row, columns, "dinas_opd")),
        lokasi_aset: textValue(getValue(row, columns, "lokasi_aset")),
        alamat: address,
        luas_m2: numberValue(getValue(row, columns, "luas_m2")),
        tanggal_perolehan: dateValue(getValue(row, columns, "tanggal_perolehan")),
        hak: textValue(getValue(row, columns, "hak")),
        tanggal_sertifikat: dateValue(getValue(row, columns, "tanggal_sertifikat")),
        no_sertifikat: textValue(getValue(row, columns, "no_sertifikat")),
        penggunaan: textValue(getValue(row, columns, "penggunaan")),
        asal_usul: textValue(getValue(row, columns, "asal_usul")),
        nilai_perolehan: numberValue(getValue(row, columns, "nilai_perolehan")),
        keterangan: textValue(getValue(row, columns, "keterangan")),
        keterangan_di_lapangan: textValue(getValue(row, columns, "keterangan_di_lapangan"), ""),
        koordinat_x: numberValue(getValue(row, columns, "koordinat_x")),
        koordinat_y: numberValue(getValue(row, columns, "koordinat_y")),
      };
      return { rowNumber, asset, error, photos: [] };
    })
  return previews.filter((item): item is NonNullable<typeof item> => item !== null);
}
