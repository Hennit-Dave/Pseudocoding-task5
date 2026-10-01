# Part A3 — the planted bug

Function: `buildIdempotencyKey` logic inside `POST /api/orders`,
order-confirmation-jobs, `src/app/api/orders/route.ts`

Bug planted by a real peer (GitHub user devolagold), via pull request
#1 on the order-confirmation-jobs repo. The PR was not merged — it was
reviewed and closed without merging, since the point of this exercise
is the pseudocode comparison, not an actual code change to Task 2.

## A note on scope, stated honestly

The PR touched four files, not one. Three of them — a `findUnique` typo,
an `SMTP_PORT` typo, a `</button>` typo, and a whitespace-only change to
`for (;;)` — are either trivial typos that would crash loudly and
immediately, or have no behavioral effect at all. They weren't useful
for this exercise and are set aside here.

The real, subtle bug — and the one this writeup focuses on — is in the
idempotency key construction inside `orders/route.ts`. A second, related
change in the same file (the caught Prisma error code changing from
`P2002` to `P2001`) compounds it and is documented below as a secondary
finding.

## What it actually does now (buggy)

```
FUNCTION buildIdempotencyKey (current, bugged version)
INPUTS: the order's id
OUTPUT: a key string meant to identify this exact order submission

1. Take the order id
2. Attach the current exact moment in time, in milliseconds
   (this value changes on every single call, even milliseconds apart)
3. Combine both into one string
4. Return that string
```

**Trace:** the same order id, `"test-1"`, submitted twice a second apart:

- Call 1 → `order-confirmation:test-1:1790846153107`
- Call 2 → `order-confirmation:test-1:1790846153999`

Two different strings, for what should be recognized as the same request.

## What it should do (correct)

```
FUNCTION buildIdempotencyKey (correct version)
INPUTS: the order's id
OUTPUT: a key string meant to identify this exact order submission

1. Take the order id
2. Combine it with a fixed label — nothing that changes between calls
3. Return that string
```

**Trace:** the same order id, `"test-1"`, submitted twice:

- Call 1 → `order-confirmation:test-1`
- Call 2 → `order-confirmation:test-1`

Identical strings both times, which is what lets the database's
`UNIQUE` constraint on `idempotencyKey` actually catch a real duplicate.

## The bug, named

Appending `Date.now()` to the idempotency key defeats the entire purpose
of having one. Idempotency specifically means "doing the same thing
twice produces the same result" — a value that changes every
millisecond is the exact opposite of that property. Confirmed directly:

```
node -e "console.log(Date.now()); console.log(Date.now());"
1790846153107
1790846153116
```

Two calls, 9 milliseconds apart, two different numbers — proving the
key can never repeat, even for a genuine duplicate submission.

This bug would not show up in an ordinary test. Every `POST` still
returns `202 Accepted` successfully — the failure is invisible unless
you specifically check whether two submissions of the same order
created one job row or two.

## Secondary finding: the error code change

The same file's catch block also changed from checking
`err.code === 'P2002'` to `err.code === 'P2001'`. `P2002` is Prisma's
real code for a unique constraint violation. `P2001` means something
unrelated (a record not found during an update/delete). Even on the
rare chance the idempotency key did collide, this change means the
duplicate-handling branch would never fire — the error would propagate
as an unhandled crash instead of gracefully returning the existing job.

## Resolution

Task 2's actual `main` branch was never modified by this PR — the bug
only ever existed in a separate local branch and the now-closed,
unmerged pull request. No fix was needed in the real codebase; the
pseudocode comparison above is the deliverable for this part of Task 5.
