/**
 * KAITO MarketPlace commission logic.
 *
 * Every sale (Digital Product, Made-to-Order Product, or Digital Service)
 * is split as:
 *   - 15% marketplace fee
 *   - 5%  payment-processing allowance
 *   - 20% total platform commission
 *   - 80% seller payout
 *
 * The buyer is charged the full subtotal (itemPrice * quantity) -
 * commission is deducted from the seller's side, not added on top
 * of what the buyer sees. This keeps listed prices "what you pay".
 */

export const MARKETPLACE_FEE_RATE = 0.15;
export const PAYMENT_PROCESSING_RATE = 0.05;
export const TOTAL_COMMISSION_RATE = MARKETPLACE_FEE_RATE + PAYMENT_PROCESSING_RATE; // 0.20
export const SELLER_PAYOUT_RATE = 1 - TOTAL_COMMISSION_RATE; // 0.80

/**
 * @param {number} itemPrice - unit price of the product/service package
 * @param {number} quantity - number of units (default 1)
 * @returns {{
 *   itemPrice: number, quantity: number, subtotal: number,
 *   marketplaceFee: number, paymentProcessingFee: number,
 *   totalCommission: number, sellerPayout: number, totalCharged: number
 * }}
 */
export function calculateCommission(itemPrice, quantity = 1) {
  if (typeof itemPrice !== "number" || itemPrice <= 0) {
    throw new Error("itemPrice must be a positive number");
  }
  if (typeof quantity !== "number" || quantity < 1) {
    throw new Error("quantity must be a positive integer");
  }

  const round2 = (n) => Math.round(n * 100) / 100;

  const subtotal = round2(itemPrice * quantity);
  const marketplaceFee = round2(subtotal * MARKETPLACE_FEE_RATE);
  const paymentProcessingFee = round2(subtotal * PAYMENT_PROCESSING_RATE);
  const totalCommission = round2(marketplaceFee + paymentProcessingFee);
  const sellerPayout = round2(subtotal - totalCommission);

  return {
    itemPrice,
    quantity,
    subtotal,
    marketplaceFee,
    paymentProcessingFee,
    totalCommission,
    sellerPayout,
    totalCharged: subtotal,
  };
}
