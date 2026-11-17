/** CLIENT COMPONENT FOR CART PAGE */

"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";

const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" })
    .format(cents / 100);

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, totalPriceCents } = useCart();

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-2xl font-semibold">Your cart is empty</h1>
        <Link
          href="/"
          className="mt-6 inline-block rounded-md bg-neutral-900 px-5 py-2.5 text-sm text-white hover:bg-neutral-800"
        >
          Back to products
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-8 text-2xl font-semibold">Your Cart</h1>
      
      <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
        {items.map(({ product, quantity }) => (
          <li key={product.id} className="flex py-6">
            <div className="h-24 w-24 flex-shrink-0 rounded-md bg-neutral-100" />
            <div className="ml-4 flex flex-1 flex-col justify-between">
              <div>
                <h3 className="font-medium">{product.name}</h3>
                <p className="mt-1 text-sm text-neutral-500">
                  {formatPrice(product.price_cents)} each
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => updateQuantity(product.id, quantity - 1)}
                    className="h-8 w-8 rounded-md border border-neutral-300 flex items-center justify-center"
                  >
                    -
                  </button>
                  <span>{quantity}</span>
                  <button
                    onClick={() => updateQuantity(product.id, quantity + 1)}
                    className="h-8 w-8 rounded-md border border-neutral-300 flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => removeFromCart(product.id)}
                  className="text-sm text-red-600 hover:text-red-500"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="mt-8">
        <div className="flex justify-between text-base font-medium text-neutral-900">
          <p>Subtotal</p>
          <p>{formatPrice(totalPriceCents)}</p>
        </div>
        <p className="mt-0.5 text-sm text-neutral-500">
          Shipping and taxes calculated at checkout.
        </p>
        <div className="mt-6">
          <Link
            href="/checkout"
            className="flex w-full items-center justify-center rounded-md bg-neutral-900 px-6 py-3 text-base font-medium text-white hover:bg-neutral-800"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}