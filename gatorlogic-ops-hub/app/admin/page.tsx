/** ADMIN DASHBOARD */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { signOut } from "@/lib/auth";
import type { Order, OrderStatus } from "@/lib/types";

type OrderWithItems = Order & {
  order_items: {
    quantity: number;
    unit_price_cents: number;
    products: { name: string };
  }[];
};

const STATUS_FLOW: OrderStatus[] = ["new", "preparing", "ready", "completed"];

export default function AdminDashboard() {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderWithItems[]>([]);
  const [loading, setLoading] = useState(true);

  
  const fetchOrders = async () => {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items (
          quantity,
          unit_price_cents,
          products ( name )
        )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setOrders(data as unknown as OrderWithItems[]);
    }
    setLoading(false);
  };

  const sortedOrders = [...orders].sort((a, b) => {
    const statusWeight = {
      new: 1,
      preparing: 2,
      ready: 3,
      completed: 4,
      cancelled: 5
    };
    
    // First sort by status weight
    if (statusWeight[a.status] !== statusWeight[b.status]) {
      return statusWeight[a.status] - statusWeight[b.status];
    }
    
    // Then sort by date (newest first within the same status)
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  useEffect(() => {
    fetchOrders();
     // Check login state
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });

    // Listen for login state changes (e.g., logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        router.replace("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const advanceStatus = async (orderId: string, currentStatus: OrderStatus) => {
    const currentIndex = STATUS_FLOW.indexOf(currentStatus);
    if (currentIndex === -1 || currentIndex === STATUS_FLOW.length - 1) return;

    const nextStatus = STATUS_FLOW[currentIndex + 1];

    // Optimistic UI update
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: nextStatus } : o))
    );

    await supabase
      .from("orders")
      .update({ status: nextStatus })
      .eq("id", orderId);
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/admin/login");
  };

  const formatPrice = (cents: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
      cents / 100
    );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });

  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="bg-white border-b border-neutral-200">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold text-neutral-900">Operator Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        {loading ? (
          <p className="text-neutral-500">Loading orders...</p>
        ) : sortedOrders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">No orders yet</h3>
            <p className="mt-1 text-neutral-500">When customers place orders, they will appear here.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {sortedOrders.map((order) => {
              const total = order.order_items.reduce(
                (sum, item) => sum + item.quantity * item.unit_price_cents,
                0
              );
              const nextStatusIndex = STATUS_FLOW.indexOf(order.status) + 1;
              const nextStatus = STATUS_FLOW[nextStatusIndex];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm flex flex-col md:flex-row gap-6"
                >
                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg font-semibold text-neutral-900">
                        {order.customer_name}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium uppercase tracking-wide
                        ${order.status === "new" ? "bg-blue-100 text-blue-800" : ""}
                        ${order.status === "preparing" ? "bg-yellow-100 text-yellow-800" : ""}
                        ${order.status === "ready" ? "bg-green-100 text-green-800" : ""}
                        ${order.status === "completed" ? "bg-neutral-100 text-neutral-800" : ""}
                      `}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500">
                      {order.customer_contact} • {formatDate(order.created_at)}
                    </p>
                    {order.notes && (
                      <p className="mt-2 text-sm text-neutral-600 bg-neutral-50 p-2 rounded">
                        <span className="font-medium">Note:</span> {order.notes}
                      </p>
                    )}
                    
                    <ul className="mt-4 space-y-2 border-t border-neutral-100 pt-4">
                      {order.order_items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span className="text-neutral-700">
                            {item.quantity}x {item.products.name}
                          </span>
                          <span className="font-medium text-neutral-900">
                            {formatPrice(item.quantity * item.unit_price_cents)}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-4 pt-4 border-t border-neutral-100 flex justify-between font-medium">
                      <span>Total</span>
                      <span>{formatPrice(total)}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="md:w-48 flex flex-col justify-center border-t md:border-t-0 md:border-l border-neutral-100 pt-4 md:pt-0 md:pl-6">
                    {nextStatus ? (
                      <button
                        onClick={() => advanceStatus(order.id, order.status)}
                        className="w-full rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 transition-colors"
                      >
                        Mark as {nextStatus}
                      </button>
                    ) : (
                      <p className="text-center text-sm text-neutral-500">
                        Order complete
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}