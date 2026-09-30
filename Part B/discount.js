// Implements the pseudocode in
// discount-code-pseudocode.md. All 5 traced situations below,
// each checked against the predictions in that file.

function applyDiscountCode(codeInput, orderTotal, customerId, discountCodes, usedCodes) {
  // 1. Look up the code someone typed in
  const code = discountCodes.find(
    (item) => item.code === codeInput
  );

  // 2. If the code doesn't exist
  if (!code) {
    throw new Error("invalid code");
  }

  // 3. Check if today's date is past the code's expiry date
  const today = new Date();
  const expiryDate = new Date(code.expiryDate);

  // 4. If it's expired
  if (today > expiryDate) {
    throw new Error("code expired");
  }

  // 5. Check if the order total is at least the minimum spend
  // 6. If the order is too small
  if (orderTotal < code.minimumSpend) {
    throw new Error("order too small");
  }

  // 7. Check if this customer has already used this code
  const alreadyUsed = usedCodes.some(
    (usage) =>
      usage.customerId === customerId &&
      usage.code === codeInput
  );

  // 8. If they've already used it
  if (alreadyUsed) {
    throw new Error("already used");
  }

  // 9. Work out the new price
  const discountAmount = orderTotal * (code.percentage / 100);
  const discountedPrice = orderTotal - discountAmount;

  // 10. Record that this customer has now used this code
  usedCodes.push({
    customerId,
    code: codeInput,
  });

  // 11. Return the new discounted price
  return discountedPrice;
}

// ---- Test setup: all 5 hand-traced situations ----
const discountCodes = [
  { code: "MATE23", percentage: 15, expiryDate: "2026-10-12", minimumSpend: 50 },
];
let usedCodes = [];

// Situation 1: normal — expect 85
console.log(applyDiscountCode("MATE23", 100, "customer-1", discountCodes, usedCodes));

// Situation 2: order too small — expect "order too small"
try {
  console.log(applyDiscountCode("MATE23", 30, "customer-2", discountCodes, usedCodes));
} catch (err) {
  console.log("Error:", err.message);
}

// Situation 3: expired code — expect "code expired"
// MATE23 hasn't actually expired yet in real time, so a second, separate
// code with a past expiry date is added just for this test.
discountCodes.push({ code: "OLDCODE", percentage: 10, expiryDate: "2020-01-01", minimumSpend: 50 });
try {
  console.log(applyDiscountCode("OLDCODE", 100, "customer-3", discountCodes, usedCodes));
} catch (err) {
  console.log("Error:", err.message);
}

// Situation 4: same customer (customer-1) tries MATE23 again — already
// used it in situation 1 above — expect "already used"
try {
  console.log(applyDiscountCode("MATE23", 100, "customer-1", discountCodes, usedCodes));
} catch (err) {
  console.log("Error:", err.message);
}

// Situation 5: wrong code — expect "invalid code"
try {
  console.log(applyDiscountCode("MATE24", 100, "customer-4", discountCodes, usedCodes));
} catch (err) {
  console.log("Error:", err.message);
}