"use client";

import { FormEvent, useState } from "react";
import AppLayout from "@/components/layout/AppLayout";

type User = { name: string; email: string; role: string; status: "Aktif" | "Nonaktif" };
const initialUsers: User[] = [
  { name: "Admin Sistem", email: "admin@lhokseumawekota.go.id", role: "Administrator", status: "Aktif" },
  { name: "Operator BPKD", email: "operator.bpkd@lhokseumawekota.go.id", role: "Operator", status: "Aktif" },
  { name: "Viewer OPD", email: "viewer@lhokseumawekota.go.id", role: "Viewer", status: "Aktif" },
];

export default function PenggunaPage() {
  const [users, setUsers] = useState(initialUsers);
  const [showForm, setShowForm] = useState(false);

  function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setUsers((current) => [...current, { name: String(form.get("name")), email: String(form.get("email")), role: String(form.get("role")), status: "Aktif" }]);
    setShowForm(false);
    event.currentTarget.reset();
  }

  return <AppLayout><div className="space-y-6"><div className="flex items-end justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-600">Akses sistem</p><h1 className="mt-1 text-2xl font-bold text-slate-900">Pengguna</h1></div><button type="button" onClick={() => setShowForm((value) => !value)} className="ui-button-primary font-medium">{showForm ? "Tutup Form" : "+ Tambah Pengguna"}</button></div>
    {showForm && <form onSubmit={addUser} className="grid gap-3 rounded-xl border border-blue-100 bg-blue-50 p-5 md:grid-cols-4"><input name="name" required placeholder="Nama pengguna" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /><input name="email" type="email" required placeholder="Email" className="rounded-lg border border-slate-300 px-3 py-2 text-sm" /><select name="role" className="rounded-lg border border-slate-300 px-3 py-2 text-sm"><option>Operator</option><option>Viewer</option><option>Administrator</option></select><button className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white">Tambahkan</button></form>}
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr><th className="px-5 py-3">Nama</th><th className="px-5 py-3">Email</th><th className="px-5 py-3">Peran</th><th className="px-5 py-3">Status</th><th className="px-5 py-3">Aksi</th></tr></thead><tbody className="divide-y divide-slate-100">{users.map((user) => <tr key={user.email}><td className="px-5 py-4 font-medium text-slate-900">{user.name}</td><td className="px-5 py-4 text-slate-600">{user.email}</td><td className="px-5 py-4 text-slate-600">{user.role}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${user.status === "Aktif" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{user.status}</span></td><td className="px-5 py-4"><button type="button" onClick={() => setUsers((current) => current.map((item) => item.email === user.email ? { ...item, status: item.status === "Aktif" ? "Nonaktif" : "Aktif" } : item))} className="font-medium text-blue-600 hover:text-blue-700">{user.status === "Aktif" ? "Nonaktifkan" : "Aktifkan"}</button></td></tr>)}</tbody></table></div>
  </div></AppLayout>;
}
