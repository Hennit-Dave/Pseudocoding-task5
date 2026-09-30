# validate_order_items — pseudocode and trace

Source: food-delivery-task3-proof, migration.sql (lines 32–41)

## Pseudocode

FUNCTION validate_order_items
INPUTS: which order (or which order item) just changed
OUTPUT: nothing if everything's fine; blocks the change if something's wrong
SIDE EFFECTS: none — it only checks, it doesn't change anything itself
FAILS WHEN: an order has zero items, or its items' total doesn't match what's stored on the order

1. Work out which order needs checking (whether the change came from the order itself or one of its items)
2. Count that order's items, and add up their total price
3. IF the count of items is 0
     REJECT with error: order_requires_items
4. IF the added-up amount does not equal the order's stored total
     REJECT with error: order_total_matches_items
5. Otherwise, let it through — nothing was wrong

## Trace table

Situation 1 (normal): order with 2 items, added-up total matches stored total
→ Step 3: count is 2, not 0
→ Step 4: amounts match, no mismatch
→ Result: accepted
→ Confirmed against real code: yes (all 1,200 seeded orders pass this constantly)

Situation 2 (empty): order with 0 items
→ Step 3: count is 0
→ Result: rejected with order_requires_items
→ Confirmed against real code: yes (evidence/invalid-inserts.txt)

Situation 3 (mismatch): order with items, but added-up total doesn't match stored total
→ Step 3: count is not 0
→ Step 4: amounts don't match
→ Result: rejected with order_total_matches_items
→ Confirmed against real code: yes (evidence/additional-checks.txt)
