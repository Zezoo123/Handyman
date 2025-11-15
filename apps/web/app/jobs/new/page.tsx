"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { postJson } from "../../../lib/api";

type Job = {
  id: string;
  title: string;
};

export default function NewJobPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const subServiceId = searchParams.get("subServiceId");
  const serviceName = searchParams.get("serviceName");
  const subServiceName = searchParams.get("subServiceName");
  const selectedSize = searchParams.get("selectedSize");
  const selectedEquipment = searchParams.get("selectedEquipment")?.split(",").filter(Boolean) || [];
  const selectedAddons = searchParams.get("selectedAddons")?.split(",").filter(Boolean) || [];
  const estimatedPrice = searchParams.get("estimatedPrice");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [scheduledAt, setScheduledAt] = useState("");
  const [locationText, setLocationText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Job | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If no subServiceId, redirect to home
  useEffect(() => {
    if (!subServiceId) {
      router.push("/");
    }
  }, [subServiceId, router]);

  async function submit() {
    if (!subServiceId) {
      setError("Sub-service is required");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const body: any = {
        title: title || `${subServiceName || "Service"} Request`,
        description,
        subServiceId,
        customerId
      };
      if (scheduledAt) body.scheduledAt = new Date(scheduledAt).toISOString();
      if (locationText) body.locationText = locationText;
      if (selectedSize) body.selectedSize = selectedSize;
      if (selectedEquipment.length > 0) body.selectedEquipment = selectedEquipment;
      if (selectedAddons.length > 0) body.selectedAddons = selectedAddons;
      const job = await postJson<Job>("/api/jobs", body);
      setResult(job);
      // Reset form
      setTitle("");
      setDescription("");
      setScheduledAt("");
      setLocationText("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create job");
    } finally {
      setLoading(false);
    }
  }

  if (!subServiceId) {
    return (
      <main style={{ padding: 24 }}>
        <p>Please select a service first.</p>
        <Link href="/">← Back to services</Link>
      </main>
    );
  }

  return (
    <main style={{ padding: 24, maxWidth: 720, margin: "0 auto" }}>
      <Link href="/" style={{ display: "inline-block", marginBottom: 16, textDecoration: "none" }}>
        ← Back to services
      </Link>
      <h1>Book {subServiceName || "Service"}</h1>
      {serviceName && (
        <p style={{ marginBottom: 8, color: "#666" }}>
          Service: <strong>{serviceName}</strong> → <strong>{subServiceName}</strong>
        </p>
      )}
      {estimatedPrice && (
        <div
          style={{
            marginBottom: 24,
            padding: 12,
            backgroundColor: "#e6f2ff",
            borderRadius: 6,
            display: "inline-block"
          }}
        >
          <strong>Estimated Price: {estimatedPrice} QAR</strong>
          {selectedSize && <div style={{ fontSize: 14, marginTop: 4 }}>Size: {selectedSize}</div>}
        </div>
      )}
      <div style={{ display: "grid", gap: 16 }}>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Title</div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={`${subServiceName || "Service"} Request`}
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        </label>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Description</div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Describe what you need..."
            style={{ width: "100%", padding: 8, fontSize: 16, fontFamily: "inherit" }}
            required
          />
        </label>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>
            Customer ID <span style={{ color: "#999", fontSize: 14 }}>(temporary - until auth is added)</span>
          </div>
          <input
            type="text"
            value={customerId}
            onChange={(e) => setCustomerId(e.target.value)}
            placeholder="Enter a user ID (cuid)"
            style={{ width: "100%", padding: 8, fontSize: 16 }}
            required
          />
        </label>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Preferred time (optional)</div>
          <input
            type="datetime-local"
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        </label>
        <label>
          <div style={{ marginBottom: 4, fontWeight: 500 }}>Location notes (optional)</div>
          <input
            type="text"
            value={locationText}
            onChange={(e) => setLocationText(e.target.value)}
            placeholder="Address or location details"
            style={{ width: "100%", padding: 8, fontSize: 16 }}
          />
        </label>
        <button
          onClick={submit}
          disabled={loading || !description || !customerId}
          style={{
            padding: 12,
            fontSize: 16,
            fontWeight: 500,
            backgroundColor: loading ? "#ccc" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Creating..." : "Create Job Request"}
        </button>
        {error && (
          <div style={{ padding: 12, backgroundColor: "#fee", color: "#c00", borderRadius: 6 }}>
            {error}
          </div>
        )}
        {result && (
          <div style={{ padding: 12, backgroundColor: "#efe", color: "#060", borderRadius: 6 }}>
            <p style={{ margin: 0 }}>
              <strong>Job created successfully!</strong>
            </p>
            <p style={{ margin: "8px 0 0 0", fontSize: 14 }}>
              Job ID: {result.id}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
