/** CLIENT COMPONENT FOR CHECKOUT PAGE */
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalPriceCents, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("name") as string;
    const customerContact = formData.get("contact") as string;
    const notes = formData.get("notes") as string;

    // Format items for our Postgres function
    const orderItems = items.map((item) => ({
      product_id: item.product.id,
      quantity: item.quantity,
    }));

    const { data: orderId, error } = await supabase.rpc("create_order", {
      p_customer_name: customerName,
      p_customer_contact: customerContact,
      p_notes: notes,
      p_items: orderItems,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
        const emailPayload = {
            orderId: orderId,
            customerName: customerName,
            customerContact: customerContact,
            total: totalPriceCents,
            items: items.map(item => ({
            name: item.product.name,
            quantity: item.quantity,
            price_cents: item.product.price_cents
        }))
        };
    
        // Fire and forget (don't await, so the user isn't blocked if email fails)
        supabase.functions.invoke('send-order-email', { body: emailPayload })
            .catch(err => console.error("Email notification failed:", err));
        // -------------------------------------

      clearCart();
      // Store order ID in session storage for the success page to display
      sessionStorage.setItem("last_order_id", orderId as string);
      router.push("/checkout/success");
    }
  };

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold">Checkout</h1>
      
      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-neutral-700">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div>
          <label htmlFor="contact" className="block text-sm font-medium text-neutral-700">
            Email or Phone
          </label>
          <input
            type="text"
            id="contact"
            name="contact"
            required
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-neutral-700">
            Order Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            className="mt-1 block w-full rounded-md border border-neutral-300 px-3 py-2 shadow-sm focus:border-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>

        <div className="border-t border-neutral-200 pt-6">
          <div className="flex justify-between text-base font-medium text-neutral-900">
            <p>Total</p>
            <p>
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: "USD",
              }).format(totalPriceCents / 100)}
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium text-white hover:bg-neutral-800 disabled:opacity-50"
        >
          {loading ? "Placing Order..." : "Place Order"}
        </button>
      </form>
    </main>
  );
}