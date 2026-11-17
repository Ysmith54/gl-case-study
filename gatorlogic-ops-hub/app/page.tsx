/** CLIENT COMPONENT FOR CATALOG PAGE */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    .format(cents / 100);

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
   const { addToCart, totalItems } = useCart();

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("products")
        .select("id, name, description, price_cents, image_url")
        .order("created_at", { ascending: true });

      if (error) setError(error.message);
      else setProducts(data ?? []);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="mx-auto max-w-5xl px-6 py-16">
      <header className="mb-12 grid grid-cols-1 items-center gap-6 sm:grid-cols-2">
        {/* Left Column: Text */}
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Order Online</h1>
          <p className="mt-2 text-neutral-600">
            Freshly roasted, shipped weekly. Pickup available at the roastery.
          </p>
        </div>
        
        {/* Right Column: Cart Button */}
        <div className="flex sm:justify-end">
          <Link
            href="/cart"
            className="inline-flex shrink-0 items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
          >
            Cart ({totalItems})
          </Link>
        </div>
      </header>

      {loading && <p className="text-neutral-500">Loading products…</p>}
      {error && (
        <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load products: {error}
        </p>
      )}

      {!loading && !error && (
        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <li
              key={p.id}
              className="flex flex-col rounded-xl border border-neutral-200 p-6"
            >
              <div className="mb-4 aspect-square rounded-lg bg-neutral-100" />
              <h2 className="font-medium">{p.name}</h2>
              {p.description && (
                <p className="mt-1 flex-1 text-sm text-neutral-600">
                  {p.description}
                </p>
              )}
              <div className="mt-4 flex items-center justify-between">
                <span className="font-semibold">{formatPrice(p.price_cents)}</span>
                 <button
                  onClick={() => addToCart(p)}
                  className="cursor-pointer rounded-md bg-neutral-900 px-3 py-1.5 text-sm text-white hover:bg-neutral-800 transition-colors"
                >
                  Add to cart
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}