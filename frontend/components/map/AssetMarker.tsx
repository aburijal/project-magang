interface AssetMarkerProps {
  name: string;
  status: string;
}

export default function AssetMarker({
  name,
  status,
}: AssetMarkerProps) {
  return (
    <div>
      <strong>{name}</strong>
      <p>Status: {status}</p>
    </div>
  );
}