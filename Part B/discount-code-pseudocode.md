# applyDiscountCode — pseudocode and trace

## Pseudocode

FUNCTION applyDiscountCode
INPUTS: the code someone typed in, which customer they are, and the order total before discount
OUTPUT: either the new discounted price, or an error explaining why the code didn't work
SIDE EFFECTS: records that this customer has now used this code
FAILS WHEN: the code doesn't exist, it's expired, the order's too small, or this customer already used it

1. Look up the code someone typed in.
2. IF the code doesn't exist → error: "invalid code"
3. Check if today's date is past the code's expiry date.
4. IF it's expired → error: "code expired"
5. Check if the order total is at least the minimum spend.
6. IF the order's too small → error: "order too small"
7. Check if this specific customer has already used this code before.
8. IF they've already used it → error: "already used"
9. Otherwise: work out the new price by taking the percentage off.
10. Record that this customer has now used this code.
11. Return the new, discounted price.

## Design decision

Expiry means the code stops working at the very start of the expiry day —
the expiry day itself is not usable, only days strictly before it. Decided
deliberately after tracing situation 3 below and checking how the code
actually behaves at midnight on the expiry date.

## Trace table (all tested using MATE23: 15% off, expires 12 Oct 2026, $50 minimum)

Situation 1 (normal): $100 order, valid code, first time using it
→ All checks pass → Result: $85, customer marked as having used MATE23
→ Confirmed against real code: yes — printed 85

Situation 2 (too small): $30 order
→ Step 5-6: $30 is below the $50 minimum → Result: error "order too small"
→ Confirmed against real code: yes — printed "Error: order too small"

Situation 3 (expired): valid $100 order, but today is after 12 Oct 2026
→ Step 3-4: code has expired → Result: error "code expired"
→ Note: the function stops here — it never checks the minimum spend or
  reuse, even though this order would pass both
→ Tested using a second code, OLDCODE, with an expiry date already in the
  past (2020-01-01), since MATE23 itself hasn't actually expired in real
  time yet — you can't test "expired" honestly using a code that isn't
  actually expired right now
→ Confirmed against real code: yes — printed "Error: code expired"

Situation 4 (reused): $100 order, but this customer already used MATE23 before
→ Step 7-8: already used → Result: error "already used"
→ Confirmed against real code: yes — printed "Error: already used"

Situation 5 (wrong code): customer types "MATE24" instead of "MATE23"
→ Step 1-2: code not found → Result: error "invalid code"
→ Confirmed against real code: yes — printed "Error: invalid code"

## Note found while tracing
Checks run in strict order, and only the FIRST failing check's error is
returned — even if a later check would have also failed for a different
reason. Confirmed directly while tracing situation 3.

## Result

All 5 hand-traced predictions matched the real, running code exactly —
same order, same outcomes, no mismatches. B1 (the plan) and B2 (the build)
are both complete and verified against each other.