
import { Asset } from "@/types/asset";
import { AssetDocument } from "@/lib/document-storage";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { loadSystemSettings } from "@/lib/system-settings";

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PDF_MARGIN_MM = 5;

function escapeHtml(value: unknown): string {
  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatArea(asset: Asset): string {
  return asset.luas_m2 == null
    ? "-"
    : asset.luas_m2.toLocaleString("id-ID");
}

function formatCurrency(value: number | null): string {
  return value == null
    ? "-"
    : value.toLocaleString("id-ID");
}

function formatCoordinates(asset: Asset): string {
  if (asset.koordinat_x == null || asset.koordinat_y == null) {
    return "-";
  }

  return `X: ${asset.koordinat_x.toFixed(6)} | Y: ${asset.koordinat_y.toFixed(6)}`;
}

function getPhotos(document?: AssetDocument): string[] {
  return (document?.photos ?? []).filter(
    (photo): photo is string =>
      typeof photo === "string" && photo.startsWith("data:image/"),
  );
}


function getReportSettings() {
  const settings = loadSystemSettings();

  return {
    institutionName: settings.institutionName,
    applicationName: settings.applicationName,
    managingUnit: settings.managingUnit,
    paperSize: settings.paperSize,
    orientation: settings.orientation,
    showLogo: settings.showLogo,
    showPrintDate: settings.showPrintDate,
  };
}


function reportBody(asset: Asset, document?: AssetDocument): string {
  const photos = getPhotos(document);
  const denah = photos[0];
  const additionalPhotos = photos.slice(1, 4);

  const photoSlots = [0, 1, 2]
    .map((index) => {
      const photo = additionalPhotos[index];

      return `
        <div class="photo-slot">
          ${
            photo
              ? `<img src="${photo}" alt="Foto aset ${index + 1}">`
              : `<div class="empty-photo">Foto belum tersedia</div>`
          }
        </div>
      `;
    })
    .join("");

  return `
    <section class="identity">
      <div class="identity-left">
        <div class="identity-row">
          <b>Nama Barang/Aset</b>
          <span>:</span>
          <strong>${escapeHtml(asset.nama_barang_aset)}</strong>
        </div>

        <div class="identity-row">
          <b>No. Register</b>
          <span>:</span>
          <strong>${escapeHtml(asset.no_register)}</strong>
        </div>
      </div>

      <div class="identity-right">
        <div class="identity-row">
          <b>Dinas / OPD</b>
          <span>:</span>
          <strong>${escapeHtml(asset.dinas_opd)}</strong>
        </div>

        <div class="identity-row">
          <b>Lokasi Aset</b>
          <span>:</span>
          <strong>${escapeHtml(asset.lokasi_aset)}</strong>
        </div>

        <div class="identity-row">
          <b>Alamat</b>
          <span>:</span>
          <strong>${escapeHtml(asset.alamat)}</strong>
        </div>
      </div>
    </section>

    <table class="asset-table">
      <colgroup>
        <col style="width:4%">
        <col style="width:13%">
        <col style="width:10%">
        <col style="width:8%">
        <col style="width:9%">
        <col style="width:8%">
        <col style="width:15%">
        <col style="width:8%">
        <col style="width:12%">
        <col style="width:12%">
      </colgroup>

      <thead>
        <tr>
          <th rowspan="3">NO</th>
          <th rowspan="3">Luas (m²)</th>
          <th rowspan="3">Tahun<br>Pengadaan</th>
          <th colspan="3">Status Tanah</th>
          <th rowspan="3">Penggunaan</th>
          <th rowspan="3">Asal usul</th>
          <th rowspan="3">Harga (ribuan Rp)</th>
          <th rowspan="3">Keterangan</th>
        </tr>

        <tr>
          <th rowspan="2">Hak</th>
          <th colspan="2">Sertifikat</th>
        </tr>

        <tr>
          <th>Tgl</th>
          <th>No</th>
        </tr>

        <tr class="number-row">
          <th>1</th>
          <th>2</th>
          <th>3</th>
          <th>4</th>
          <th>5</th>
          <th>6</th>
          <th>7</th>
          <th>8</th>
          <th>9</th>
          <th>10</th>
        </tr>
      </thead>

      <tbody>
        <tr class="asset-data-row">
          <td>${escapeHtml(asset.no || asset.id)}</td>
          <td>${escapeHtml(formatArea(asset))}</td>
          <td>${escapeHtml(asset.tanggal_perolehan)}</td>
          <td>${escapeHtml(asset.hak)}</td>
          <td>${escapeHtml(asset.tanggal_sertifikat)}</td>
          <td>${escapeHtml(asset.no_sertifikat)}</td>
          <td>${escapeHtml(asset.penggunaan)}</td>
          <td>${escapeHtml(asset.asal_usul)}</td>
          <td>${escapeHtml(formatCurrency(asset.nilai_perolehan))}</td>
          <td>${escapeHtml(asset.keterangan)}</td>
        </tr>
      </tbody>
    </table>

    <section class="map-description">
      <div class="map-panel">
        <div class="section-title">Denah Lokasi</div>

        <div class="map-image">
          ${
            denah
              ? `<img src="${denah}" alt="Denah lokasi aset">`
              : `<div class="empty-map">Denah lokasi belum tersedia</div>`
          }
        </div>
      </div>

      <div class="description-panel">
        <div class="section-title">Uraian Singkat</div>

        <div class="description-content">
          <b>Keterangan di Lapangan:</b>
          <p>${escapeHtml(asset.keterangan_di_lapangan)}</p>

          <b>Koordinat:</b>
          <p>${escapeHtml(formatCoordinates(asset))}</p>
        </div>
      </div>
    </section>

    <section class="photo-grid">
      ${photoSlots}
    </section>
  `;
}

function reportHtml(asset: Asset, document?: AssetDocument): string {
  const settings = getReportSettings();

  return `
    <!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8">

        <style>
          * {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            width: ${PAGE_WIDTH}px;
            height: ${PAGE_HEIGHT}px;
            font-family: Tahoma, Arial, Helvetica, sans-serif;
            font-size: 9px;
            color: #000;
            background: #fff;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .report {
            width: ${PAGE_WIDTH}px;
            height: ${PAGE_HEIGHT}px;
            padding: 18px 20px 16px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background: #fff;
            border: 1px solid #000;
          }

          /* HEADER */

          .report-header {
            height: 100px;
            flex: 0 0 100px;
            display: grid;
            grid-template-columns: 86px minmax(0, 1fr) 64px;
            align-items: start;
            border-bottom: 1px solid #000;
            padding: 5px 4px 10px;
          }

          .logo-area {
            display: flex;
            align-items: flex-start;
          }

          .logo {
            width: 72px;
            height: 65px;
            object-fit: contain;
          }

          .header-text {
            text-align: center;
            padding: 0 4px;
          }

          .header-text h1 {
            font-size: 14px;
            line-height: 1.3;
            margin: 7px 0 14px;
            font-weight: 700;
          }

          .header-text h2 {
            font-size: 13px;
            line-height: 1.3;
            margin: 0;
            font-weight: 700;
          }

          .badge {
            width: 56px;
            height: 52px;
            box-sizing: border-box;
            overflow: hidden;
            border: 1.5px solid #000;
            border-radius: 11px;
            background: #a9cbe7;
            display: flex;
            align-items: center;
            justify-content: center;
            padding-bottom: 6px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 32px;
            font-weight: 400;
            line-height: 1;
          }

          /* IDENTITAS ASET: TANPA WARNA LATAR */

          .identity {
            height: 88px;
            flex: 0 0 88px;
            display: grid;
            grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
            gap: 14px;
            padding: 9px 3px 7px;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 9px;
            line-height: 1.35;
            background: #fff;
          }

          .identity-left,
          .identity-right {
            min-width: 0;
          }

          .identity-row {
            display: grid;
            grid-template-columns: 108px 8px minmax(0, 1fr);
            gap: 3px;
            align-items: start;
            margin: 0;
            padding: 4px 0;
            border-bottom: none;
            background: transparent;
          }

          .identity-row b {
            font-weight: 700;
            white-space: normal;
            overflow-wrap: anywhere;
          }

          .identity-row span {
            text-align: center;
          }

          .identity-row strong {
            font-weight: 700;
            overflow-wrap: anywhere;
            word-break: normal;
            background: transparent;
          }

          /* TABEL INVENTARIS */

          .asset-table {
            width: 100%;
            height: 165px;
            flex: 0 0 165px;
            table-layout: fixed;
            border-collapse: collapse;
            font-size: 8px;
          }

          .asset-table th,
          .asset-table td {
            border: 1px solid #000;
            text-align: center;
            vertical-align: middle;
            padding: 3px 2px;
            overflow-wrap: anywhere;
          }

          .asset-table thead th {
            background: #fff;
            color: #000;
            font-weight: 700;
          }

          .asset-table thead tr:first-child {
            height: 30px;
          }

          .asset-table thead tr:nth-child(2) {
            height: 21px;
          }

          .asset-table thead tr:nth-child(3) {
            height: 21px;
          }

          .asset-table .number-row {
            height: 13px;
            font-size: 7px;
            font-style: italic;
          }

          .asset-data-row {
            height: 75px;
          }

          /* DENAH DAN URAIAN */

          .map-description {
            height: 420px;
            flex: 0 0 420px;
            display: grid;
            grid-template-columns: 66% 34%;
            border-bottom: 1px solid #000;
          }

          .map-panel,
          .description-panel {
            min-width: 0;
            display: flex;
            flex-direction: column;
          }

          .map-panel {
            border-right: 1px solid #000;
          }

          .section-title {
            height: 20px;
            flex: 0 0 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid #000;
            font-size: 9px;
            font-weight: 700;
            background: #fff;
          }

          .map-image {
            flex: 1;
            min-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          }

          .map-image img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: contain;
          }

          .empty-map {
            color: #555;
            text-align: center;
          }

          .description-content {
            padding: 13px 8px;
            font-size: 8px;
            line-height: 1.5;
            overflow-wrap: anywhere;
            background: #fff;
          }

          .description-content p {
            margin: 6px 0 14px;
            white-space: pre-wrap;
          }

          /* FOTO ASET */

          .photo-grid {
            height: 300px;
            flex: 0 0 300px;
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            border-bottom: 1px solid #000;
          }

          .photo-slot {
            min-width: 0;
            min-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            border-right: 1px solid #000;
            padding: 5px;
            overflow: hidden;
            background: #fff;
          }

          .photo-slot:last-child {
            border-right: none;
          }

          .photo-slot img {
            display: block;
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .empty-photo {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            color: #555;
            font-size: 9px;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <main class="report">
          <header class="report-header">
            <div class="logo-area">
              ${
                settings.showLogo
                  ? '<img class="logo" src="/logo-pemko.png" alt="Logo Pemerintah Kota Lhokseumawe">'
                  : ""
              }
            </div>

            <div class="header-text">
             <h1>INVENTARISIR ASET TANAH ${escapeHtml(settings.institutionName)}</h1>
<h2>${escapeHtml(settings.managingUnit)}</h2>
            </div>

            <div class="badge">A</div>
          </header>

          ${reportBody(asset, document)}
        </main>
      </body>
    </html>
  `;
}

async function waitForImages(container: HTMLElement): Promise<void> {
  const images = Array.from(container.querySelectorAll("img"));

  await Promise.all(
    images.map(async (image) => {
      if (image.complete && image.naturalWidth > 0) return;

      await new Promise<void>((resolve) => {
        const finish = () => resolve();

        image.addEventListener("load", finish, { once: true });
        image.addEventListener("error", finish, { once: true });
      });
    }),
  );
}

export async function exportAssetToPdf(
  asset: Asset,
  document?: AssetDocument,
): Promise<void> {
  if (typeof window === "undefined") {
    throw new Error("Export PDF hanya dapat dilakukan di browser.");
  }

  const container = window.document.createElement("div");
  container.innerHTML = reportHtml(asset, document);

  container.style.position = "fixed";
  container.style.left = "-10000px";
  container.style.top = "0";
  container.style.width = `${PAGE_WIDTH}px`;
  container.style.height = `${PAGE_HEIGHT}px`;
  container.style.background = "#fff";
  container.style.zIndex = "-1";

  window.document.body.appendChild(container);

  try {
    await waitForImages(container);

    const report = container.querySelector<HTMLElement>(".report");

    if (!report) {
      throw new Error("Konten laporan tidak ditemukan.");
    }

    const canvas = await html2canvas(report, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#fff",
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      windowWidth: PAGE_WIDTH,
      windowHeight: PAGE_HEIGHT,
      logging: false,
    });

   const settings = loadSystemSettings();

const pdf = new jsPDF({
  orientation: settings.orientation,
  unit: "mm",
  format: settings.paperSize === "f4" ? [210, 330] : "a4",
  compress: true,
});

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const availableWidth = pageWidth - PDF_MARGIN_MM * 2;
    const availableHeight = pageHeight - PDF_MARGIN_MM * 2;

    const scale = Math.min(
      availableWidth / canvas.width,
      availableHeight / canvas.height,
    );

    const renderedWidth = canvas.width * scale;
    const renderedHeight = canvas.height * scale;

    const x = (pageWidth - renderedWidth) / 2;
    const y = (pageHeight - renderedHeight) / 2;

    pdf.addImage(
      canvas.toDataURL("image/jpeg", 0.98),
      "JPEG",
      x,
      y,
      renderedWidth,
      renderedHeight,
      undefined,
      "FAST",
    );

    const filename = String(asset.id).replace(
      /[^a-zA-Z0-9_-]/g,
      "-",
    );

    pdf.save(`laporan-aset-${filename}.pdf`);
  } catch (error) {
    console.error("Gagal mengekspor PDF:", error);

    window.alert(
      error instanceof Error
        ? `Gagal membuat PDF: ${error.message}`
        : "Gagal membuat PDF. Silakan coba lagi.",
    );
  } finally {
    container.remove();
  }
}
