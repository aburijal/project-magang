export interface SystemSettings {
  institutionName: string;
  applicationName: string;
  managingUnit: string;
  paperSize: "a4" | "f4";
  orientation: "landscape" | "portrait";
  showLogo: boolean;
  showPrintDate: boolean;
}

export const defaultSystemSettings: SystemSettings = {
  institutionName: "Pemerintah Kota Lhokseumawe",
  applicationName: "Sistem Katalog Aset Tanah",
  managingUnit: "Dinas Pertanahan Kota Lhokseumawe",
  paperSize: "a4",
  orientation: "portrait",
  showLogo: true,
  showPrintDate: true,
};

const SETTINGS_KEY = "lhokseumawe-system-settings";

export function loadSystemSettings(): SystemSettings {
  if (typeof window === "undefined") return defaultSystemSettings;
  const stored = window.localStorage.getItem(SETTINGS_KEY);
  if (!stored) return defaultSystemSettings;

  try {
    return { ...defaultSystemSettings, ...JSON.parse(stored) };
  } catch {
    window.localStorage.removeItem(SETTINGS_KEY);
    return defaultSystemSettings;
  }
}

export function saveSystemSettings(settings: SystemSettings) {
  window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event("settings-updated"));
}
