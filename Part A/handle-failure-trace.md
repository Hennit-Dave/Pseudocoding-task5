# handleFailure — pseudocode and trace

Source: order-confirmation-jobs, worker.ts

## Pseudocode

FUNCTION handleFailure
INPUTS: the job that failed, and the error message describing why
OUTPUT: nothing
SIDE EFFECTS: updates the job's row in the database
FAILS WHEN: never — this function IS the failure-handling path

1. IF the job has already used up all its allowed attempts
     Mark the job as dead (it stops retrying automatically and waits for a human to look at it)
     Save the error message and the time it finished
     RETURN
2. OTHERWISE (it hasn't reached its limit yet):
     Work out the wait time: it doubles with each attempt, plus a small random extra amount
     Mark the job as failed, save the error message, and set when it should retry

## Trace table

Situation 1 (normal): 1 attempt used, limit of 5
→ Step 1: 1 is less than 5, so it hasn't used up its attempts
→ Result: marked failed, gets a doubled wait time, will retry later
→ Confirmed against real code: yes (the backoff timestamps from earlier testing)

Situation 2 (last try): 5 attempts used, limit of 5
→ Step 1: 5 already equals 5, attempts are used up
→ Result: marked dead
→ Confirmed against real code: yes (the forced-failure test and dead-letters screenshot)

Situation 3 (tight limit): 1 attempt used, limit of 1
→ Step 1: 1 already equals 1, attempts are used up
→ Result: marked dead on the very first failure
→ Confirmed against real code: yes (job cmumlj2dl0000adgjgigip7c0 — claimed once,
  failed once, "exhausted 1/1 attempts, marked dead", no retry in between)
