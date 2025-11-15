"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getJson, postJson } from "../../../../lib/api";

type PricingConfig = {
  basePrice: number | null;
  sizeOptions: Array<{ size: string; price: number }>;
  equipmentOptions: Array<{ name: string; price: number }>;
  addons: Array<{ name: string; price: number }>;
};

type SubService = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  service: {
    id: string;
    name: string;
    slug: string;
  };
  pricingConfig: PricingConfig | null;
};

export default function SubServicePricingPage() {
  const params = useParams();
  const router = useRouter();
  const subServiceId = params.subServiceId as string;

  const [subService, setSubService] = useState<SubService | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [totalPrice, setTotalPrice] = useState<number | null>(null);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    if (subServiceId) {
      loadSubService();
    }
  }, [subServiceId]);

  useEffect(() => {
    if (subService?.pricingConfig) {
      calculatePrice();
    }
  }, [selectedSize, selectedEquipment, selectedAddons, subService]);

  async function loadSubService() {
    try {
      const data = await getJson<SubService>(`/api/services/sub-service/${subServiceId}`);
      setSubService(data);
      // Set default size if available
      if (data.pricingConfig?.sizeOptions && data.pricingConfig.sizeOptions.length > 0) {
        setSelectedSize(data.pricingConfig.sizeOptions[0].size);
      }
    } catch (err) {
      console.error("Failed to load sub-service:", err);
    } finally {
      setLoading(false);
    }
  }

  async function calculatePrice() {
    if (!subService?.pricingConfig) return;

    setCalculating(true);
    try {
      const result = await postJson<{ totalPriceQAR: number }>(
        `/api/services/sub-service/${subServiceId}/calculate-price`,
        {
          selectedSize,
          selectedEquipment,
          selectedAddons
        }
      );
      setTotalPrice(result.totalPriceQAR);
    } catch (err) {
      console.error("Failed to calculate price:", err);
    } finally {
      setCalculating(false);
    }
  }

  function toggleEquipment(name: string) {
    setSelectedEquipment((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function toggleAddon(name: string) {
    setSelectedAddons((prev) =>
      prev.includes(name) ? prev.filter((n) => n !== name) : [...prev, name]
    );
  }

  function handleContinue() {
    const params = new URLSearchParams({
      subServiceId,
      serviceName: subService!.service.name,
      subServiceName: subService!.name,
      selectedSize: selectedSize || "",
      selectedEquipment: selectedEquipment.join(","),
      selectedAddons: selectedAddons.join(","),
      estimatedPrice: totalPrice?.toString() || ""
    });
    router.push(`/jobs/new?${params.toString()}`);
  }

  if (loading) {
    return (
      <main style={{ padding: 24 }}>
        <p>Loading...</p>
      </main>
    );
  }

  if (!subService) {
    return (
      <main style={{ padding: 24 }}>
        <p>Sub-service not found.</p>
        <Link href="/">← Back to home</Link>
      </main>
    );
  }

  const config = subService.pricingConfig;

  return (
    <main style={{ padding: 24, maxWidth: 800, margin: "0 auto" }}>
      <Link
        href={`/services/${subService.service.slug}`}
        style={{ display: "inline-block", marginBottom: 16, textDecoration: "none" }}
      >
        ← Back to {subService.service.name}
      </Link>
      <h1>{subService.name}</h1>
      {subService.description && (
        <p style={{ marginBottom: 32, color: "#666", fontSize: 18, lineHeight: 1.6 }}>
          {subService.description}
        </p>
      )}

      {!config ? (
        <div style={{ padding: 24, backgroundColor: "#f5f5f5", borderRadius: 8 }}>
          <p>No pricing configuration available for this service.</p>
          <Link href={`/jobs/new?subServiceId=${subServiceId}`}>Continue to booking</Link>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {/* Size Selection */}
            {config.sizeOptions && config.sizeOptions.length > 0 && (
              <div>
                <h2 style={{ marginBottom: 16 }}>House Size</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                  {config.sizeOptions.map((option) => (
                    <button
                      key={option.size}
                      onClick={() => setSelectedSize(option.size)}
                      style={{
                        padding: "12px 24px",
                        border: selectedSize === option.size ? "2px solid #0070f3" : "1px solid #ddd",
                        borderRadius: 8,
                        backgroundColor: selectedSize === option.size ? "#e6f2ff" : "white",
                        cursor: "pointer",
                        fontSize: 16,
                        fontWeight: selectedSize === option.size ? 600 : 400
                      }}
                    >
                      {option.size}
                      {option.price > 0 && (
                        <span style={{ marginLeft: 8, color: "#666" }}>+{option.price} QAR</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Equipment Options */}
            {config.equipmentOptions && config.equipmentOptions.length > 0 && (
              <div>
                <h2 style={{ marginBottom: 16 }}>Equipment</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {config.equipmentOptions.map((option) => (
                    <label
                      key={option.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: 16,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedEquipment.includes(option.name)}
                        onChange={() => toggleEquipment(option.name)}
                        style={{ marginRight: 12, width: 20, height: 20 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{option.name}</div>
                      </div>
                      <div style={{ fontWeight: 600, color: "#0070f3" }}>+{option.price} QAR</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Additional Services */}
            {config.addons && config.addons.length > 0 && (
              <div>
                <h2 style={{ marginBottom: 16 }}>Additional Services</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {config.addons.map((addon) => (
                    <label
                      key={addon.name}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: 16,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        cursor: "pointer"
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedAddons.includes(addon.name)}
                        onChange={() => toggleAddon(addon.name)}
                        style={{ marginRight: 12, width: 20, height: 20 }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 500 }}>{addon.name}</div>
                      </div>
                      <div style={{ fontWeight: 600, color: "#0070f3" }}>+{addon.price} QAR</div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Price Summary */}
            <div
              style={{
                padding: 24,
                backgroundColor: "#f9f9f9",
                borderRadius: 8,
                border: "2px solid #0070f3"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, color: "#666", marginBottom: 4 }}>Total Price</div>
                  <div style={{ fontSize: 32, fontWeight: 700, color: "#0070f3" }}>
                    {calculating ? "..." : totalPrice !== null ? `${totalPrice} QAR` : "—"}
                  </div>
                </div>
                <button
                  onClick={handleContinue}
                  disabled={!totalPrice || calculating}
                  style={{
                    padding: "16px 32px",
                    fontSize: 18,
                    fontWeight: 600,
                    backgroundColor: totalPrice && !calculating ? "#0070f3" : "#ccc",
                    color: "white",
                    border: "none",
                    borderRadius: 8,
                    cursor: totalPrice && !calculating ? "pointer" : "not-allowed"
                  }}
                >
                  Continue to Booking
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </main>
  );
}

