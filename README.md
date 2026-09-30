# Task 5 — Pseudocoding

Reading code into pseudocode, writing pseudocode into code, and directing
an AI with pseudocode before checking what it actually built.

## The pseudocode standard used throughout

Every function in this repo is pseudocoded in the same fixed shape:

```
FUNCTION name
INPUTS: each input, with what it means
OUTPUT: what comes back, and its shape
SIDE EFFECTS: anything written, sent, or changed outside the function — or NONE
FAILS WHEN: every condition under which it can't succeed

1. One action per step, plain English, present tense.
2. IF a condition
     do this
   OTHERWISE
     do that
3. FOR EACH item in a list
     do something with it
   END FOR
4. CALL an external thing (may be slow, may fail)
5. RETURN or REJECT, always with what's actually being returned
```

The rule behind it: someone who has never seen the real code should be
able to read the pseudocode and predict exactly what happens for any
input — including the ones that weren't obviously going to come up.

## What's in each part

- **`Part A/`** — three functions pseudocoded from my own repos
  (`rateLimit`, `handleFailure`, `validate_order_items`), each with a
  hand-traced, then real-code-confirmed, set of test situations. Three
  more from `@upstash/ratelimit`, pseudocoded independently before any AI
  involvement, then compared against a second pass afterward. A function
  with a bug planted by someone else, pseudocoded as-is and as it should
  be — the difference between the two names the bug.
- **`Part B/`** — a discount-code feature, planned completely in
  pseudocode and hand-traced against 5 situations before any code
  existed, then built by hand from that plan, with all 5 predictions
  confirmed against the real, running result.
- **`Part C/`** — the same pseudocode handed to an AI agent with no other
  context, its output reverse-engineered into pseudocode without looking
  at the original, every difference between the two classified, both
  implementations run against 10 inputs side by side, and a recorded
  explanation of the AI's version tested against a non-technical
  listener.

## What I learned about the gap between specifying and getting

The honest version: I didn't fully understand how much my own pseudocode
was leaving unsaid until something — a trace, a real run, or an AI's
independent interpretation — forced the gap into the open.

**A spec can be internally consistent and still be silent on a real
case.** My `rateLimit` pseudocode said "get the visitor's IP and check
it's valid" but never said what happens when it isn't. The real code has
an answer — fall back to a shared `'unknown'` bucket — that my own
written steps simply didn't cover. I only caught this by actually tracing
a request with no IP at all, not by rereading what I'd already written.

**"What it returns" and "what shape it returns in" are two different
questions, and I only ever answered the first one.** When an AI built the
same discount-code logic from my exact pseudocode, it returned
`{ discountedPrice: 85 }` where mine returns a plain `85`. Both are
defensible. My `OUTPUT` line said *what* comes back conceptually, never
*how* — plain value, or a labeled object. That's not the AI
misunderstanding me; that's me never having decided.

**The same gap showed up around dependencies.** My version takes the
discount-code list and the used-codes list in as direct inputs, so it can
run completely standalone. The AI's version assumes that data already
exists somewhere else in the file. My `INPUTS` line never actually said
the function needed to be self-contained — I just built it that way out
of habit, without writing the requirement down, so there was nothing
stopping a different, equally reasonable interpretation.

**Testing edge cases surfaces gaps that reading the pseudocode back never
would.** Running a negative order total through both implementations, I
found that it silently falls into the same "order too small" bucket as a
legitimately small order — technically correct, since a negative number
is always less than a minimum, but conceptually wrong, since a negative
total means something upstream already broke, not that the customer
under-ordered. Nothing in my original design treated that as its own
case. I didn't find this by rereading my spec. I found it by deliberately
trying an input I expected to be uninteresting.

**Independent pseudocode, done twice, catches real mistakes in the first
pass.** Pseudocoding `extractGeo` from `@upstash/ratelimit`, I wrote
"check whether it exists" — close, but the real check (`!== void 0`)
means a deliberately-set `null` still counts as present. And on `limit`,
I initially described a call as synchronous when it's actually an
unresolved promise being raced against a timeout — missing that detail
would have meant not understanding why the function is written the way
it is at all, not just a wording slip.

Across all of it, the pattern is the same: writing a plan down doesn't
automatically surface its own blind spots. Tracing it by hand, running it
for real, or handing it to something that will interpret it literally and
independently — those are what actually find the gaps. Pseudocode's value
isn't that it's more correct than code. It's that it's cheap enough to
stress-test before the cost of being wrong gets any higher.