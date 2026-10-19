# Lead form delivery setup

This change routes the **Distributor** and **Supplier** forms through `api/lead.php`. It preserves the existing section design and asset paths.

## Server requirements

The website host must support PHP 8.1+ with the cURL extension, sessions, and configured outbound email for PHP `mail()`. This is not compatible with a static-only host unless the endpoint is deployed on a PHP-capable backend and the frontend endpoint URL is adjusted accordingly.

Configure these environment variables on the server (never in HTML or JavaScript):

- `KLAVIYO_PRIVATE_API_KEY`: a private Klaviyo API key with `profiles:write` and `lists:write` scopes.
- `KLAVIYO_DISTRIBUTOR_LIST_ID`: the actual ID of the existing **Distributor Leads** list.
- `KLAVIYO_SUPPLIER_LIST_ID`: the actual ID of the existing **Supplier Leads** list.
- `NOTIFICATION_EMAIL`: `info@unitedspiritshk.com`.
- `MAIL_FROM`: an address verified/authorised for sending on the hosting domain.

Do not use list names as list IDs. Confirm the IDs in Klaviyo before enabling the endpoint. The code uses Klaviyo API revision `2026-07-15` and the profile-import endpoint followed by the add-profile-to-list endpoint.

## Behaviour and privacy

- Distributor and Supplier forms validate required fields and require agreement to use the submitted details to respond to the enquiry.
- The backend writes the profile and form fields to the appropriate Klaviyo list, then sends a notification email.
- Adding a profile to a Klaviyo list does **not** by itself grant marketing-email consent. Configure marketing flows to respect the contact's actual subscription status.
- The success message is displayed only when the API and email handoff both report success. If the list save fails, the form reports an error. If the list save succeeds but mail fails, the response explicitly reports that partial state.
- The endpoint has a honeypot, basic same-session throttling, request-size checks, input validation, and origin allowlisting. These are lightweight safeguards, not a replacement for edge-level rate limiting.
- PHP `mail()` returning true means the host accepted the message for delivery, not that the recipient's inbox received it. Verify SPF/DKIM/DMARC and actual delivery on the production host.

## Pre-deployment checklist

1. Confirm the host runs PHP 8.1+ and `curl` is enabled.
2. Add the five environment variables above in the host's server-side configuration.
3. Verify the two Klaviyo list IDs and API-key scopes.
4. Submit one test for each form using an internal test address.
5. Confirm each test appears on the correct list, the inbox receives the notification, and failures do not show a false success.
6. Confirm that marketing flows do not message enquiry contacts unless their marketing consent status allows it.

Until those host-side settings and live end-to-end tests are completed, the integration is **prepared but not production-verified**.
