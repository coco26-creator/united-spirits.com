# Lead form delivery setup

The Distributor and Supplier forms post to `/api/lead`, implemented as a Vercel Node.js serverless function. The existing site design and asset paths are preserved.

## Vercel environment variables

Configure these in **Vercel → Project Settings → Environment Variables** for the Production environment (and Preview if testing previews):

- `KLAVIYO_PRIVATE_API_KEY`: a private Klaviyo API key with `profiles:write` and `lists:write` scopes.
- `KLAVIYO_DISTRIBUTOR_LIST_ID`: the actual ID of the existing **Distributor Leads** list.
- `KLAVIYO_SUPPLIER_LIST_ID`: the actual ID of the existing **Supplier Leads** list.
- `RESEND_API_KEY`: an API key for Resend, used for the notification email.
- `MAIL_FROM`: a sender identity verified in Resend, e.g. a website notifications address on a domain you control.
- `NOTIFICATION_EMAIL`: `info@unitedspiritshk.com`.
- `ALLOWED_ORIGINS` (optional): comma-separated exact origins. Defaults to `https://www.unitedspiritshk.com,https://unitedspiritshk.com`. Set this for preview domains only when testing them.

Do not use list names as list IDs. Confirm the IDs in Klaviyo and the sender domain in Resend before enabling live submissions. The endpoint uses Klaviyo API revision `2026-07-15`.

## Behaviour and privacy

- Both forms validate required fields and require agreement to use the submitted details to respond to the enquiry.
- The backend writes the profile and form fields to the correct Klaviyo list, then sends a notification email to `info@unitedspiritshk.com`.
- Adding a profile to a Klaviyo list does **not** by itself grant marketing-email consent. Ensure marketing flows respect the contact's actual subscription status.
- The frontend shows success only after both the Klaviyo list write and email provider accept the notification. If the email fails after Klaviyo succeeds, the response explicitly reports that partial state.
- A honeypot, request-size checks, input validation, and origin allowlisting are included. Add Vercel Firewall/rate limiting if the forms receive abuse; the endpoint does not rely on in-memory rate limits.
- A successful Resend API response means the provider accepted the email request, not that the recipient's inbox received it. Verify domain authentication (SPF/DKIM/DMARC) and actual delivery.

## Pre-deployment checklist

1. Add the required environment variables in Vercel and redeploy so the function receives them.
2. Confirm both Klaviyo list IDs and the private API key scopes.
3. Verify the sender domain in Resend and check email authentication records.
4. Submit one test to each form using an internal test address.
5. Confirm each test appears on the correct list, the inbox receives its notification, and failures do not show a false success.
6. Confirm marketing flows do not message enquiry contacts unless their marketing consent status allows it.

Until the host-side settings are configured and both forms pass live end-to-end tests, the integration is **prepared but not production-verified**.
