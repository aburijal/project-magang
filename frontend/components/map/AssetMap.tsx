"use client";

import { useEffect, useRef, useState } from "react";
import { dummyAssets } from "@/data/dummy-assets";
import { getAssetStatus } from "@/lib/asset-utils";
import { Asset } from "@/types/asset";

interface AssetMapProps {
  heightClassName?: string;
  assets?: Asset[];
  resetSignal?: number;
  targetAssetId?: number | null;
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function assetValue(value: string | number | null): string {
  return value === null || value === "" ? "-" : escapeHtml(value);
}

function createAssetMarkerIcon(
  L: typeof import("leaflet"),
  color: string,
) {
  return L.divIcon({
    className: "asset-map-marker",
    html: `
      <span class="asset-map-marker__pin" style="--marker-color: ${color}" aria-hidden="true">
        <svg viewBox="0 0 32 42" role="presentation">
          <path d="M16 1.5C8.27 1.5 2 7.77 2 15.5c0 10.38 14 24.04 14 24.04S30 25.88 30 15.5C30 7.77 23.73 1.5 16 1.5Z" />
          <circle cx="16" cy="15.5" r="5.5" />
        </svg>
      </span>
    `,
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -39],
  });
}

function createAssetPopup(asset: Asset, status: string): string {
  const area = asset.luas_m2 === null
    ? "-"
    : `${asset.luas_m2.toLocaleString("id-ID")} m²`;
  const coordinates = asset.koordinat_x === null || asset.koordinat_y === null
    ? "-"
    : `${asset.koordinat_x.toFixed(6)}, ${asset.koordinat_y.toFixed(6)}`;

  return `
    <div class="asset-popup">
      <div class="asset-popup__heading">
        <div>
          <strong class="asset-popup__title">${assetValue(asset.nama_barang_aset)}</strong>
          <span class="asset-popup__code">No. Register ${assetValue(asset.no_register)}</span>
        </div>
      </div>
      <dl class="asset-popup__details">
        <div><dt>Lokasi</dt><dd>${assetValue(asset.lokasi_aset)}</dd></div>
        <div><dt>Jenis aset</dt><dd>${assetValue(asset.nama_barang_aset)}</dd></div>
        <div><dt>Luas</dt><dd>${assetValue(area)}</dd></div>
        <div><dt>Status</dt><dd>${assetValue(status)}</dd></div>
        <div><dt>Status hak</dt><dd>${assetValue(asset.hak)}</dd></div>
        <div><dt>Koordinat</dt><dd>${assetValue(coordinates)}</dd></div>
      </dl>
      <a class="asset-popup__link" href="/aset/${asset.id}">Lihat detail aset <span aria-hidden="true">→</span></a>
    </div>
  `;
}

export default function AssetMap({
  heightClassName = "h-[600px]",
  assets = dummyAssets,
  resetSignal = 0,
  targetAssetId = null,
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
    let layerControl: import("leaflet").Control | null = null;
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
        const markerColor = status === "Bersertifikat"
          ? "#10b981"
          : status === "Belum Bersertifikat"
            ? "#f97316"
            : "#3b82f6";
        const marker = L.marker([asset.koordinat_x, asset.koordinat_y], {
          icon: createAssetMarkerIcon(L, markerColor),
        })
          .bindPopup(createAssetPopup(asset, status), {
            className: "asset-map-popup",
            maxWidth: 360,
            minWidth: 280,
          })
          .addTo(map);

          if (asset.id === targetAssetId) {
            map.setView([asset.koordinat_x, asset.koordinat_y], 16, {
              animate: false,
            });
            marker.openPopup();
          }
      }

      let activeBaseLayer: import("leaflet").TileLayer = osm;
      layerControl = new (L.Control.extend({
        onAdd() {
          const container = L.DomUtil.create("div", "leaflet-control asset-layer-control");
          const toggle = L.DomUtil.create("button", "asset-layer-control__toggle", container);
          toggle.type = "button";
          toggle.setAttribute("aria-label", "Pilih layer peta");
          toggle.setAttribute("title", "Pilih layer peta");
          toggle.setAttribute("aria-expanded", "false");
          toggle.innerHTML = `
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
              <path d="m4 12 8 4.5 8-4.5M4 16.5l8 4.5 8-4.5" />
            </svg>
          `;

          const menu = L.DomUtil.create("div", "asset-layer-control__menu", container);
          menu.hidden = true;
          const layers = [
            {
              label: "Peta Jalan",
              layer: osm,
              icon: `
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <rect width="48" height="48" rx="8" fill="#e8f0e7" />
                  <path d="M-4 35 52 8M-5 47 52 20" stroke="#c4d6bd" stroke-width="8" />
                  <path d="M-4 35 52 8M-5 47 52 20" stroke="#ffffff" stroke-dasharray="5 4" stroke-width="2" />
                  <path d="M6 8h14M27 40h15M35 4v12" stroke="#91a988" stroke-width="2" />
                </svg>
              `,
            },
            {
              label: "Peta Satelit",
              layer: satellite,
              icon: `
                <svg viewBox="0 0 48 48" aria-hidden="true">
                  <rect width="48" height="48" rx="8" fill="#d8e7e8" />
                  <path d="M0 33c8-5 14-5 22 0s14 5 26-2v17H0Z" fill="#7aa98d" />
                  <path d="M0 16c9 4 15 3 23-2s15-5 25 1v12c-10 4-17 4-25-1S9 22 0 27Z" fill="#a8c3b1" />
                  <path d="m30 7 5 5m-9 0 5-5m-8 8 12 0" stroke="#5a7f84" stroke-width="2" />
                  <circle cx="31" cy="12" r="3" fill="#ffffff" stroke="#5a7f84" stroke-width="2" />
                </svg>
              `,
            },
          ];

          const options: HTMLButtonElement[] = [];
          const updateActiveLayer = () => {
            options.forEach((option, index) => {
              const isActive = layers[index].layer === activeBaseLayer;
              option.classList.toggle("is-active", isActive);
              option.setAttribute("aria-pressed", String(isActive));
            });
          };

          const selectLayer = (layer: import("leaflet").TileLayer) => {
            if (activeBaseLayer !== layer) {
              map?.removeLayer(activeBaseLayer);
              layer.addTo(map!);
              activeBaseLayer = layer;
              updateActiveLayer();
            }
            menu.hidden = true;
            toggle.setAttribute("aria-expanded", "false");
          };

          layers.forEach(({ label, layer, icon }) => {
            const option = L.DomUtil.create("button", "asset-layer-control__option", menu);
            option.type = "button";
            option.innerHTML = `<span class="asset-layer-control__thumbnail">${icon}</span><span class="asset-layer-control__label">${label}</span>`;
            option.setAttribute("aria-label", `Gunakan ${label}`);
            option.setAttribute("aria-pressed", "false");
            option.addEventListener("click", () => selectLayer(layer));
            options.push(option);
          });
          updateActiveLayer();

          toggle.addEventListener("click", () => {
            menu.hidden = !menu.hidden;
            toggle.setAttribute("aria-expanded", String(!menu.hidden));
          });
          const closeMenu = (event: MouseEvent) => {
            if (!container.contains(event.target as Node)) {
              menu.hidden = true;
              toggle.setAttribute("aria-expanded", "false");
            }
          };
          const closeMenuOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
              menu.hidden = true;
              toggle.setAttribute("aria-expanded", "false");
              toggle.focus();
            }
          };
          document.addEventListener("click", closeMenu);
          document.addEventListener("keydown", closeMenuOnEscape);
          (container as typeof container & { _cleanup?: () => void })._cleanup = () => {
            document.removeEventListener("click", closeMenu);
            document.removeEventListener("keydown", closeMenuOnEscape);
          };
          L.DomEvent.disableClickPropagation(container);
          L.DomEvent.on(container, "wheel", L.DomEvent.stopPropagation);
          return container;
        },
        onRemove(mapInstance: import("leaflet").Map) {
          const container = mapInstance.getContainer().querySelector(".asset-layer-control") as (HTMLElement & { _cleanup?: () => void }) | null;
          container?._cleanup?.();
        },
      }))({ position: "topright" });
      map.addControl(layerControl);

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
        if (layerControl) map.removeControl(layerControl);
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
  }, [assets, targetAssetId]);

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
          aria-label={locating ? "Mencari lokasi" : "Tampilkan lokasi saya"}
          title={locating ? "Mencari lokasi" : "Tampilkan lokasi saya"}
          className="asset-location-control"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="12" r="7" />
            <circle cx="12" cy="12" r="2.5" />
            <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
          </svg>
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