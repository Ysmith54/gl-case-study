/** CLIENT COMPONENT FOR SUCCESS CHECKOUT PAGE */

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function SuccessPage() {
  const [orderId, setOrderId] = useState<string | null>(null);

  useEffect(() => {
    const id = sessionStorage.getItem("last_order_id");
    setOrderId(id);
    // Optional: clear it after reading so refreshing doesn't show the old ID
    // sessionStorage.removeItem("last_order_id");
  }, []);

  return (
    <main className="mx-auto max-w-xl px-6 py-24 text-center">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
        <svg
          className="h-8 w-8 text-green-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="2"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-semibold">Order Received</h1>
      <p className="mt-2 text-neutral-600">
        Thank you! We've received your order and will be in touch shortly.
      </p>
      
      {orderId && (
        <p className="mt-4 rounded-md bg-neutral-50 p-3 text-sm text-neutral-500">
          Order Reference: <span className="font-mono">{orderId}</span>
        </p>
      )}

      <Link
        href="/"
        className="mt-8 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-800"
      >
        Return to Shop
      </Link>
    </main>
  );
}