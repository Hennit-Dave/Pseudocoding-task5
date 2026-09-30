// Part C3 — running my implementation and the AI's implementation
// against the same 10 inputs, side by side.

// ---------- My version (from part-b/discount.js) ----------
function applyDiscountCodeMine(codeInput, orderTotal, customerId, discountCodes, usedCodes) {
  const code = discountCodes.find((item) => item.code === codeInput);
  if (!code) throw new Error("invalid code");

  const today = new Date();
  const expiryDate = new Date(code.expiryDate);
  if (today > expiryDate) throw new Error("code expired");

  if (orderTotal < code.minimumSpend) throw new Error("order too small");

  const alreadyUsed = usedCodes.some(
    (usage) => usage.customerId === customerId && usage.code === codeInput
  );
  if (alreadyUsed) throw new Error("already used");

  const discountAmount = orderTotal * (code.percentage / 100);
  const discountedPrice = orderTotal - discountAmount;

  usedCodes.push({ customerId, code: codeInput });
  return discountedPrice;
}

// ---------- The AI's version (paste exactly as Antigravity gave it) ----------
function applyDiscountCodeAI(code, customerId, orderTotal) {
  const discount = discountCodes[code];
  if (!discount) return { error: "invalid code" };

  if (new Date() > new Date(discount.expiryDate)) return { error: "code expired" };
  if (orderTotal < discount.minSpend) return { error: "order too small" };
  if (discount.usedBy.includes(customerId)) return { error: "already used" };

  const discountedPrice = orderTotal - orderTotal * (discount.percentage / 100);
  discount.usedBy.push(customerId);
  return { discountedPrice };
}

// ---------- Two separate datasets, same underlying codes ----------
const myDiscountCodes = [
  { code: "MATE23", percentage: 15, expiryDate: "2026-10-12", minimumSpend: 50 },
  { code: "OLDCODE", percentage: 10, expiryDate: "2020-01-01", minimumSpend: 50 },
  { code: "FREECODE", percentage: 100, expiryDate: "2026-12-31", minimumSpend: 10 },
];
let myUsedCodes = [];

// The AI's function reads a global literally named `discountCodes`.
let discountCodes = {
  MATE23: { percentage: 15, expiryDate: "2026-10-12", minSpend: 50, usedBy: [] },
  OLDCODE: { percentage: 10, expiryDate: "2020-01-01", minSpend: 50, usedBy: [] },
  FREECODE: { percentage: 100, expiryDate: "2026-12-31", minSpend: 10, usedBy: [] },
};

// ---------- Normalize both results into the same shape for fair comparison ----------
function runMine(code, orderTotal, customerId) {
  try {
    return { success: true, value: applyDiscountCodeMine(code, orderTotal, customerId, myDiscountCodes, myUsedCodes) };
  } catch (err) {
    return { success: false, value: err.message };
  }
}
function runAI(code, customerId, orderTotal) {
  const result = applyDiscountCodeAI(code, customerId, orderTotal);
  return result.error ? { success: false, value: result.error } : { success: true, value: result.discountedPrice };
}

// ---------- 10 situations, in order (state carries forward, like usedBy lists) ----------
const situations = [
  { label: "1. normal",              code: "MATE23",   orderTotal: 100, customerId: "customer-1" },
  { label: "2. too small",           code: "MATE23",   orderTotal: 30,  customerId: "customer-2" },
  { label: "3. expired",             code: "OLDCODE",  orderTotal: 100, customerId: "customer-3" },
  { label: "4. reused (customer-1)", code: "MATE23",   orderTotal: 100, customerId: "customer-1" },
  { label: "5. wrong code",          code: "MATE24",   orderTotal: 100, customerId: "customer-4" },
  { label: "6. exact boundary $50",  code: "MATE23",   orderTotal: 50,  customerId: "customer-5" },
  { label: "7. different customer",  code: "MATE23",   orderTotal: 100, customerId: "customer-6" },
  { label: "8. 100% off",            code: "FREECODE", orderTotal: 50,  customerId: "customer-7" },
  { label: "9. zero order total",    code: "MATE23",   orderTotal: 0,   customerId: "customer-8" },
  { label: "10. negative order total", code: "MATE23", orderTotal: -20, customerId: "customer-9" },
];

console.log("LABEL".padEnd(24), "MINE".padEnd(20), "AI".padEnd(20), "MATCH?");
for (const s of situations) {
  const mine = runMine(s.code, s.orderTotal, s.customerId);
  const ai = runAI(s.code, s.customerId, s.orderTotal);
  const mineStr = mine.success ? String(mine.value) : `error: ${mine.value}`;
  const aiStr = ai.success ? String(ai.value) : `error: ${ai.value}`;
  const match = mineStr === aiStr ? "yes" : "NO — DIFFERS";
  console.log(s.label.padEnd(24), mineStr.padEnd(20), aiStr.padEnd(20), match);
}
