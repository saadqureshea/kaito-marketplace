/**
 * PayPal Payouts (Sandbox) - releases a seller's 80% share once an order
 * is marked "completed". Uses the REST Payouts API directly since
 * @paypal/checkout-server-sdk only covers Orders/Checkout, not Payouts.
 *
 * Failure here (e.g. seller hasn't set a payout email yet) must never
 * block the order status update - it's surfaced back to the caller so
 * the order can stay `payoutReleased: false` until retried.
 */

const PAYPAL_API_BASE =
  process.env.PAYPAL_MODE === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";

async function getAccessToken() {
  const auth = Buffer.from(`${process.env.PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`).toString(
    "base64"
  );
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!response.ok) {
    throw new Error(`PayPal auth failed: ${response.status}`);
  }
  const data = await response.json();
  return data.access_token;
}

/**
 * @param {{ email: string, amount: number, currency?: string, note?: string, senderItemId: string }} params
 * @returns {Promise<{ payoutBatchId: string, payoutItemId: string }>}
 */
export async function sendPayout({ email, amount, currency = "USD", note, senderItemId }) {
  if (!email) {
    throw new Error("Seller has not set a PayPal payout email yet");
  }

  const accessToken = await getAccessToken();

  const response = await fetch(`${PAYPAL_API_BASE}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: `kaito-${senderItemId}-${Date.now()}`,
        email_subject: "You've been paid by KAITO MarketPlace",
        email_message: note || "Your order payout has been released.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: { value: amount.toFixed(2), currency },
          receiver: email,
          note: note || "KAITO MarketPlace seller payout",
          sender_item_id: senderItemId,
        },
      ],
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.message || `PayPal payout failed: ${response.status}`);
  }

  return {
    payoutBatchId: data.batch_header?.payout_batch_id,
    payoutItemId: data.items?.[0]?.payout_item_id,
  };
}
