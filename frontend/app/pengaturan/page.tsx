"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";
import { defaultSystemSettings, loadSystemSettings, saveSystemSettings, SystemSettings } from "@/lib/system-settings";

export default function PengaturanPage() {
  const [saved, setSaved] = useState(false);
  const [settings, setSettings] = useState<SystemSettings>(defaultSystemSettings);

  useEffect(() => {
    // localStorage hanya tersedia di browser, sehingga konfigurasi perlu disinkronkan setelah mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSettings(loadSystemSettings());
  }, []);

  function updateSetting<Key extends keyof SystemSettings>(key: Key, value: SystemSettings[Key]) {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaved(false);
  }

  function handleSave() {
    saveSystemSettings(settings);
    setSaved(true);
  }

  return (
    <AppLayout>
      <div className="mx-auto max-w-5xl space-y-6">
       
<header className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#315F86]">
    Konfigurasi aplikasi
  </p>
  <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#193B5A] sm:text-3xl">
    Pengaturan Sistem
  </h1>
  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500">
    Kelola identitas resmi dan format laporan yang digunakan pada dokumen PDF.
  </p>
</header>

<section className="overflow-hidden rounded-2xl border border-[#D7E4F0] bg-white shadow-sm">
  <div className="border-b border-[#D7E4F0] bg-[#F4F8FC] px-6 py-5">
    <h2 className="text-base font-bold text-[#193B5A]">
      Identitas instansi
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      Informasi ini akan tampil pada header laporan.
    </p>
  </div>

  <div className="grid gap-5 p-6 md:grid-cols-2">
    <label className="block text-sm font-medium text-slate-700">
      Nama instansi
      <input
        value={settings.institutionName}
        onChange={(event) =>
          updateSetting("institutionName", event.target.value)
        }
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
      />
    </label>

    <label className="block text-sm font-medium text-slate-700">
      Nama aplikasi
      <input
        value={settings.applicationName}
        onChange={(event) =>
          updateSetting("applicationName", event.target.value)
        }
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
      />
    </label>

    <label className="block text-sm font-medium text-slate-700 md:col-span-2">
      Unit pengelola
      <input
        value={settings.managingUnit}
        onChange={(event) =>
          updateSetting("managingUnit", event.target.value)
        }
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm font-normal text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
      />
    </label>
  </div>
</section>

<section className="overflow-hidden rounded-2xl border border-[#D7E4F0] bg-white shadow-sm">
  <div className="border-b border-[#D7E4F0] bg-[#F4F8FC] px-6 py-5">
    <h2 className="text-base font-bold text-[#193B5A]">
      Format Laporan PDF
    </h2>
    <p className="mt-1 text-sm text-slate-500">
      Atur ukuran halaman dan informasi yang ditampilkan saat laporan dicetak.
    </p>
  </div>

  <div className="grid gap-5 p-6 md:grid-cols-2">
    <label className="block text-sm font-medium text-slate-700">
      Ukuran kertas
      <select
        value={settings.paperSize}
        onChange={(event) =>
          updateSetting(
            "paperSize",
            event.target.value as SystemSettings["paperSize"],
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
      >
        <option value="a4">A4</option>
        <option value="f4">F4</option>
      </select>
    </label>

    <label className="block text-sm font-medium text-slate-700">
      Orientasi halaman
      <select
        value={settings.orientation}
        onChange={(event) =>
          updateSetting(
            "orientation",
            event.target.value as SystemSettings["orientation"],
          )
        }
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition focus:border-[#315F86] focus:ring-2 focus:ring-[#E7EFF8]"
      >
        <option value="portrait">Potret</option>
        <option value="landscape">Lanskap</option>
      </select>
    </label>

    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-[#F4F8FC]">
      <input
        type="checkbox"
        checked={settings.showLogo}
        onChange={(event) =>
          updateSetting("showLogo", event.target.checked)
        }
        className="h-4 w-4 accent-[#315F86]"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">
          Tampilkan logo
        </span>
        <span className="mt-1 block text-xs text-slate-500">
          Sertakan logo pada laporan PDF jika didukung oleh template.
        </span>
      </span>
    </label>

    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 p-4 transition hover:bg-[#F4F8FC]">
      <input
        type="checkbox"
        checked={settings.showPrintDate}
        onChange={(event) =>
          updateSetting("showPrintDate", event.target.checked)
        }
        className="h-4 w-4 accent-[#315F86]"
      />
      <span>
        <span className="block text-sm font-medium text-slate-800">
          Tampilkan tanggal cetak
        </span>
        <span className="mt-1 block text-xs text-slate-500">
          Sertakan tanggal pembuatan laporan.
        </span>
      </span>
    </label>
  </div>
</section>

        <div className="flex items-center gap-3"><button type="button" onClick={handleSave} className="ui-button-primary font-semibold shadow-sm">Simpan Pengaturan</button>{saved && <span className="text-sm font-medium text-emerald-600">Pengaturan berhasil disimpan.</span>}</div>
      </div>
    </AppLayout>
  );
}
