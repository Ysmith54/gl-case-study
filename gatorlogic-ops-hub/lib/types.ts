export type Product = {
  id: string;
  name: string;
  description: string | null;
  price_cents: number;
  image_url: string | null;
};

export type OrderStatus = "new" | "preparing" | "ready" | "completed" | "cancelled";

export type Order = {
  id: string;
  customer_name: string;
  customer_contact: string;
  notes: string | null;
  status: OrderStatus;
  created_at: string;
};