"use client";

import { useEffect, useState } from "react";
import { getJson, postJson } from "../../lib/api";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seeded, setSeeded] = useState(false);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await getJson<Category[]>("/api/categories");
      setCategories(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function seed() {
    setLoading(true);
    setError(null);
    try {
      await postJson("/api/categories/seed", {});
      setSeeded(true);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to seed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ padding: 24 }}>
      <h1>Categories</h1>
      <div style={{ margin: "12px 0" }}>
        <button onClick={seed} disabled={loading}>
          Seed baseline
        </button>
        {seeded && <span style={{ marginLeft: 8 }}>Seeded</span>}
      </div>
      {loading && <p>Loading...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {categories.map((c) => (
          <li key={c.id}>
            {c.name} <small>({c.slug})</small>
          </li>
        ))}
      </ul>
    </main>
  );
}


