# Part C2 — Comparing my pseudocode against the AI's code

## Reverse-engineered pseudocode
(written from the AI's code alone, without looking at my original
discount-code-pseudocode.md until after this was finished)

FUNCTION applyDiscountCode (AI's version, reverse-engineered)
INPUTS: the code, the customer's id, the order total
OUTPUT: either the discounted price, or an error
SIDE EFFECTS: adds the customer's id to the code's usedBy list
FAILS WHEN: the code doesn't exist, it's expired, the order's too small, or already used

1. Look up the code. IF it doesn't exist -> error: "invalid code"
2. IF today is past the expiry date -> error: "code expired"
3. IF the order total is less than the code's minimum spend -> error: "order too small"
4. IF this customer's id is already in the code's usedBy list -> error: "already used"
5. Work out the new discounted price by taking the percentage off the order total
6. Add the customer's id to the usedBy list
7. Return the discounted price

## Difference table

| # | Difference | Classification | Explanation |
|---|---|---|---|
| 1 | AI's function takes 3 inputs (code, customerId, orderTotal). Mine takes 5 (codeInput, orderTotal, customerId, discountCodes, usedCodes). The AI's version reads `discountCodes[code]` and `discount.usedBy` without ever receiving `discountCodes` or `usedCodes` as inputs — it assumes a variable named `discountCodes` already exists somewhere outside the function. | AI omitted something specified | My pseudocode's INPUTS line only names "the code, which customer, the order total" directly, but the function needs something to look codes up against. Mine receives that data explicitly through its inputs, so it can run completely standalone. The AI's version can't run on its own — it would crash with "discountCodes is not defined" unless something outside the function happens to already exist with that exact name. |
| 2 | On success, mine returns a plain number (e.g. `85`). The AI's returns an object: `{ discountedPrice: 85 }`. Same pattern on errors — mine throws a real Error; the AI's returns `{ error: "..." }`. | My original pseudocode was ambiguous | My OUTPUT line said "either the new discounted price, or an error explaining why the code didn't work" — but never specified the exact shape of that return value (plain value vs. wrapped object). The AI made a reasonable choice I simply never pinned down. Fix for next time: OUTPUT lines should specify the exact shape of the return value, not just what it conceptually represents. |

## What matched exactly
All 8 core logic checks are identical in both versions, in the same order,
with the same 4 error messages: invalid code, code expired, order too
small, already used. The AI did not add any extra, unrequested validation
or behavior — everything present in its version traces back to something
in my original pseudocode.
