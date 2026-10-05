import AppLayout from "@/components/layout/AppLayout";
import StatCard from "@/components/dashboard/StatCard";
import AssetMapPreview from "@/components/dashboard/AssetMapPreview";
import DistrictStats from "@/components/dashboard/DistrictStats";
import CertificateChart from "@/components/dashboard/CertificateChart";
import RecentAssets from "@/components/dashboard/RecentAssets";

export default function DashboardPage() {
    return (
        <AppLayout>
            <div className="space-y-6">
                {/* Header Dashboard */}
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Dashboard
                        </h1>

                        <p className="mt-1 text-sm text-slate-500">
                            Ringkasan inventaris aset tanah Pemerintah Kota
                            Lhokseumawe.
                        </p>
                    </div>

                </div>

                {/* Statistik */}
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        title="TOTAL ASET"
                        value="128"
                        description="Bidang tanah"
                        icon="⌂"
                        variant="blue"
                    />

                    <StatCard
                        title="TOTAL LUAS"
                        value="452.350 m²"
                        description="45,24 Ha"
                        icon="□"
                        variant="green"
                    />

                    <StatCard
                        title="BERSERTIFIKAT"
                        value="97"
                        description="76% dari total aset"
                        icon="✓"
                        variant="purple"
                    />

                    <StatCard
                        title="BELUM SERTIFIKAT"
                        value="31"
                        description="24% dari total aset"
                        icon="▤"
                        variant="orange"
                    />
                </div>

                {/* Peta + Statistik Kecamatan */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <AssetMapPreview />

                    <DistrictStats />
                </div>

                {/* Sertifikat + Aset Terbaru */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                    <CertificateChart />

                    <RecentAssets />
                </div>
            </div>
        </AppLayout>
    );
}