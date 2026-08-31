# VisibilityIQ Guided Setup — demo card

Prototype only. No backend. Refreshing the page resets everything.

| Type this account number | You get |
|---|---|
| `189189189` | No existing dashboards — the happy flow, straight through to Submit |
| `333333333` | Three existing dashboards — the "Existing Dashboards Detected" modal |
| `111111111` | One existing OneCare dashboard — the single-result modal |

Enter the number in **Account Number** and click out of the field (the lookup runs on **blur**).

Review mode: `/setup?mode=review`.

**Note:** state lives in memory only, so opening that URL in a fresh tab shows an
*empty* review — there is nothing entered yet. To show it populated, either fill
the form first and then add `?mode=review`, or jump straight to `/flow/R3`, which
seeds the form for you.

**To see every screen in one pass:** open `/flow`. Prev / Next (or the ← → keys) walk all 31
screens in the order they appear on the Figma canvas; the dropdown jumps straight to any one.
