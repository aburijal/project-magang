"use client";

import { useEffect, useRef } from "react";

export default function AssetMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let cancelled = false;

    const initMap = async () => {
      const L = await import("leaflet");

      if (cancelled || !mapContainerRef.current) return;

      // Cegah map dibuat dua kali
      if (mapContainerRef.current.dataset.mapInitialized === "true") {
        return;
      }

      mapContainerRef.current.dataset.mapInitialized = "true";

      map = L.map(mapContainerRef.current).setView(
        [5.1800, 97.1400],
        13
      );

      const street = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      );

      street.addTo(map);

      L.control
        .layers({
          "Peta Jalan": street,
        })
        .addTo(map);

      // Paksa Leaflet menghitung ukuran container
      setTimeout(() => {
        map?.invalidateSize();
      }, 200);
    };

    initMap();

    return () => {
      cancelled = true;

      if (map) {
        map.remove();
        map = null;
      }

      if (mapContainerRef.current) {
        delete mapContainerRef.current.dataset.mapInitialized;
      }
    };
  }, []);

  return (
    <div
      ref={mapContainerRef}
      className="h-[600px] w-full"
    />
  );
}