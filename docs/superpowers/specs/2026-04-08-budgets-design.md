# Budgets Feature Design

**Date:** 2026-04-08  
**Status:** Approved

## Overview

A monthly spending budget across all wallets. Displays progress on the dashboard and analytics page, warns users when a transaction would exceed the budget, and resets automatically each month while preserving history.

---

## Data Model

New `budgets` table added to `convex/schema.ts`:

```ts
budgets: defineTable({
  userId: v.id('users'),
  amount: v.number(),        // budget limit for this month
  month: v.number(),         // 1–12
  year: v.number(),          // e.g. 2026
  spent: v.number(),         // cached sum of withdrawals/outgoing e-transfers
})
  .index('by_userId', ['userId'])
  .index('by_userId_month_year', ['userId', 'month', 'year'])
```

- One row per user per month
- `spent` is updated incrementally on every relevant transaction mutation (not recomputed from scratch)
- On the 1st of each month, a Convex cron creates the new month's row: copies `amount` from the previous month, resets `spent` to 0

---

## Backend

New file: `convex/budgets.ts`

| Function | Type | Description |
|---|---|---|
| `getCurrentBudget` | query | Fetch current month's budget row for the authenticated user |
| `getBudgetHistory` | query | Fetch all past budget rows for the user, ordered by year/month |
| `setBudget` | mutation | Set or update `amount` for the current month; creates row if it doesn't exist |
| `updateSpent` | internalMutation | Increment/decrement `spent` by a delta; called by transaction mutations |
| `createNextMonthBudget` | internalMutation | Called by cron on 1st of month; copies `amount`, resets `spent` to 0 |

**Changes to `convex/transactions.ts`:**
- After creating a withdrawal or outgoing e-transfer: call `ctx.runMutation(internal.budgets.updateSpent, { delta: amount })`
- After soft-deleting a withdrawal or outgoing e-transfer: call `updateSpent` with a negative delta to reverse it

---

## Frontend

### Dashboard — `BudgetCard`

New component `src/features/dashboard/components/budget-card.tsx`:
- Shows budget amount, amount spent, amount remaining
- Progress bar: green below 80%, yellow 80–99%, red at 100%+
- Inline edit to update budget amount (calls `setBudget`)
- If no budget is set, shows a prompt to create one

### Analytics Page

Add a budget section to `src/features/analytics/index.tsx`:
- Current month progress bar (same as dashboard)
- Bar chart (Recharts) of budget vs. actual spend per month, using `getBudgetHistory`

### Transaction Warning

In the submit handler of:
- `src/features/dashboard/components/withdraw-dialog.tsx`
- `src/features/e-transfers/components/send-e-transfer-dialog.tsx`

Before submitting, check if `currentBudget.spent + amount > currentBudget.amount`. If so, show a confirmation dialog: *"This will exceed your monthly budget. Continue?"* User can proceed or cancel.

---

## Monthly Reset (Cron)

A Convex cron job runs on the 1st of each month (midnight UTC) and calls `internal.budgets.createNextMonthBudget` for all users who have an existing budget. This ensures continuity — users don't need to re-enter their budget each month.

Users can manually override the `amount` at any time via the `BudgetCard`.

---

## Error Handling

- If no budget exists for the current month, `getCurrentBudget` returns `null` — UI shows a "Set a budget" prompt
- `updateSpent` is an internal function only; never exposed to the client directly
- Transaction warning is advisory only — users can always proceed past it
