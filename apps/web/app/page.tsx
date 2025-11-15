"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getJson, postJson } from "../lib/api";

type Service = {
  id: string;
  name: string;
  slug: string;
  subServices: Array<{ id: string; name: string; slug: string }>;
};

export default function HomePage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    loadServices();
  }, []);

  async function loadServices() {
    try {
      const data = await getJson<Service[]>("/api/services");
      setServices(data);
    } catch (err) {
      console.error("Failed to load services:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSeed() {
    setSeeding(true);
    try {
      await postJson("/api/services/seed", {});
      await loadServices();
    } catch (err) {
      console.error("Failed to seed services:", err);
      alert("Failed to seed services");
    } finally {
      setSeeding(false);
    }
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading services...</p>
      </main>
    );
  }

  if (services.length === 0) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Handyman Qatar</h1>
        <p>No services available. Seed the database first.</p>
        <button onClick={handleSeed} disabled={seeding} style={{ marginTop: 16 }}>
          {seeding ? "Seeding..." : "Seed Services"}
        </button>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 1200, margin: "0 auto" }}>
      <h1>Handyman Qatar</h1>
      <p style={{ marginBottom: 32 }}>
        Select a service to see available options and book a handyman.
      </p>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 16
        }}
      >
        {services.map((service) => (
          <Link
            key={service.id}
            href={`/services/${service.slug}`}
            style={{
              padding: 24,
              border: "1px solid #ddd",
              borderRadius: 8,
              textDecoration: "none",
              color: "inherit",
              display: "block",
              textAlign: "center",
              transition: "transform 0.2s, box-shadow 0.2s"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            <h3 style={{ margin: 0, marginBottom: 8 }}>{service.name}</h3>
            <p style={{ margin: 0, fontSize: 14, color: "#666" }}>
              {service.subServices.length} option{service.subServices.length !== 1 ? "s" : ""}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}
