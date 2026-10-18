import { Asset } from "@/types/asset";
import { AssetDocument } from "@/lib/document-storage";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function escapeHtml(value: string | number | null): string {
  return String(value ?? "-")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatArea(asset: Asset): string {
  return asset.luas_m2 === null ? "-" : `${asset.luas_m2.toLocaleString("id-ID")} m²`;
}

function formatCurrency(value: number | null): string {
  return value === null ? "-" : `Rp ${value.toLocaleString("id-ID")}`;
}

function coordinateText(asset: Asset): string {
  return asset.koordinat_x === null || asset.koordinat_y === null
    ? "-"
    : `X : ${asset.koordinat_x.toFixed(6)}          Y : ${asset.koordinat_y.toFixed(6)}`;
}

function reportBody(asset: Asset, document?: AssetDocument): string {
  const photos = document?.photos ?? [];
  const denah = photos[0];
  const additionalPhotos = photos.slice(1);
  const coordinates = coordinateText(asset);

  return `
    <table class="asset-table">
      <colgroup><col class="c-no"><col class="c-area"><col class="c-date"><col class="c-right"><col class="c-right"><col class="c-right"><col class="c-use"><col class="c-origin"><col class="c-value"><col class="c-note"></colgroup>
      <tbody>
        <tr><th colspan="2">Nama Barang/Aset</th><td colspan="2">${escapeHtml(asset.nama_barang_aset)}</td><th colspan="2">Dinas / OPD</th><td colspan="4">${escapeHtml(asset.dinas_opd)}</td></tr>
        <tr><th colspan="2">No. Register</th><td colspan="2">${escapeHtml(asset.no_register)}</td><th colspan="2">Lokasi Aset</th><td colspan="4">${escapeHtml(asset.lokasi_aset)}</td></tr>
        <tr><th colspan="6">Alamat</th><td colspan="4">${escapeHtml(asset.alamat)}</td></tr>
        <tr class="section-head"><th>NO</th><th>Luas (m²)</th><th>Tanggal Perolehan</th><th colspan="3">Status Tanah</th><th>Penggunaan</th><th>Asal usul</th><th>Nilai Perolehan</th><th>Keterangan</th></tr>
        <tr class="section-head"><th></th><th></th><th></th><th>Hak</th><th>Tgl Sertifikat</th><th>No</th><th></th><th></th><th></th><th></th></tr>
        <tr class="number-head"><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th></tr>
        <tr class="data-row">
          <td>${escapeHtml(asset.no || asset.id)}</td><td>${escapeHtml(formatArea(asset))}</td><td>${escapeHtml(asset.tanggal_perolehan)}</td><td>${escapeHtml(asset.hak)}</td><td>${escapeHtml(asset.tanggal_sertifikat)}</td><td>${escapeHtml(asset.no_sertifikat)}</td><td>${escapeHtml(asset.penggunaan)}</td><td>${escapeHtml(asset.asal_usul)}</td><td>${escapeHtml(formatCurrency(asset.nilai_perolehan))}</td><td>${escapeHtml(asset.keterangan)}</td>
        </tr>
        <tr><th colspan="7" class="image-title">Denah Lokasi</th><th colspan="3" class="description-title">Uraian Singkat</th></tr>
        <tr><td colspan="7" class="denah">${denah ? `<img src="${denah}" alt="Denah lokasi ${escapeHtml(asset.nama_barang_aset)}">` : "<p>Denah lokasi belum tersedia.</p>"}</td><td colspan="3" class="description"><strong>Keterangan di Lapangan:</strong><br>${escapeHtml(asset.keterangan_di_lapangan || "-")}<br><br><strong>Koordinat:</strong><br>${escapeHtml(coordinates)}</td></tr>
      </tbody>
    </table>
    <div class="photo-heading">Foto Aset</div>
    <div class="photos">${[0, 1, 2].map((photoIndex) => {
      const photo = additionalPhotos[photoIndex];
      return `<figure>${photo ? `<img src="${photo}" alt="Foto aset ${photoIndex + 1}">` : "<p>Foto belum tersedia.</p>"}<figcaption>Foto ${photoIndex + 1}</figcaption></figure>`;
    }).join("")}</div>
  `;
}

function reportHtml(asset: Asset, document?: AssetDocument): string {
  return `<!doctype html>
    <html lang="id">
      <head>
        <meta charset="utf-8">
        <title>Laporan Aset - ${escapeHtml(asset.nama_barang_aset)}</title>
        <style>
          * { box-sizing: border-box; }
          body { margin: 0; color: #111827; font-family: Arial, sans-serif; font-size: 9px; }
          .report { width: 760px; margin: 0 auto; border: 2px solid #111827; padding: 10px; }
          header { display: grid; grid-template-columns: 64px 1fr 58px; align-items: center; border-bottom: 1px solid #111827; padding-bottom: 8px; }
          header img { width: 52px; height: 52px; object-fit: contain; }
          header h1, header h2 { margin: 2px 0; text-align: center; font-size: 13px; }
          header h2 { font-size: 11px; }
          .badge { display: flex; align-items: center; justify-content: center; width: 48px; height: 48px; overflow: hidden; border: 2px solid #111827; border-radius: 11px; background: #a9cbe7; font-size: 30px; font-weight: 400; line-height: 1; padding-bottom: 2px; }
          .asset-table { width: 100%; margin-top: 10px; border-collapse: collapse; table-layout: fixed; font-size: 7px; }
          .asset-table th, .asset-table td { border: 1px solid #9ca3af; padding: 4px; text-align: center; vertical-align: middle; overflow-wrap: anywhere; }
          .asset-table th { background: #f3f4f6; font-weight: 700; }
          .asset-table tr:nth-child(-n+3) th { text-align: left; }
          .asset-table tr:nth-child(-n+3) td { text-align: left; font-weight: 600; }
          .c-no { width: 4%; } .c-area { width: 8%; } .c-date { width: 10%; } .c-right { width: 8%; } .c-use { width: 12%; } .c-origin { width: 9%; } .c-value { width: 10%; } .c-note { width: 15%; }
          .section-head { height: 22px; } .number-head { height: 12px; font-size: 6px; } .data-row { height: 48px; }
          .image-title, .description-title { background: #e5e7eb !important; font-size: 9px; }
          .denah { height: 175px; padding: 4px; } .denah img { display: block; width: 100%; height: 165px; object-fit: contain; }
          .description { height: 175px; text-align: left !important; line-height: 1.5; }
          .photo-heading { margin-top: 8px; border: 1px solid #111827; border-bottom: 0; padding: 5px; background: #e5e7eb; text-align: center; font-size: 9px; }
          .photos { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; border: 1px solid #111827; padding: 6px; min-height: 125px; }
          figure { margin: 0; text-align: center; }
          figure img { display: block; width: 100%; height: 105px; object-fit: contain; border: 1px solid #9ca3af; }
          figcaption { padding-top: 4px; color: #4b5563; }
          p { margin: 8px; color: #6b7280; text-align: center; }
          @media print { @page { size: A4 portrait; margin: 8mm; } .report { border: 0; } }
        </style>
      </head>
      <body><main class="report">
        <header><img src="/logo-pemko.png" alt="Logo Pemko Lhokseumawe"><div><h1>INVENTARISIR ASET TANAH PEMERINTAH KOTA LHOKSEUMAWE</h1><h2>DINAS PERTANAHAN - BIDANG P3T</h2></div><div class="badge">A</div></header>
        ${reportBody(asset, document)}
      </main></body>
    </html>`;
}

export async function exportAssetToPdf(asset: Asset, document?: AssetDocument) {
  const container = window.document.createElement("div");
  container.innerHTML = reportHtml(asset, document);
  container.style.position = "fixed";
  container.style.left = "-100000px";
  container.style.top = "0";
  container.style.width = "760px";
  container.style.background = "white";
  window.document.body.appendChild(container);

  try {
    const images = Array.from(container.querySelectorAll("img"));
    await Promise.all(images.map((image) => image.complete
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
        image.addEventListener("load", () => resolve(), { once: true });
        image.addEventListener("error", () => resolve(), { once: true });
      })));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
    });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    let renderedHeight = 0;
    const image = canvas.toDataURL("image/jpeg", 0.95);

    while (renderedHeight < imageHeight) {
      if (renderedHeight > 0) pdf.addPage();
      pdf.addImage(image, "JPEG", 0, -renderedHeight, pageWidth, imageHeight);
      renderedHeight += pageHeight;
    }
    pdf.save(`laporan-aset-${asset.id}.pdf`);
  } catch (error) {
    console.error("Gagal mengekspor aset ke PDF.", error);
    window.alert("Gagal membuat file PDF. Silakan coba lagi.");
  } finally {
    container.remove();
  }
}
