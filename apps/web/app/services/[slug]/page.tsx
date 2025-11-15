"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getJson } from "../../../lib/api";

type SubService = {
  id: string;
  name: string;
  slug: string;
  description?: string;
};

type Service = {
  id: string;
  name: string;
  slug: string;
  subServices: SubService[];
};

export default function ServicePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [service, setService] = useState<Service | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadService();
    }
  }, [slug]);

  async function loadService() {
    try {
      const data = await getJson<Service>(`/api/services/${slug}`);
      setService(data);
    } catch (err) {
      console.error("Failed to load service:", err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!service) {
    return (
      <main style={{ padding: 24 }}>
        <p>Service not found.</p>
        <Link href="/">← Back to home</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 16, textDecoration: "none" }}>
        ← Back to services
      </Link>
      <h1>{service.name}</h1>
      <p style={{ marginBottom: 32, color: "#666" }}>
        Select a specific service option to continue with your booking.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {service.subServices.map((subService) => (
          <Link
            key={subService.id}
            href={`/services/${service.slug}/${subService.id}`}
            style={{
              padding: 20,
              border: "1px solid #ddd",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
              display: "block",
              transition: "background-color 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "transparent";
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 4 }}>{subService.name}</h3>
            {subService.description && (
              <p style={{ margin: 0, fontSize: 14, color: "#666" }}>{subService.description}</p>
            )}
            {subService.pricingConfig && (
              <p style={{ margin: "8px 0 0 0", fontSize: 12, color: "#0070f3", fontWeight: 500 }}>
                Configure pricing →
              </p>
            )}
          </Link>
        ))}
      </div>
    </main>
  );
}

