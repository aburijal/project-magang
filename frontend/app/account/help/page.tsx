
"use client";

import { useState } from "react";
import Link from "next/link";

const helpCategories = [
  {
    title: "Dashboard",
    description: "Memahami ringkasan dan statistik aset tanah.",
    icon: "▦",
    questions: [
      {
        question: "Apa fungsi halaman Dashboard?",
        answer:
          "Dashboard menampilkan ringkasan data aset tanah, seperti jumlah aset, luas aset, dan informasi statistik yang tersedia pada aplikasi.",
      },
      {
        question: "Bagaimana membaca ringkasan statistik?",
        answer:
          "Pilih kartu statistik yang tersedia untuk melihat informasi lebih lanjut. Data yang ditampilkan mengikuti data yang tersedia pada sistem.",
      },
    ],
  },
  {
    title: "Data Aset Tanah",
    description: "Mencari dan memahami informasi aset.",
    icon: "▤",
    questions: [
      {
        question: "Bagaimana mencari data aset tanah?",
        answer:
          "Buka halaman Data Aset Tanah, kemudian gunakan kolom pencarian dan filter yang tersedia untuk menemukan data yang diperlukan.",
      },
      {
        question: "Bagaimana melihat detail aset?",
        answer:
          "Pilih salah satu data aset untuk membuka halaman detail. Informasi yang muncul bergantung pada data yang telah dimasukkan.",
      },
    ],
  },
  {
    title: "Peta Aset",
    description: "Melihat lokasi dan persebaran aset.",
    icon: "⌖",
    questions: [
      {
        question: "Bagaimana melihat lokasi aset?",
        answer:
          "Buka halaman Peta untuk melihat persebaran aset yang memiliki koordinat lokasi. Aset tanpa koordinat mungkin tidak muncul sebagai penanda pada peta.",
      },
      {
        question: "Mengapa lokasi aset tidak muncul?",
        answer:
          "Periksa apakah data aset memiliki koordinat lintang dan bujur yang valid. Pastikan juga peta dan data lokasinya berhasil dimuat.",
      },
    ],
  },
  {
    title: "Laporan PDF",
    description: "Memahami proses ekspor dan format laporan.",
    icon: "▧",
    questions: [
      {
        question: "Bagaimana mengekspor laporan PDF?",
        answer:
          "Buka data atau detail aset yang ingin dilaporkan, lalu gunakan tombol ekspor PDF jika tersedia pada halaman tersebut.",
      },
      {
        question: "Di mana mengatur format laporan?",
        answer:
          "Buka Account, lalu pilih Settings & Preference. Pengaturan yang tersedia mencakup ukuran kertas, orientasi halaman, logo, dan tanggal cetak.",
      },
    ],
  },
];

export default function HelpCenterPage() {
  const [activeCategory, setActiveCategory] = useState("Semua");
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const visibleCategories = helpCategories
    .filter(
      (category) =>
        activeCategory === "Semua" || category.title === activeCategory,
    )
    .map((category) => ({
      ...category,
      questions: category.questions.filter(
        (item) =>
          `${item.question} ${item.answer} ${category.title}`
            .toLowerCase()
            .includes(search.trim().toLowerCase()),
      ),
    }))
    .filter((category) => category.questions.length > 0);

  return (
    <main className="min-h-screen bg-[#F4F7FB] px-4 py-8 text-slate-800 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-4xl">
        <Link
          href="/account"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#315F86] transition hover:text-[#193B5A]"
        >
          <span aria-hidden="true">←</span>
          Kembali ke Account
        </Link>

        <header className="relative mt-6 overflow-hidden rounded-3xl bg-[#193B5A] px-6 py-8 text-white sm:px-9 sm:py-10">
          <div className="pointer-events-none absolute -right-12 -top-16 h-52 w-52 rounded-full border-[30px] border-white/[0.05]" />

          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-200">
              PUSAT BANTUAN
            </p>
            <h1 className="mt-2 text-3xl font-bold sm:text-4xl">
              Help Center
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
              Temukan panduan dan jawaban untuk membantu penggunaan Sistem
              Katalog Aset Tanah.
            </p>
          </div>

          <div className="relative mt-6">
            <label htmlFor="help-search" className="sr-only">
              Cari panduan bantuan
            </label>
            <div className="flex items-center gap-3 rounded-xl border border-white/20 bg-white px-4 text-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-blue-200">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                className="h-5 w-5 shrink-0 text-slate-400"
                aria-hidden="true"
              >
                <circle cx="10.8" cy="10.8" r="6.8" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <input
                id="help-search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari pertanyaan atau panduan..."
                className="h-12 min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  aria-label="Hapus pencarian"
                  className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="mt-7">
          <h2 className="text-lg font-bold text-[#193B5A]">
            Jelajahi kategori
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Pilih kategori untuk menemukan panduan yang sesuai.
          </p>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {helpCategories.map((category) => {
              const selected = activeCategory === category.title;

              return (
                <button
                  key={category.title}
                  type="button"
                  onClick={() => {
                    setActiveCategory(selected ? "Semua" : category.title);
                    setOpenQuestion(null);
                  }}
                  aria-pressed={selected}
                  className={`group rounded-2xl border p-4 text-left transition duration-200 active:scale-[0.98] ${
                    selected
                      ? "border-[#315F86] bg-[#E7EFF8] shadow-sm"
                      : "border-slate-200 bg-white hover:-translate-y-0.5 hover:border-[#B9CDDF] hover:shadow-sm"
                  }`}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E7EFF8] text-xl text-[#315F86] transition group-hover:bg-[#193B5A] group-hover:text-white">
                    {category.icon}
                  </span>
                  <span className="mt-3 block text-sm font-bold text-[#193B5A]">
                    {category.title}
                  </span>
                  <span className="mt-1 block text-xs leading-5 text-slate-500">
                    {category.description}
                  </span>
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => {
              setActiveCategory("Semua");
              setSearch("");
              setOpenQuestion(null);
            }}
            className="mt-4 rounded-lg px-3 py-2 text-sm font-semibold text-[#315F86] transition hover:bg-[#E7EFF8] active:scale-[0.98]"
          >
            Tampilkan semua panduan
          </button>
        </section>

        <section className="mt-8">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-[#193B5A]">
              Pertanyaan yang sering diajukan
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tekan pertanyaan untuk membaca jawabannya.
            </p>
          </div>

          <div className="space-y-5">
            {visibleCategories.map((category) => (
              <div
                key={category.title}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
              >
                <div className="border-b border-slate-100 bg-[#F8FAFD] px-5 py-4">
                  <h3 className="text-sm font-bold text-[#193B5A]">
                    {category.title}
                  </h3>
                </div>

                <div className="divide-y divide-slate-100">
                  {category.questions.map((item) => {
                    const questionId = `${category.title}-${item.question}`;
                    const isOpen = openQuestion === questionId;

                    return (
                      <div key={item.question}>
                        <button
                          type="button"
                          aria-expanded={isOpen}
                          onClick={() =>
                            setOpenQuestion(isOpen ? null : questionId)
                          }
                          className="flex min-h-14 w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-[#F8FAFD] active:bg-[#E7EFF8]"
                        >
                          <span className="text-sm font-semibold leading-6 text-slate-700">
                            {item.question}
                          </span>
                          <span
                            className={`shrink-0 text-xl text-[#315F86] transition-transform duration-200 ${
                              isOpen ? "rotate-45" : ""
                            }`}
                          >
                            +
                          </span>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-5 text-sm leading-6 text-slate-500">
                            {item.answer}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {visibleCategories.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-10 text-center">
                <p className="font-semibold text-[#193B5A]">
                  Panduan tidak ditemukan
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  Coba kata kunci lain atau tampilkan semua kategori.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    setActiveCategory("Semua");
                  }}
                  className="mt-4 rounded-xl bg-[#193B5A] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#315F86] active:scale-[0.98]"
                >
                  Reset pencarian
                </button>
              </div>
            )}
          </div>
        </section>

        <footer className="mt-10 border-t border-slate-200 pt-5 text-center">
          <p className="text-xs leading-5 text-slate-400">
            Sistem Digitalisasi Katalog Aset Tanah · Pemerintah Kota
            Lhokseumawe
          </p>
        </footer>
      </div>
    </main>
  );
}
