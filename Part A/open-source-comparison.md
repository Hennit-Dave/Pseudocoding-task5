# Open-source comparison — @upstash/ratelimit

No AI used on the first pass for any of these three — pseudocode written
independently, then compared against my own explanation afterward.

## extractGeo (short)

```javascript
extractGeo(req) {
    if (req.geo !== void 0) {
      return req.geo;
    }
    if (req.cf !== void 0) {
      return req.cf;
    }
    return {};
  }
```

My original pseudocode said "check whether req.geo exists."
Correction after comparison: the actual check is `!== void 0` (not undefined) —
so a deliberately-set `null` still counts as "exists" and gets returned, rather
than falling through to check req.cf. Fixed wording: "check whether req.geo is
not undefined; if so, return it, even if its value is null."

## isBlocked (medium)

```javascript
isBlocked(identifier) {
  if (!this.cache.has(identifier)) {
    return { blocked: false, reset: 0 };
  }
  const reset = this.cache.get(identifier);
  if (reset < Date.now()) {
    this.cache.delete(identifier);
    return { blocked: false, reset: 0 };
  }
  return { blocked: true, reset };
}
```

No disagreement — original pseudocode matched the real behavior exactly,
including the delete-on-expiry side effect.

## limit (hard)

```javascript
limit = async (identifier, req) => {
    let timeoutId = null;
    try {
      const response = this.getRatelimitResponse(identifier, req);
      const { responseArray, newTimeoutId } = this.applyTimeout(response);
      timeoutId = newTimeoutId;
      const timedResponse = await Promise.race(responseArray);
      const finalResponse = this.submitAnalytics(timedResponse, identifier, req);
      return finalResponse;
    } finally {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    }
  };
```

Original pseudocode said "ask getRatelimitResponse() to check the rate limit,"
which skipped a real detail: that call has no `await`, so what's actually
passed to applyTimeout() is an unfinished Promise, not a resolved result.
applyTimeout() races that Promise against a timeout Promise via Promise.race().
If the call had been awaited first, the real result would already exist before
the race began, making the timeout pointless. This is the same applyTimeout()
function involved in the earlier timeout:0 investigation in this project.
