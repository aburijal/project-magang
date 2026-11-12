export interface ParsedCoordinates {
  latitude: number | null;
  longitude: number | null;
}

type CoordinateAxis = "latitude" | "longitude";

const directionPattern = "(?:LU|LS|BT|BB|N|S|E|W)";
const numberPattern = "[+-]?\\d{1,3}(?:[.,]\\d+)?";
const smallNumberPattern = numberPattern.replace("\\d{1,3}", "\\d{1,2}");
const dmsPattern = `${numberPattern}\\s*(?:°|º|deg)\\s*(?:${smallNumberPattern}\\s*['′ʹ])?\\s*(?:${smallNumberPattern}\\s*[\"″ʺ])?`;

function decimalNumber(value: string): number | null {
  const normalized = value.trim().replace(",", ".");
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function directionSign(direction: string): number {
  return /^(LS|BB|S)$/i.test(direction) ? -1 : 1;
}

function isLatitudeDirection(direction: string): boolean {
  return /^(LU|LS|N|S)$/i.test(direction);
}

function isLongitudeDirection(direction: string): boolean {
  return /^(BT|BB|E|W)$/i.test(direction);
}

function validCoordinate(value: number, axis: CoordinateAxis): number | null {
  const limit = axis === "latitude" ? 90 : 180;
  return Number.isFinite(value) && Math.abs(value) <= limit ? value : null;
}

function parseDms(value: string, axis?: CoordinateAxis): number | null {
  const match = value.match(
    new RegExp(`^\\s*(${numberPattern})\\s*(?:°|º|deg)\\s*(${numberPattern.replace("\\d{1,3}", "\\d{1,2}")})?\\s*(?:['′ʹ]\\s*(${numberPattern.replace("\\d{1,3}", "\\d{1,2}")})?\\s*(?:[\"″ʺ])?)?`, "i"),
  );
  if (!match) return null;

  const degrees = decimalNumber(match[1]);
  const minutes = match[2] ? decimalNumber(match[2]) : 0;
  const seconds = match[3] ? decimalNumber(match[3]) : 0;
  if (degrees === null || minutes === null || seconds === null || minutes >= 60 || seconds >= 60) return null;

  const result = (Math.abs(degrees) + minutes / 60 + seconds / 3600) * (degrees < 0 ? -1 : 1);
  return axis ? validCoordinate(result, axis) : result;
}

function parseScalar(value: unknown, axis: CoordinateAxis, direction?: string): number | null {
  const text = String(value ?? "").trim();
  if (!text) return null;

  const dms = parseDms(text, axis);
  if (dms !== null) return direction ? dms * directionSign(direction) : dms;

  const match = text.match(new RegExp(numberPattern));
  if (!match) return null;
  const parsed = decimalNumber(match[0]);
  if (parsed === null) return null;
  const signed = direction ? Math.abs(parsed) * directionSign(direction) : parsed;
  return validCoordinate(signed, axis);
}

function directionCoordinates(value: string): ParsedCoordinates {
  let latitude: number | null = null;
  let longitude: number | null = null;
  const matcher = new RegExp(
    `${directionPattern}\\s*:?\\s*(?:${dmsPattern}|${numberPattern})`,
    "gi",
  );

  for (const match of value.matchAll(matcher)) {
    const directionMatch = match[0].match(new RegExp(`^(${directionPattern})`, "i"));
    if (!directionMatch) continue;
    const direction = directionMatch[1];
    const rawCoordinate = match[0].slice(direction.length).replace(/^\s*:\s*/, "");
    if (isLatitudeDirection(direction)) latitude = parseScalar(rawCoordinate, "latitude", direction);
    if (isLongitudeDirection(direction)) longitude = parseScalar(rawCoordinate, "longitude", direction);
  }

  return { latitude, longitude };
}

function labelledCoordinates(value: string): ParsedCoordinates {
  const latitudeMatch = value.match(new RegExp(`(?:LAT(?:ITUDE)?|LINTANG)\\s*[:=]?\\s*(${numberPattern}(?:\\s*°[^,;|]*)?)`, "i"));
  const longitudeMatch = value.match(new RegExp(`(?:LON(?:GITUDE)?|LONG|BUJUR)\\s*[:=]?\\s*(${numberPattern}(?:\\s*°[^,;|]*)?)`, "i"));
  return {
    latitude: latitudeMatch ? parseScalar(latitudeMatch[1], "latitude") : null,
    longitude: longitudeMatch ? parseScalar(longitudeMatch[1], "longitude") : null,
  };
}

function dmsPair(value: string): ParsedCoordinates {
  const matches = value.match(new RegExp(dmsPattern, "gi")) ?? [];
  if (matches.length < 2) return { latitude: null, longitude: null };
  return {
    latitude: parseScalar(matches[0], "latitude"),
    longitude: parseScalar(matches[1], "longitude"),
  };
}

export function parseCoordinatePair(latitudeValue: unknown, longitudeValue?: unknown): ParsedCoordinates {
  const first = String(latitudeValue ?? "").trim();
  const second = String(longitudeValue ?? "").trim();
  if (!first && !second) return { latitude: null, longitude: null };

  if (longitudeValue !== undefined && second) {
    const firstDirection = directionCoordinates(first);
    const secondDirection = directionCoordinates(second);
    return {
      latitude: firstDirection.latitude ?? parseScalar(first, "latitude"),
      longitude: secondDirection.longitude ?? parseScalar(second, "longitude"),
    };
  }

  const directionResult = directionCoordinates(first);
  if (directionResult.latitude !== null || directionResult.longitude !== null) return directionResult;

  const labelledResult = labelledCoordinates(first);
  if (labelledResult.latitude !== null || labelledResult.longitude !== null) return labelledResult;

  const dmsResult = dmsPair(first);
  if (dmsResult.latitude !== null || dmsResult.longitude !== null) return dmsResult;

  const xyMatch = first.match(new RegExp(`(?:X|LAT(?:ITUDE)?)\\s*[:=]\\s*(${numberPattern}).*?(?:Y|LON(?:GITUDE)?)\\s*[:=]\\s*(${numberPattern})`, "i"));
  if (xyMatch) {
    return {
      latitude: parseScalar(xyMatch[1], "latitude"),
      longitude: parseScalar(xyMatch[2], "longitude"),
    };
  }

  if (/\d{1,2}\/\d{1,2}\/\d{2,4}/.test(first) || !/[,\s;|]/.test(first)) {
    return { latitude: null, longitude: null };
  }

  const numbers = first.match(new RegExp(numberPattern, "g")) ?? [];
  if (numbers.length >= 2) {
    return {
      latitude: parseScalar(numbers[0], "latitude"),
      longitude: parseScalar(numbers[1], "longitude"),
    };
  }

  return { latitude: null, longitude: null };
}

export function hasValidCoordinates(coordinates: ParsedCoordinates): boolean {
  return coordinates.latitude !== null && coordinates.longitude !== null;
}
