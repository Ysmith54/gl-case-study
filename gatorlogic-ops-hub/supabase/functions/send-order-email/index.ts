// supabase/functions/send-order-email/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

serve(async (req) => {
  // Handle CORS (important for browser calls)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' } })
  }

  try {
    const { orderId, customerName, customerContact, total, items } = await req.json()

    // Format the items list for the email
    const itemsHtml = items.map((item: any) => `<li>${item.quantity}x ${item.name} ($${(item.price_cents / 100).toFixed(2)})</li>`).join('')

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'GatorLogic Demo <hello@gatorlogic.io>', // Use your verified domain
        to: ['requests@gatorlogic.io'], // Where you want to receive alerts
        subject: `New Order Received: ${customerName} (${orderId.slice(0, 8)})`,
        html: `
          <h2>New Order from ${customerName}</h2>
          <p><strong>Contact:</strong> ${customerContact}</p>
          <p><strong>Total:</strong> $${(total / 100).toFixed(2)}</p>
          <h3>Items:</h3>
          <ul>${itemsHtml}</ul>
          <p><a href="https://demo.gatorlogic.io/admin">View in Dashboard</a></p>
        `,
      }),
    })

    const data = await res.json()
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      status: 400,
    })
  }
})