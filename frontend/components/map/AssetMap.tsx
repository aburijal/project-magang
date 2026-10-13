"use client";

import { useEffect, useRef, useState } from "react";
import { dummyAssets } from "@/data/dummy-assets";
import { getAssetStatus } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

interface AssetMapProps {
  heightClassName?: string;
  assets?: Asset[];
  resetSignal?: number;
}

export default function AssetMap({
  heightClassName = "h-[600px]",
  assets = dummyAssets,
  resetSignal = 0,
}: AssetMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<import("leaflet").Map | null>(null);
  const userLocationLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const coordinatePinLayerRef = useRef<import("leaflet").LayerGroup | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  useEffect(() => {
    let map: import("leaflet").Map | null = null;
    let mapContainer: HTMLElement | null = null;
    let clearPress: () => void = () => undefined;
    let handlePointerDown: (event: PointerEvent) => void = () => undefined;
    let handlePointerMove: (event: PointerEvent) => void = () => undefined;
    let cancelled = false;

    async function loadMap() {
      const L = await import("leaflet");

      if (cancelled || !mapRef.current) return;

      // Pastikan tidak membuat map dua kali
      const mapElement = mapRef.current as HTMLDivElement & { _leaflet_id?: number };
      if (mapElement._leaflet_id) {
        return;
      }

      map = L.map(mapRef.current, {
        center: [5.1800, 97.1400],
        zoom: 13,
        zoomControl: true,
        zoomDelta: 0.5,
        zoomSnap: 0.5,
        zoomAnimation: true,
        wheelDebounceTime: 120,
        wheelPxPerZoomLevel: 180,
      });
      mapInstanceRef.current = map;

      // Layer OpenStreetMap
      const osm = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 19,
        }
      );

      const satellite = L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: "Tiles &copy; Esri",
          maxZoom: 19,
        },
      );

      osm.addTo(map);
      coordinatePinLayerRef.current = L.layerGroup().addTo(map);

      for (const asset of assets) {
        if (asset.koordinat_x === null || asset.koordinat_y === null) continue;

        const status = getAssetStatus(asset);
        L.circleMarker([asset.koordinat_x, asset.koordinat_y], {
          radius: 8,
          color: status === "Bersertifikat" ? "#059669" : "#ea580c",
          fillColor: status === "Bersertifikat" ? "#10b981" : "#f97316",
          fillOpacity: 0.85,
          weight: 2,
        })
          .bindPopup(
            `<strong>${asset.nama_barang_aset}</strong><br />${asset.alamat}<br />Status: ${status}`,
          )
          .addTo(map);
      }

      // Kontrol layer
      L.control
        .layers({
          "Peta Jalan": osm,
          "Peta Satelit": satellite,
        }, undefined, { collapsed: false })
        .addTo(map);

      mapContainer = map.getContainer();
      let pressTimer: ReturnType<typeof setTimeout> | null = null;
      let pressStart: { x: number; y: number } | null = null;
      let longPressTriggered = false;

      clearPress = () => {
        if (pressTimer) {
          clearTimeout(pressTimer);
          pressTimer = null;
        }
        if (longPressTriggered) map?.dragging.enable();
        longPressTriggered = false;
        pressStart = null;
      };

      const createCoordinatePin = (event: PointerEvent) => {
        if (!mapContainer || !map) return;
        const coordinatePinLayer = coordinatePinLayerRef.current;
        if (!coordinatePinLayer) return;
        const { lat, lng } = map.containerPointToLatLng(
          L.point(event.clientX - mapContainer.getBoundingClientRect().left, event.clientY - mapContainer.getBoundingClientRect().top),
        ) ?? { lat: 0, lng: 0 };
        const coordinate = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
        const pin = L.marker([lat, lng], {
          draggable: true,
          title: "Pin lokasi aset",
          icon: L.divIcon({
            className: "google-location-pin",
            html: '<span class="google-location-pin__dot"></span>',
            iconSize: [28, 38],
            iconAnchor: [14, 38],
            popupAnchor: [0, -38],
          }),
        }).addTo(coordinatePinLayer);

        const popupContent = document.createElement("div");
        popupContent.className = "coordinate-popup";
        popupContent.innerHTML = `
          <strong>Titik lokasi aset</strong>
          <span class="coordinate-value">${coordinate}</span>
          <button type="button" class="copy-coordinate">Salin koordinat</button>
          <small>Geser pin untuk menyesuaikan posisi</small>
        `;
        const updatePopup = () => {
          const current = pin.getLatLng();
          const currentCoordinate = `${current.lat.toFixed(6)}, ${current.lng.toFixed(6)}`;
          const value = popupContent.querySelector(".coordinate-value");
          if (value) value.textContent = currentCoordinate;
        };
        pin.on("dragend", () => {
          updatePopup();
          pin.openPopup();
        });
        pin.bindPopup(popupContent).openPopup();
        popupContent.querySelector(".copy-coordinate")?.addEventListener("click", async () => {
          const current = pin.getLatLng();
          const currentCoordinate = `${current.lat.toFixed(6)}, ${current.lng.toFixed(6)}`;
          const button = popupContent.querySelector(".copy-coordinate");
          try {
            await navigator.clipboard.writeText(currentCoordinate);
            if (button) button.textContent = "Koordinat tersalin";
          } catch {
            if (button) button.textContent = "Salin gagal, coba lagi";
          }
        });
      };

      handlePointerDown = (event: PointerEvent) => {
        if (event.pointerType === "mouse" && event.button !== 0) return;
        pressStart = { x: event.clientX, y: event.clientY };
        pressTimer = setTimeout(() => {
          if (pressStart) {
            longPressTriggered = true;
            map?.dragging.disable();
            createCoordinatePin(event);
          }
          pressTimer = null;
        }, 1500);
      };

      handlePointerMove = (event: PointerEvent) => {
        if (!pressStart) return;
        const distance = Math.hypot(event.clientX - pressStart.x, event.clientY - pressStart.y);
        if (distance > 8) clearPress();
      };

      mapContainer.addEventListener("pointerdown", handlePointerDown);
      mapContainer.addEventListener("pointermove", handlePointerMove);
      mapContainer.addEventListener("pointerup", clearPress);
      mapContainer.addEventListener("pointercancel", clearPress);
      mapContainer.addEventListener("pointerleave", clearPress);

      // Paksa Leaflet menghitung ulang ukuran container
      setTimeout(() => {
        if (map) {
          map.invalidateSize();
        }
      }, 300);
    }

    loadMap();

    return () => {
      cancelled = true;

      if (map) {
        map.remove();
        map = null;
      }
      coordinatePinLayerRef.current = null;
      clearPress();
      mapContainer?.removeEventListener("pointerdown", handlePointerDown);
      mapContainer?.removeEventListener("pointermove", handlePointerMove);
      mapContainer?.removeEventListener("pointerup", clearPress);
      mapContainer?.removeEventListener("pointercancel", clearPress);
      mapContainer?.removeEventListener("pointerleave", clearPress);
      mapInstanceRef.current = null;
    };
  }, [assets]);

  useEffect(() => {
    coordinatePinLayerRef.current?.clearLayers();
  }, [resetSignal]);

  function showUserLocation() {
    if (!navigator.geolocation) {
      setLocationError("Browser ini tidak mendukung pembacaan lokasi.");
      return;
    }

    setLocating(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const L = await import("leaflet");
        const currentMap = mapInstanceRef.current;
        if (!currentMap) return;

        const point: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        userLocationLayerRef.current?.remove();
        const layer = L.layerGroup();
        L.circleMarker(point, {
          radius: 9,
          color: "#ffffff",
          weight: 3,
          fillColor: "#2563eb",
          fillOpacity: 1,
        }).addTo(layer);
        L.circle(point, {
          radius: position.coords.accuracy,
          color: "#2563eb",
          fillColor: "#60a5fa",
          fillOpacity: 0.16,
          weight: 1,
        }).addTo(layer);
        layer.addTo(currentMap);
        userLocationLayerRef.current = layer;
        currentMap.flyTo(point, Math.max(currentMap.getZoom(), 16), {
          animate: true,
          duration: 1,
        });
        setLocating(false);
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "Izin lokasi ditolak. Aktifkan Location pada pengaturan browser."
            : "Lokasi tidak dapat ditemukan. Pastikan GPS atau jaringan aktif.",
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 },
    );
  }

  return (
    <div
      ref={mapRef}
      className={`${heightClassName} w-full`}
      style={{
        position: "relative",
        zIndex: 0,
      }}
    >
      <div className="absolute right-3 top-[106px] z-[1000] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={showUserLocation}
          disabled={locating}
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-md transition hover:bg-blue-50 hover:text-blue-700 disabled:cursor-wait disabled:opacity-70"
        >
          <span className="h-3 w-3 rounded-full border-2 border-white bg-blue-600 shadow-[0_0_0_2px_#2563eb]" />
          {locating ? "Mencari lokasi..." : "Lokasi saya"}
        </button>
        {locationError && (
          <p className="max-w-64 rounded-lg border border-red-100 bg-white px-3 py-2 text-right text-xs text-red-600 shadow-md">
            {locationError}
          </p>
        )}
      </div>
    </div>
  );
}