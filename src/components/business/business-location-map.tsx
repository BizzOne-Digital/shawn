interface BusinessLocationMapProps {
  address?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  state?: string | null;
  zipCode?: string | null;
  className?: string;
}

function buildMapQuery({
  address,
  addressLine2,
  city,
  state,
  zipCode,
}: BusinessLocationMapProps) {
  const parts = [address, addressLine2, city, state, zipCode].filter(Boolean);
  return parts.join(", ");
}

export function BusinessLocationMap(props: BusinessLocationMapProps) {
  const query = buildMapQuery(props);
  const { className = "h-64 w-full rounded-xl border border-border" } = props;

  if (!query.trim()) {
    return (
      <div className={`${className} flex items-center justify-center bg-soft-gray text-sm text-muted`}>
        Map unavailable — no address on file
      </div>
    );
  }

  const embedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

  return (
    <iframe
      title={`Map: ${query}`}
      src={embedUrl}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer-when-downgrade"
      allowFullScreen
    />
  );
}
