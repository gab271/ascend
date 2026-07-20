# Legal pages — developer notes

Not shown to users. Internal checklist for the four pages under `/legal/*`.

## Before publishing — required

Fill in `OPERATOR` in [`src/pages/legal/LegalLayout.jsx`](../src/pages/legal/LegalLayout.jsx):

| Field | Why it is required |
|---|---|
| `name` | LSSI-CE Art. 10 + GDPR Art. 13 (controller identity) |
| `taxId` | LSSI-CE Art. 10 — NIF/NIE |
| `address` | LSSI-CE Art. 10. Municipality + province is normally enough for a sole trader; you do not have to publish your home street address, but you must be locatable |
| `email` | LSSI-CE Art. 10 — must be a monitored address, since GDPR requires answering rights requests within one month |

Placeholders left in place are worse than no page at all: they show you knew the
obligation existed and skipped it.

## Status

These four pages are **drafted, not lawyer-reviewed.**

They are accurate about how ASCEND actually works — the data listed matches the
schema, the 30-day deletion window matches `request_account_deletion()` and the
purge job, and the cookie page matches the two real `localStorage` keys. That
accuracy is what most template policies get wrong, and it is worth a lot.

What it is not: a substitute for professional review.

## When you genuinely need a lawyer

Low risk right now — free service, no payments, no advertising, no data selling,
handful of users. The realistic exposure today is an AEPD complaint, and the
pages address the obligations that would be checked first.

Get a review **before** any of these:

1. **Taking money.** Subscriptions bring in consumer law (RDL 1/2007): the
   14-day right of withdrawal, pre-contractual information, renewal and
   cancellation terms. None of that is covered here. This is the big one.
2. **Adding analytics or any non-essential tracking.** You then need a real
   consent banner with granular opt-in, and the Cookie Policy becomes wrong.
3. **Registering as a company** rather than operating as an individual — the
   Legal Notice needs registry details.
4. **Processing data from minors under 14**, or marketing to schools.
5. **Adding social features** where users can message each other — that brings
   moderation duties and content-liability questions.

## Ongoing obligations

- **Records of processing (GDPR Art. 30).** Under 250 employees you are largely
  exempt, but not for regular processing. Keeping a one-page record of what you
  process and why is cheap insurance.
- **Breach notification.** 72 hours to the AEPD if personal data is exposed.
  Know in advance how you would find out.
- **Rights requests.** One month to respond. A data export feature would make
  portability requests trivial instead of manual.
- **Keep pages in sync with the code.** If you add a field to `profiles`, add it
  to the Privacy Policy. Section 2 currently lists every field you actually
  store — keep that true.

## Known gaps, deliberately left

- No right-of-withdrawal clause — the service is free, so it does not apply yet.
- No DPA reference with Supabase/Vercel. Both publish standard DPAs; accept them
  in your account settings and reference them here if you ever formalise.
- No data-export feature in the app, so portability requests are manual today.
