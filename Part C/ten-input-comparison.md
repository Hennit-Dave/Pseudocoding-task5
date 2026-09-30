# Part C3 — comparing both implementations on 10 inputs

Ran mine (part-b/discount.js) and the AI's version (part-c/ai-implementation.js)
against the same 10 inputs, side by side. Script: part-c/compare.js.

## Results

| Situation | Mine | AI | Match? |
|---|---|---|---|
| 1. normal | 85 | 85 | yes |
| 2. too small | error: order too small | error: order too small | yes |
| 3. expired | error: code expired | error: code expired | yes |
| 4. reused (customer-1) | error: already used | error: already used | yes |
| 5. wrong code | error: invalid code | error: invalid code | yes |
| 6. exact boundary $50 | 42.5 | 42.5 | yes |
| 7. different customer | 85 | 85 | yes |
| 8. 100% off | 0 | 0 | yes |
| 9. zero order total | error: order too small | error: order too small | yes |
| 10. negative order total | error: order too small | error: order too small | yes |

All 10 agree. No disagreements to trace back to the pseudocode this time —
both implementations reach the same decision on every input tried,
including four new edge cases (exact boundary, a different customer,
100% off, zero and negative totals) that weren't part of the original 5.

## Conclusion

The two real differences found in Part C2 (the AI's missing inputs, and
the wrapped-vs-plain return shape) are both interface differences, not
logic differences — neither one changed what decision the function
actually reached on any of the 10 inputs. Same correct logic, built two
slightly different ways.

## Finding worth noting, unrelated to the AI comparison

Situation 10 (negative order total) technically passes, but only by
coincidence: a negative number is always less than the minimum spend, so
it lands in the same "order too small" bucket as situation 2, even though
a negative total is a fundamentally different kind of problem — invalid,
corrupted data, not a legitimately small order. A more complete version
of the original pseudocode would check for a negative or invalid total as
its own explicit case, with its own distinct error, rather than letting
it fall into an unrelated check by accident. Not fixed here, since it
applies equally to both B1/B2 (already complete) and C1 (already built) —
recorded as a genuine gap found while testing, which is exactly what this
exercise is for.
