function applyDiscountCode(code, customerId, orderTotal) {
  // 1. Look up the code someone typed in.
  const discount = discountCodes[code];

  // 2. IF the code doesn't exist → error
  if (!discount) {
    return { error: "invalid code" };
  }

  // 3–4. Check if today's date is past the code's expiry date.
  if (new Date() > new Date(discount.expiryDate)) {
    return { error: "code expired" };
  }

  // 5–6. Check if the order total is at least the minimum spend.
  if (orderTotal < discount.minSpend) {
    return { error: "order too small" };
  }

  // 7–8. Check if this specific customer has already used this code before.
  if (discount.usedBy.includes(customerId)) {
    return { error: "already used" };
  }

  // 9. Work out the new price by taking the percentage off.
  const discountedPrice = orderTotal - orderTotal * (discount.percentage / 100);

  // 10. Record that this customer has now used this code.
  discount.usedBy.push(customerId);

  // 11. Return the new, discounted price.
  return { discountedPrice };
}
