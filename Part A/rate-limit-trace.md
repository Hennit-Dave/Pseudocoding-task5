# rateLimit — pseudocode and trace

Source: freelance-marketplace-api, src/lib/rate-limit.ts

## Pseudocode

FUNCTION rateLimit
INPUTS: the incoming request
OUTPUT: nothing if the visitor is allowed through, or an error response if not
SIDE EFFECTS: talks to Upstash to check and record the request count
FAILS WHEN: the rate limiter isn't configured correctly, or Upstash can't be reached

1. Check whether the rate limiter is configured correctly.
   IF it isn't configured correctly
     Record the problem
     RETURN a 503 error
2. Look inside the request and get the visitor's IP address, and check that it is a valid IP.
   IF the IP is not valid, use the word 'unknown' instead, so all visitors without
   a real IP share one limit together.
3. CALL the rate limiter to ask whether this visitor is still within the allowed
   number of requests (may be slow, may fail)
4. IF the visitor has made too many requests
     RETURN a 429 error: "You've made too many requests. Try again in [wait time] seconds."
5. IF the rate limiter itself breaks or can't be reached
     RETURN a 503 error

## Trace table

Situation 1 (normal): visitor with 5 requests this minute
→ Step 4: 5 is not more than 100, so it's not too many
→ Result: request goes through normally
→ Confirmed against real code: yes (ordinary curl requests throughout this project)

Situation 2 (edge case): visitor with 101 requests this minute
→ Step 4: 101 is more than 100, too many
→ Result: 429 error
→ Confirmed against real code: yes (the burst test, 100 succeeded then 429s)

Situation 3 (invalid): request with no IP address
→ Step 2: IP isn't valid, so it uses "unknown" instead
→ Step 4: assuming "unknown" hasn't hit its limit yet, not too many
→ Result: request goes through normally
→ Gap found while tracing: the original pseudocode never said what happens
  when the IP is invalid — added the "use 'unknown'" line after catching this
→ Confirmed against real code: yes (curl with no -H header, ran locally, returned 200 OK)
